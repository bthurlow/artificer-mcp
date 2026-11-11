import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { extname } from 'node:path';
import { z } from 'zod';
import { registerTool } from '../../utils/register.js';
import { resolveInput } from '../../utils/resource.js';
import { downloadAndWrite } from '../utils/download-and-write.js';
import { defaultBasename, joinOutput } from '../fal/separation.js';
import {
  MVSEP_OUTPUT_FORMATS,
  type MvsepFile,
  type MvsepOutputFormat,
  createSeparation,
  extractMvsepFiles,
  requireMvsepToken,
  waitForSeparation,
} from './client.js';

/** MVSep "Male/Female separation". */
export const MALE_FEMALE_SEP_TYPE = 57;

/**
 * Defaults for sep_type 57, proven on a duet (btmusic Album 4 t06): MelRoformer
 * 2025.01 (add_opt1 2, MVSep's best SDR) with "extract vocals first with BS
 * Roformer" (add_opt2 1), the full master in. Wrong-singer leakage was −29 to
 * −61 dB in solo sections and overlapping lines split one voice per stem.
 */
const MALE_FEMALE_DEFAULTS = { add_opt1: '2', add_opt2: '1' };

export interface MvsepSeparateAudioParams {
  audio?: string;
  hash?: string;
  output_dir: string;
  basename?: string;
  sep_type: number;
  add_opt1?: string | number;
  add_opt2?: string | number;
  add_opt3?: string | number;
  output_format: MvsepOutputFormat;
  poll_timeout_seconds: number;
}

const opt = z.union([z.string(), z.number()]).optional();

export const mvsepSeparateAudioSchema = z.object({
  audio: z
    .string()
    .optional()
    .describe(
      'Audio to separate (path or URI). Local files and gs:// / s3:// URIs are uploaded; a public https URL is passed for MVSep to fetch. For a duet, send the full master. Exactly one of audio or hash.',
    ),
  hash: z
    .string()
    .optional()
    .describe(
      'Collect an earlier job instead of starting one: the hash from a previous call (it is sent as a progress message and named in timeout errors). Jobs live in the region that created them, so use the same MVSEP_API_URL.',
    ),
  output_dir: z
    .string()
    .describe(
      'Directory (local path or storage URI) for the stems, each saved as <basename>-<stem>.<ext>, e.g. song-male.wav and song-female.wav.',
    ),
  basename: z
    .string()
    .optional()
    .describe(
      'File name prefix. Defaults to the input file name without its extension (or the hash).',
    ),
  sep_type: z
    .number()
    .int()
    .default(MALE_FEMALE_SEP_TYPE)
    .describe(
      'MVSep algorithm. 57 (default) = Male/Female separation: one stem per singer of a duet, which Demucs cannot do. Other ids and their add_opt meanings: GET https://mvsep.com/api/app/algorithms.',
    ),
  add_opt1: opt.describe(
    'Algorithm option 1. For sep_type 57 the model: 2 = MelRoformer 2025.01 (default, best), 1 = SCNet XL, 3 = BSRoformer aufr33, 0 = BSRoformer Sucial.',
  ),
  add_opt2: opt.describe(
    'Algorithm option 2. For sep_type 57: 1 = extract vocals first with BS Roformer (default), 0 = separate directly from the mix.',
  ),
  add_opt3: opt.describe('Algorithm option 3, where the algorithm has one.'),
  output_format: z
    .enum(Object.keys(MVSEP_OUTPUT_FORMATS) as [MvsepOutputFormat, ...MvsepOutputFormat[]])
    .default('wav16')
    .describe(
      'Stem format. wav16 (default) keeps lip-sync and editing lossless; WAV needs a registered account.',
    ),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(1800)
    .describe(
      'Maximum seconds to wait for the job, queue plus processing. Default 1800 (free accounts queue). On timeout the job is cancelled on MVSep (refunded if it had not started) and the error names its hash.',
    ),
});

/**
 * Stem name from MVSep's file name: its last "_" token, e.g.
 * "song_male_female_mt_2_male.wav" → "male". Falls back to "stem<n>" and
 * de-duplicates, so every file is written.
 */
