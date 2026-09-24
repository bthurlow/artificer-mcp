import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { extname } from 'node:path';
import { z } from 'zod';
import { registerTool } from '../../utils/register.js';
import { getProvider } from '../../storage/providers/registry.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { resolveForFal } from './inputs.js';
import { checkExtraParams } from './extra-params.js';
import {
  alignLines,
  lowConfidenceWords,
  parseAlignerWords,
  splitLines,
  toLrc,
  toSrt,
} from './align.js';

/**
 * The only forced aligner fal hosts (2026-09-24). Unlike the fal transports,
 * this is a purpose tool rather than a model-agnostic pass-through, so it
 * defaults to that model; `model` stays overridable for a future aligner
 * with the same `{ words[] }` output shape.
 */
export const DEFAULT_ALIGNER = 'fal-ai/elevenlabs/forced-alignment';

type AlignFormat = 'json' | 'lrc' | 'srt';

export interface AlignTextToAudioParams {
  audio: string;
  text: string;
  model: string;
  output?: string;
  format?: AlignFormat;
  extra_params?: Record<string, unknown>;
  poll_timeout_seconds: number;
}

export const alignTextToAudioSchema = z.object({
  audio: z
    .string()
    .describe(
      'Audio to align (vocal, voiceover, narration). Public HTTPS URLs pass through; local paths and gs:// / s3:// URIs are uploaded to fal storage. For songs, align the isolated vocal stem (fal_separate_audio) for cleaner timing.',
    ),
  text: z
    .string()
    .min(1)
    .describe(
      'The known transcript: lyrics, script or voiceover text, exactly as spoken. Line breaks matter: each non-empty line becomes one timed line (a lyric line or caption).',
    ),
  model: z
    .string()
    .min(1)
    .default(DEFAULT_ALIGNER)
    .describe(
      `Forced-alignment model. Default: ${DEFAULT_ALIGNER} (ElevenLabs, the only aligner fal hosts; $0.22 per hour of audio, rounded UP to a whole hour, so each call costs at least $0.22).`,
    ),
  output: z
    .string()
    .optional()
    .describe(
      'Optional file to write (local path or storage URI). Format comes from `format`, or from the extension: .lrc (synced lyrics), .srt (subtitles), .json (full detail). The JSON summary is returned either way.',
    ),
  format: z
    .enum(['json', 'lrc', 'srt'])
    .optional()
    .describe('Output file format. Defaults to the output extension, then json.'),
  extra_params: z
    .record(z.unknown())
    .optional()
    .describe('Passthrough for model-specific knobs, spread into the fal input.'),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(600)
    .describe('Maximum seconds to wait for the fal job. Default 600.'),
});

function pickFormat(output: string | undefined, format: AlignFormat | undefined): AlignFormat {
  if (format) return format;
  const ext = output ? extname(output).slice(1).toLowerCase() : '';
  return ext === 'lrc' || ext === 'srt' ? ext : 'json';
}

const MIME: Record<AlignFormat, string> = {
  json: 'application/json',
  lrc: 'text/plain',
  srt: 'application/x-subrip',
};

export function registerAlignmentTools(server: McpServer): void {
  registerTool<AlignTextToAudioParams>(
    server,
    'align_text_to_audio',
    "Forced alignment: time a KNOWN transcript (lyrics, script, voiceover) against its audio. Returns word-level and line-level start/end times, flags words the aligner matched poorly, and can write LRC (synced lyrics), SRT (subtitles) or JSON. Unlike ASR (fal_transcribe), the words are exactly your text, so proper nouns and lyrics are never misheard. Lines come from the text's own line breaks. Default model: fal's ElevenLabs forced aligner ($0.22 per started hour of audio). Uses FAL_KEY.",
    alignTextToAudioSchema.shape,
    async ({ audio, text, model, output, format, extra_params, poll_timeout_seconds }) => {
      if (splitLines(text).length === 0) throw new Error('text has no non-empty lines to align');
      const client = getFalClient();
      const audioResolved = await resolveForFal(audio, (b) => client.storage.upload(b));
      try {
        const input: Record<string, unknown> = { ...(extra_params ?? {}) };
        input.audio_url = audioResolved.url;
        input.text = text;
        for (const warning of await checkExtraParams('align_text_to_audio', model, extra_params)) {
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
            `align_text_to_audio failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
              `status=${falErr.status}, retryable=${falErr.retryable}, ` +
              `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
            { cause: err },
          );
        }

        const { words, loss } = parseAlignerWords(result.data);
        const lines = alignLines(text, words);
        const lowConfidence = lowConfidenceWords(words);
        const detail = {
          model,
          ...(loss !== undefined ? { loss } : {}),
          lines,
          words,
          low_confidence: lowConfidence,
        };

        let written: string | undefined;
        if (output) {
          const fmt = pickFormat(output, format);
          const body =
            fmt === 'lrc'
              ? toLrc(lines)
              : fmt === 'srt'
                ? toSrt(lines)
                : JSON.stringify(detail, null, 2) + '\n';
          await getProvider(output).write(output, Buffer.from(body, 'utf8'), MIME[fmt]);
          written = `${output} (${fmt})`;
        }

        const interpolated = lines.filter((l) => l.interpolated).length;
        const summary = {
          model,
          ...(loss !== undefined ? { loss } : {}),
          line_count: lines.length,
          word_count: words.length,
          ...(interpolated ? { interpolated_lines: interpolated } : {}),
          low_confidence: lowConfidence,
          ...(written ? { written } : {}),
          lines,
        };
        return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
      } finally {
        await audioResolved.cleanup();
      }
    },
  );
}
