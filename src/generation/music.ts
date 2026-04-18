import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { extname } from 'node:path';
import { rm, writeFile, readFile } from 'node:fs/promises';
import { registerTool } from '../utils/register.js';
import { getGenAIClient, getGenAIClientForLive } from './client.js';
import { ffmpegBatch } from '../utils/exec-ffmpeg.js';
import { tempPath } from '../utils/exec.js';
import { getProvider } from '../storage/providers/registry.js';
import {
  type GenerateMusicParams,
  type GenerateMusicLiveParams,
  generateMusicSchema,
  generateMusicLiveSchema,
} from './types.js';

/**
 * Parse a Gemini audio MIME type like "audio/L16;rate=48000;channels=2" into
 * sample rate + channel count. Lyria RealTime emits 48 kHz stereo 16-bit PCM;
 * Lyria 3 batch returns a complete WAV/MP3 container so this is only used
 * for the realtime path.
 */
function parsePcmMime(mime: string | undefined): { sampleRate: number; channels: number } {
  const defaults = { sampleRate: 48000, channels: 2 };
  if (!mime) return defaults;
  const rate = /rate=(\d+)/i.exec(mime)?.[1];
  const channels = /channels?=(\d+)/i.exec(mime)?.[1];
  return {
    sampleRate: rate ? Number(rate) : defaults.sampleRate,
    channels: channels ? Number(channels) : defaults.channels,
  };
}

/** Wrap raw PCM16 LE in a minimal WAV header. */
function pcmToWav(pcm: Buffer, sampleRate: number, channels: number): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/**
 * Write an audio Buffer to the output URI. If the extension is anything
 * other than .wav, transcode via ffmpeg.
 */
async function writeAudio(
  bytes: Buffer,
  isWav: boolean,
  output: string,
  mimeHint: string,
): Promise<void> {
  const ext = extname(output).toLowerCase();
  const nativeExt = isWav ? '.wav' : '.mp3';
  if (ext === nativeExt || ext === '') {
    await getProvider(output).write(output, bytes, mimeHint);
    return;
  }
  const tmpIn = tempPath(nativeExt);
  const tmpOut = tempPath(ext);
  try {
    await writeFile(tmpIn, bytes);
    await ffmpegBatch(['-y', '-i', tmpIn, tmpOut]);
    const out = await readFile(tmpOut);
    await getProvider(output).write(output, out);
  } finally {
    await rm(tmpIn, { force: true }).catch(() => {});
    await rm(tmpOut, { force: true }).catch(() => {});
  }
}

/**
 * Core Lyria 3 batch generation. Shared between the `gemini_generate_music`
 * MCP tool and workflows that embed music generation. Throws on failure.
 * Returns the summary lines (bytes, mime, optional structure text).
 */
export async function generateMusicBatchToFile(params: {
  model: string;
  prompt: string;
  output: string;
  negative_prompt?: string;
}): Promise<string[]> {
  const client = getGenAIClient();

  // Lyria 3 returns audio as inlineData with its own mimeType (mp3 for
  // clip, wav for pro). The generation_config.response_mime_type field
  // only accepts text mimetypes, so we MUST NOT set it.
  const isPro = /pro/i.test(params.model);
  const fallbackMime = isPro ? 'audio/wav' : 'audio/mp3';

  const combinedPrompt = params.negative_prompt
    ? `${params.prompt}\n\nAvoid: ${params.negative_prompt}`
    : params.prompt;

  const config: Record<string, unknown> = {
    responseModalities: ['AUDIO', 'TEXT'],
  };

  const response = await client.models.generateContent({
    model: params.model,
    contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
    config,
  } as unknown as Parameters<typeof client.models.generateContent>[0]);

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const lines: string[] = [];
  let wrote = false;
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    const text = (part as { text?: string }).text;
    if (inline?.data) {
      const bytes = Buffer.from(inline.data, 'base64');
      const mime = inline.mimeType ?? fallbackMime;
      const isWav = /wav/i.test(mime);
      await writeAudio(bytes, isWav, params.output, mime);
      wrote = true;
      lines.push(`Music: ${bytes.length} bytes, ${mime} → ${params.output}`);
    } else if (text) {
      lines.push(`Text (structure/lyrics): ${text}`);
    }
  }

  if (!wrote) {
    const finishReason = candidate?.finishReason;
    const safety = candidate?.safetyRatings
      ?.filter((r) => r.blocked)
      ?.map((r) => r.category)
      ?.join(', ');
    const reason =
      safety && safety.length > 0
        ? `blocked by safety filter (${safety})`
        : finishReason
          ? `finishReason=${finishReason}`
          : 'no audio data returned';
    throw new Error(`No music was generated — ${reason}.`);
  }
  return lines;
}