export function stemNames(files: MvsepFile[]): string[] {
  const used = new Set<string>();
  return files.map((f, i) => {
    const name = f.download.slice(0, f.download.length - extname(f.download).length);
    let stem = (name.split('_').pop() ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '');
    if (!stem || used.has(stem)) stem = `${stem || 'stem'}${i + 1}`;
    used.add(stem);
    return stem;
  });
}

const EXT_MIME: Record<string, string> = {
  wav: 'audio/wav',
  flac: 'audio/flac',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
};

export function registerMvsepTools(server: McpServer): void {
  registerTool<MvsepSeparateAudioParams>(
    server,
    'mvsep_separate_audio',
    "Separate audio with MVSep (mvsep.com). Default: Male/Female separation (sep_type 57), one stem per singer of a duet, which fal's Demucs cannot do (it puts both singers in one vocals stem). Writes <basename>-<stem>.<ext> per stem into output_dir (e.g. male, female) and returns the stem → path map. A separator can still route an odd line to the wrong stem, so gate each stem to its singer's lines with audio_gate before lip-sync. Jobs are never published to MVSep's demo page. Uses MVSEP_API_TOKEN env var.",
    mvsepSeparateAudioSchema.shape,
    async (params, extra) => {
      const { audio, hash: resumeHash, output_dir, sep_type, output_format } = params;
      if ((audio === undefined) === (resumeHash === undefined)) {
        throw new Error('mvsep_separate_audio: pass exactly one of `audio` or `hash`.');
      }
      const token = requireMvsepToken();

      let hash = resumeHash;
      if (!hash) {
        const defaults = sep_type === MALE_FEMALE_SEP_TYPE ? MALE_FEMALE_DEFAULTS : {};
        const pick = (key: 'add_opt1' | 'add_opt2' | 'add_opt3'): string | undefined => {
          const v = params[key] ?? (defaults as Record<string, string | undefined>)[key];
          return v === undefined ? undefined : String(v);
        };
        const addOpts = {
          add_opt1: pick('add_opt1'),
          add_opt2: pick('add_opt2'),
          add_opt3: pick('add_opt3'),
        };
        if (/^https:\/\//i.test(audio as string)) {
          hash = await createSeparation({
            token,
            audio: { url: audio as string },
            sepType: sep_type,
            addOpts,
            outputFormat: output_format,
          });
        } else {
          const r = await resolveInput(audio as string);
          try {
            hash = await createSeparation({
              token,
              audio: { path: r.localPath },
              sepType: sep_type,
              addOpts,
              outputFormat: output_format,
            });
          } finally {
            await r.cleanup?.();
          }
        }
        console.error(`mvsep_separate_audio: submitted, hash ${hash}`);
        const progressToken = extra?._meta?.progressToken;
        if (progressToken !== undefined && extra?.sendNotification) {
          await extra
            .sendNotification({
              method: 'notifications/progress',
              params: { progressToken, progress: 0, message: `MVSep job ${hash} submitted` },
            })
            .catch(() => undefined);
        }
      }

      const done = await waitForSeparation({
        tool: 'mvsep_separate_audio',
        token,
        hash,
        timeoutSeconds: params.poll_timeout_seconds,
        extra,
      });
      const files = extractMvsepFiles(done.data);
      if (files.length === 0) {
        throw new Error(`mvsep_separate_audio: job ${hash} finished with no output files.`);
      }

      const prefix = params.basename ?? (audio ? defaultBasename(audio) : hash);
      const names = stemNames(files);
      const stems: Record<string, string> = {};
      for (const [i, f] of files.entries()) {
        const ext = (extname(f.download).slice(1) || 'wav').toLowerCase();
        const path = joinOutput(output_dir, `${prefix}-${names[i]}.${ext}`);
        await downloadAndWrite(f.url, path, { defaultMime: EXT_MIME[ext] ?? 'audio/wav' });
        stems[names[i]] = path;
      }
      const algorithm = done.data['algorithm'];
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                hash,
                sep_type,
                ...(typeof algorithm === 'string' ? { algorithm } : {}),
                stems,
                source_files: files.map((f) => f.download),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
