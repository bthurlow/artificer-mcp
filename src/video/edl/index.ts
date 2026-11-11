import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import { registerTool } from '../../utils/register.js';
import { ffmpeg, getVideoInfo } from '../../utils/exec-ffmpeg.js';
import { tempPath } from '../../utils/exec.js';
import { resolveInput, resolveOutput } from '../../utils/resource.js';
import { parseScheme } from '../../storage/providers/registry.js';
import {
  type BeatSource,
  type FilterGraph,
  buildBatchGraphs,
  buildFilterGraph,
  buildJoinGraph,
  planEdl,
  shotsPerPass,
} from './plan.js';
import {
  type Edl,
  type VideoAssembleEdlParams,
  edlSchema,
  videoAssembleEdlSchema,
} from './schema.js';

/** A long music video at 1080p can take a while; bound it generously. */
const RENDER_TIMEOUT_MS = 60 * 60 * 1000;

/** Resolve a path in the EDL against the EDL file's folder (or the working directory). */
function makeResolver(base: string | undefined): (p: string) => string {
  return (p) => {
    if (!base || parseScheme(p) !== null || isAbsolute(p)) return p;
    return parseScheme(base) !== null ? `${base.replace(/\/$/, '')}/${p}` : join(base, p);
  };
}

/**
 * Run one filter graph. The graph goes through a file: a long EDL overflows
 * Windows' 32K command line. -filter_complex_script is deprecated in ffmpeg
 * 7+ in favour of -/filter_complex, but the README supports ffmpeg 6.
 */
async function runGraph(
  graph: Pick<FilterGraph, 'inputs' | 'filter' | 'video'> & { audio?: string },
  outputArgs: string[],
  temps: string[],
): Promise<void> {
  const script = tempPath('.ffgraph');
  temps.push(script);
  await writeFile(script, graph.filter);
  const args = ['-y', '-v', 'error', '-nostdin'];
  for (const input of graph.inputs) args.push(...input.options, '-i', input.path);
  args.push('-filter_complex_script', script, '-map', graph.video);
  if (graph.audio) args.push('-map', graph.audio);
  args.push(...outputArgs);
  await ffmpeg(args, { timeout: RENDER_TIMEOUT_MS });
}

async function readJson(uri: string): Promise<unknown> {
  const r = await resolveInput(uri);
  try {
    return JSON.parse(await readFile(r.localPath, 'utf8')) as unknown;
  } finally {
    await r.cleanup?.();
  }
}

/** The beat grid from `beat_grid` and/or `beats`, with the EDL's own fields taking precedence. */
async function loadBeatSource(
  edl: Edl,
  rel: (p: string) => string,
): Promise<BeatSource | undefined> {
  let beats: number[] | undefined;
  let kickRef: number | undefined;
  let offset: number | undefined;
  let beatsPerBar: number | undefined;
  if (edl.beat_grid) {
    const g = (await readJson(rel(edl.beat_grid))) as {
      beats?: number[];
      kick_ref?: number | null;
      offset_s?: number;
      beats_per_bar?: number;
    };
    if (!Array.isArray(g.beats)) {
      throw new Error(
        `video_assemble_edl: ${edl.beat_grid} has no beats array (expected audio_beat_grid output).`,
      );
    }
    beats = g.beats;
    kickRef = g.kick_ref ?? undefined;
    offset = g.offset_s;
    beatsPerBar = g.beats_per_bar;
  }
  if (edl.beats !== undefined) {
    const b = typeof edl.beats === 'string' ? await readJson(rel(edl.beats)) : edl.beats;
    if (!Array.isArray(b) || !b.every((x) => typeof x === 'number')) {
      throw new Error(
        'video_assemble_edl: `beats` must be an array of numbers (or a JSON file holding one).',
      );
    }
    beats = b;
  }
  if (!beats) return undefined;
  return {
    beats,
    kickRef: edl.kick_ref ?? kickRef,
    offset: edl.beat_offset ?? offset ?? 0,
    beatsPerBar: edl.beats_per_bar ?? beatsPerBar ?? 4,
  };
}

