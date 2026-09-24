import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { basename as pathBasename, extname } from 'node:path';
import { registerTool } from '../../utils/register.js';
import { downloadAndWrite } from '../utils/download-and-write.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { resolveForFal } from './inputs.js';
import { checkExtraParams } from './extra-params.js';
import { type FalSeparateAudioParams, falSeparateAudioSchema } from './types-separation.js';

export interface StemFile {
  stem: string;
  url: string;
  ext: string;
  content_type?: string;
}

const EXT_BY_MIME: Record<string, string> = {
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/flac': 'flac',
  'audio/ogg': 'ogg',
};

/**
 * Collect every top-level `{ url }` file in a separation result, one per
 * stem. Stems the model skipped come back as null and are ignored.
 *
 * The extension comes from the file's own name or URL, then its content
 * type, then `wav`; it is never forced, since the bytes are written as
 * returned.
 */
export function extractStems(data: unknown): StemFile[] {
  if (typeof data !== 'object' || data === null) {
    throw new Error(`fal returned a non-object result (got ${typeof data}); expected stem files`);
  }
  const stems: StemFile[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null) continue;
    const file = value as { url?: unknown; file_name?: unknown; content_type?: unknown };
    if (typeof file.url !== 'string' || file.url.length === 0) continue;
    const contentType = typeof file.content_type === 'string' ? file.content_type : undefined;
    const fromName =
      extname(typeof file.file_name === 'string' ? file.file_name : '').slice(1) ||
      extname(new URL(file.url).pathname).slice(1);
    const ext = (fromName || (contentType && EXT_BY_MIME[contentType]) || 'wav').toLowerCase();
    stems.push({ stem: key, url: file.url, ext, content_type: contentType });
  }
  if (stems.length === 0) throw new Error('fal response contained no stem files');
  return stems;
}

/** Default stem prefix: the input's file name without extension. */
export function defaultBasename(audio: string): string {
  const path = /^https?:\/\//i.test(audio) ? new URL(audio).pathname : audio;
  const name = pathBasename(path);
  const ext = extname(name);
  return (ext ? name.slice(0, -ext.length) : name) || 'audio';
}

/** Join a directory (local path or storage URI) and a file name. */
export function joinOutput(dir: string, file: string): string {
  return `${dir.replace(/[\\/]+$/, '')}/${file}`;
}

export function registerFalSeparationTools(server: McpServer): void {
  registerTool<FalSeparateAudioParams>(
    server,
    'fal_separate_audio',
    'Split a mixed track into stems (vocals, drums, bass, other, …) via a fal-hosted separation model such as Demucs. Writes one file per stem into output_dir as <basename>-<stem>.<ext> and returns the stem → path map. Use for an isolated vocal (lip-sync, karaoke timing, cleaner transcription) or instrumental versions. Uses FAL_KEY env var.',
    falSeparateAudioSchema.shape,
    async ({ model, audio, output_dir, basename, stems, extra_params, poll_timeout_seconds }) => {
      const client = getFalClient();
      const audioResolved = await resolveForFal(audio, (b) => client.storage.upload(b));
      try {
        const input: Record<string, unknown> = { ...(extra_params ?? {}) };
        input.audio_url = audioResolved.url;
        if (stems) input.stems = stems;

        for (const warning of await checkExtraParams('fal_separate_audio', model, extra_params)) {
          console.error(warning);
        }

        let result;
        try {
          result = await client.subscribe(model, {
            input,
            logs: true,
            startTimeout: poll_timeout_seconds,
          });
        } catch (err) {
          const falErr = parseFalError(err);
          throw new Error(
            `fal_separate_audio failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
              `status=${falErr.status}, retryable=${falErr.retryable}, ` +
              `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
            { cause: err },
          );
        }

        const prefix = basename ?? defaultBasename(audio);
        const written: Record<string, string> = {};
        for (const s of extractStems(result.data)) {
          const path = joinOutput(output_dir, `${prefix}-${s.stem}.${s.ext}`);
          await downloadAndWrite(s.url, path, { defaultMime: s.content_type ?? 'audio/wav' });
          written[s.stem] = path;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ model, stems: written }, null, 2),
            },
          ],
        };
      } finally {
        await audioResolved.cleanup();
      }
    },
  );
}