/**
 * Register Lyria music generation tools — batch (synchronous) and realtime
 * (streaming WebSocket). Batch is the default for music-bed use cases since
 * it's simpler and has deterministic wall-clock behavior; realtime is for
 * interactive/long-form streaming.
 */
export function registerMusicGenTools(server: McpServer): void {
  // ── gemini_generate_music (Lyria 3 batch) ─────────────────────────────
  registerTool<GenerateMusicParams>(
    server,
    'gemini_generate_music',
    'Generate music synchronously via Lyria 3 (batch). Returns a 30s clip for lyria-3-clip-preview or up to ~2min (prompt-driven) for lyria-3-pro-preview. Uses GOOGLE_API_KEY. For live/interactive streaming, use gemini_generate_music_live.',
    generateMusicSchema.shape,
    async ({ model, prompt, output, negative_prompt }) => {
      try {
        const lines = await generateMusicBatchToFile({ model, prompt, output, negative_prompt });
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (e) {
        return {
          content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }],
        };
      }
    },
  );

  // ── gemini_generate_music_live (Lyria RealTime) ─────────────────────────
  registerTool<GenerateMusicLiveParams>(
    server,
    'gemini_generate_music_live',
    'Generate music via Lyria RealTime (WebSocket streaming). Opens a session, sends weighted prompt, collects audio chunks for duration_seconds, then force-closes. Enforces a hard wall-clock timeout so the tool will always return. Uses GOOGLE_API_KEY. For simpler one-shot music beds, prefer gemini_generate_music (Lyria 3 batch).',
    generateMusicLiveSchema.shape,
    async ({ model, prompt, output, duration_seconds, temperature, seed, guidance }) => {
      // Live/streaming APIs require v1alpha — the default v1beta has no
      // live.music endpoint and connect() will hang until the deadline.
      const client = getGenAIClientForLive();

      // Hard wall-clock deadline — if anything hangs (setup, prompts, close),
      // the tool gives up and reports what it has.
      const HARD_DEADLINE_MS = duration_seconds * 1000 + 15_000;
      const startedAt = Date.now();
      const deadlineAt = startedAt + HARD_DEADLINE_MS;

      const withTimeout = async <T>(promise: Promise<T>, labelRemain: string): Promise<T> => {
        const remain = Math.max(500, deadlineAt - Date.now());
        return Promise.race([
          promise,
          new Promise<T>((_resolve, reject) => {
            setTimeout(
              () => reject(new Error(`Lyria realtime: ${labelRemain} exceeded hard deadline`)),
              remain,
            );
          }),
        ]);
      };

      const chunks: Buffer[] = [];
      const errRef: { current: Error | undefined } = { current: undefined };
      let mimeType: string | undefined;
      let setupComplete = false;
      let filteredReason: string | undefined;
      let closed = false;
      let resolveClose: () => void = () => {};
      const closePromise = new Promise<void>((r) => {
        resolveClose = r;
      });

      let session: Awaited<ReturnType<typeof client.live.music.connect>> | null = null;
      try {
        session = await withTimeout(
          client.live.music.connect({
            model,
            callbacks: {
              onmessage: (msg) => {
                if (msg.setupComplete) setupComplete = true;
                if (msg.filteredPrompt) {
                  filteredReason = `filtered: ${JSON.stringify(msg.filteredPrompt)}`;
                }
                const audioChunks = msg.serverContent?.audioChunks;
                if (audioChunks) {
                  for (const c of audioChunks) {
                    if (c.data) {
                      chunks.push(Buffer.from(c.data, 'base64'));
                      if (!mimeType && c.mimeType) mimeType = c.mimeType;
                    }
                  }
                }
              },
              onerror: (e: unknown) => {
                errRef.current = e instanceof Error ? e : new Error(String(e));
              },
              onclose: () => {
                closed = true;
                resolveClose();
              },
            },
          }),
          'connect',
        );

        // Wait up to 10s for setupComplete (but never past deadline).
        const setupLimit = Math.min(deadlineAt, Date.now() + 10_000);
        while (!setupComplete && !errRef.current && Date.now() < setupLimit) {
          await new Promise((r) => setTimeout(r, 100));
        }
        if (errRef.current) throw errRef.current;
        if (!setupComplete) throw new Error('Lyria realtime: setup did not complete within 10s');

        await withTimeout(
          session.setWeightedPrompts({
            weightedPrompts: [{ text: prompt, weight: 1.0 }],
          }),
          'setWeightedPrompts',
        );

        const musicGenerationConfig: Record<string, unknown> = {};
        if (temperature !== undefined) musicGenerationConfig.temperature = temperature;
        if (seed !== undefined) musicGenerationConfig.seed = seed;
        if (guidance !== undefined) musicGenerationConfig.guidance = guidance;
        if (Object.keys(musicGenerationConfig).length > 0) {
          await withTimeout(
            session.setMusicGenerationConfig({
              musicGenerationConfig: musicGenerationConfig as Parameters<
                typeof session.setMusicGenerationConfig
              >[0]['musicGenerationConfig'],
            }),
            'setMusicGenerationConfig',
          );
        }

        session.play();

        // Collect audio for duration_seconds wall-clock, never past deadline.
        const collectUntil = Math.min(deadlineAt - 2000, Date.now() + duration_seconds * 1000);
        while (Date.now() < collectUntil && !errRef.current && !closed) {
          await new Promise((r) => setTimeout(r, 100));
        }
      } finally {
        // Force-close regardless — even if session.close hangs, the closePromise
        // race below kills it within 2s.
        try {
          session?.stop();
        } catch {
          // ignore
        }
        try {
          session?.close();
        } catch {
          // ignore
        }
        await Promise.race([closePromise, new Promise((r) => setTimeout(r, 2000))]);
      }

      // errRef.current may be set by onerror callback; TS narrows it to
      // undefined because the callback is opaque, so widen explicitly.
      const err = errRef.current as Error | undefined;
      if (chunks.length === 0) {
        const reason = err
          ? `error: ${err.message}`
          : (filteredReason ??
            'no audio received (prompt may have been filtered or session stalled)');
        return {
          content: [{ type: 'text', text: `Lyria realtime returned no audio — ${reason}.` }],
        };
      }

      const pcm = Buffer.concat(chunks);
      const { sampleRate, channels } = parsePcmMime(mimeType);
      const wav = pcmToWav(pcm, sampleRate, channels);
      await writeAudio(wav, true, output, 'audio/wav');

      const seconds = (pcm.length / (sampleRate * channels * 2)).toFixed(1);
      const filteredNote = filteredReason ? ` [${filteredReason}]` : '';
      const errNote = err ? ` [stream ended with error: ${err.message}]` : '';
      return {
        content: [
          {
            type: 'text',
            text: `Generated music (${sampleRate}Hz, ${channels}ch, ${seconds}s)${filteredNote}${errNote} → ${output}`,
          },
        ],
      };
    },
  );
}