/** Register video_assemble_edl (TODO #33). */
export function registerAssembleEdlTool(server: McpServer): void {
  registerTool<VideoAssembleEdlParams>(
    server,
    'video_assemble_edl',
    'Assemble a music-video cut from an edit decision list in SONG time: segments are ranges of the master audio, each holding shots that play a clip from a song time, with lip-synced clips kept in sync via clip_song_start. Per-shot transition ("cut" or "flash"), static punch-in zoom, and cut times snapped to the beat grid (beat_grid = audio_beat_grid output; snap "kick" for downbeats, "half" for kick + mid-bar). Shots are placed frame-exact on the output timeline, so cuts and lip-sync do not drift. Checks every shot before rendering and reports all problems at once. Output: H.264/AAC MP4.',
    videoAssembleEdlSchema.shape,
    async ({ edl: inline, edl_path, output }) => {
      if ((inline === undefined) === (edl_path === undefined)) {
        throw new Error('video_assemble_edl: pass exactly one of `edl` or `edl_path`.');
      }
      const raw = inline ?? (await readJson(edl_path as string));
      const parsed = edlSchema.safeParse(raw);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(
          (i) => `${i.path.join('.') || '(root)'}: ${i.message}`,
        );
        throw new Error(`video_assemble_edl: invalid EDL:\n- ${issues.join('\n- ')}`);
      }
      const edl = parsed.data;
      const base = edl_path
        ? parseScheme(edl_path) !== null
          ? edl_path.slice(0, edl_path.lastIndexOf('/'))
          : dirname(edl_path)
        : undefined;
      const rel = makeResolver(base);

      const grid = await loadBeatSource(edl, rel);

      const clipNames = [...new Set(edl.segments.flatMap((s) => s.shots.map((sh) => sh.clip)))];
      const resolved = new Map<string, Awaited<ReturnType<typeof resolveInput>>>();
      const durations = new Map<string, number | undefined>();
      const audioR = await resolveInput(rel(edl.audio));
      const outR = await resolveOutput(output);
      const temps: string[] = [];
      try {
        const problems: string[] = [];
        await Promise.all(
          clipNames.map(async (clip) => {
            try {
              const r = await resolveInput(rel(clip));
              resolved.set(clip, r);
              durations.set(clip, (await getVideoInfo(r.localPath)).durationSeconds || undefined);
            } catch (err) {
              problems.push(
                `clip ${clip}: cannot be read (${(err as Error).message.split('\n')[0]}).`,
              );
            }
          }),
        );
        const audioDuration = (await getVideoInfo(audioR.localPath)).durationSeconds || undefined;

        const { plan, errors } = planEdl(edl, {
          clipDuration: (c) => durations.get(c),
          audioDuration,
          grid,
        });
        problems.push(...errors);
        if (problems.length > 0) {
          throw new Error(
            `video_assemble_edl: ${problems.length} problem(s) in the EDL, nothing rendered:\n- ${problems.join('\n- ')}`,
          );
        }

        const clipPath = (c: string): string =>
          (resolved.get(c) as { localPath: string }).localPath;
        await mkdir(dirname(outR.localPath), { recursive: true });

        let graph: FilterGraph;
        let passes = 1;
        if (plan.shots.length <= shotsPerPass()) {
          graph = buildFilterGraph(plan, { audio: audioR.localPath, clip: clipPath });
        } else {
          // Batches go to lossless H.264 (qp 0), so the join pass sees the
          // same frames a single pass would.
          const files: string[] = [];
          for (const batch of buildBatchGraphs(plan, clipPath)) {
            const file = tempPath('.mkv');
            temps.push(file);
            await runGraph(
              batch,
              ['-c:v', 'libx264', '-qp', '0', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', file],
              temps,
            );
            files.push(file);
          }
          graph = buildJoinGraph(plan, audioR.localPath, files);
          passes = files.length + 1;
        }
        await runGraph(
          graph,
          [
            '-c:v',
            'libx264',
            '-crf',
            String(edl.crf),
            '-preset',
            edl.preset,
            '-pix_fmt',
            'yuv420p',
            '-c:a',
            'aac',
            '-b:a',
            '192k',
            '-ar',
            '48000',
            '-movflags',
            '+faststart',
            outR.localPath,
          ],
          temps,
        );
        await outR.commit();

        const shots = plan.shots.map((s) => ({
          segment: s.segment,
          shot: s.index,
          clip: s.clip,
          song_start: Number(s.songStart.toFixed(3)),
          ...(s.requestedStart !== undefined ? { requested_start: s.requestedStart } : {}),
          out_start: Number((s.outFrame / plan.fps).toFixed(3)),
          frames: s.frames,
          in: s.transition,
        }));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  output,
                  duration_s: Number((plan.totalFrames / plan.fps).toFixed(3)),
                  frames: plan.totalFrames,
                  fps: plan.fps,
                  size: `${plan.width}x${plan.height}`,
                  passes,
                  shots,
                },
                null,
                2,
              ),
            },
          ],
        };
      } finally {
        await Promise.all(temps.map((t) => rm(t, { force: true })));
        await Promise.all([...resolved.values()].map((r) => r.cleanup?.()));
        await audioR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );
}
