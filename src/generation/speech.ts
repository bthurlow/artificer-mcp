import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { extname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { getGenAIClient } from './client.js';
import { ffmpegBatch } from '../utils/exec-ffmpeg.js';
import { tempPath } from '../utils/exec.js';
import { getProvider } from '../storage/providers/registry.js';
import { rm, writeFile } from 'node:fs/promises';
import { type GenerateSpeechParams, generateSpeechSchema } from './types.js';
import { loadBrandSpec } from '../brand.js';

/**
 * Parse a Gemini audio MIME type like "audio/L16;codec=pcm;rate=24000" into
 * sample rate + channel count so we can wrap the PCM bytes in a WAV header.
 * Defaults: 24 kHz mono 16-bit PCM (Gemini TTS output spec).
 */
function parsePcmMime(mime: string | undefined): { sampleRate: number; channels: number } {
  const defaults = { sampleRate: 24000, channels: 1 };
  if (!mime) return defaults;
  const rate = /rate=(\d+)/i.exec(mime)?.[1];
  const channels = /channels?=(\d+)/i.exec(mime)?.[1];
  return {
    sampleRate: rate ? Number(rate) : defaults.sampleRate,
    channels: channels ? Number(channels) : defaults.channels,
  };
}

/**
 * Wrap raw PCM16 little-endian bytes in a minimal WAV container.
 */
function pcmToWav(pcm: Buffer, sampleRate: number, channels: number): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/**
 * Register the Gemini TTS tool with the MCP server.
 *
 * Uses `generateContent` with responseModalities: ['AUDIO'] and a
 * speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName. Returns PCM in
 * inlineData which we wrap in WAV; transcode to other formats via ffmpeg.
 */
/**
 * Resolve TTS parameters with brand-spec fallbacks and return the effective
 * values. Exported so workflows (e.g., `workflow_narrated_explainer`) can
 * share the same defaulting logic.
 */
export function resolveTtsParams(params: {
  voice?: string;
  style?: string;
  language_code?: string;
}): { voice: string; style?: string; language_code?: string } {
  const brandTts = loadBrandSpec()?.tts;
  const voice = params.voice ?? brandTts?.voice ?? 'Kore';
  let style = params.style;
  if (style === undefined) {
    const parts = [brandTts?.style, brandTts?.accent].filter(
      (p): p is string => typeof p === 'string' && p.trim() !== '',
    );
    style = parts.length > 0 ? parts.join('. ') : undefined;
  }
  const language_code = params.language_code ?? brandTts?.language_code;
  return { voice, style, language_code };
}

/**
 * Core speech generation logic, shared between the `gemini_generate_speech`
 * MCP tool and workflows that embed TTS. Applies brand-spec fallbacks,
 * calls Gemini TTS, wraps PCM in WAV, writes to `output` (transcoding via
 * ffmpeg if the extension is not .wav). Returns the effective voice +
 * duration in seconds for downstream coordination.
 */
export async function generateSpeechToFile(params: {
  model: string;
  text: string;
  output: string;
  voice?: string;
  language_code?: string;
  style?: string;
}): Promise<{ voice: string; durationSeconds: number; sampleRate: number; channels: number }> {
  const client = getGenAIClient();
  const {
    voice: effectiveVoice,
    style: effectiveStyle,
    language_code: effectiveLanguageCode,
  } = resolveTtsParams(params);
  const fullText = effectiveStyle ? `${effectiveStyle}: ${params.text}` : params.text;

  const config: Record<string, unknown> = {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: effectiveVoice },
      },
      ...(effectiveLanguageCode ? { languageCode: effectiveLanguageCode } : {}),
    },
  };

  const response = await client.models.generateContent({
    model: params.model,
    contents: [{ role: 'user', parts: [{ text: fullText }] }],
    config,
  } as unknown as Parameters<typeof client.models.generateContent>[0]);

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  let audio: { data: string; mimeType?: string } | null = null;
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (inline?.data) {
      audio = { data: inline.data, mimeType: inline.mimeType };
      break;
    }
  }

  if (!audio) {
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
    throw new Error(`Speech generation failed — ${reason}.`);
  }

  const pcm = Buffer.from(audio.data, 'base64');
  const { sampleRate, channels } = parsePcmMime(audio.mimeType);
  const wav = pcmToWav(pcm, sampleRate, channels);

  const ext = extname(params.output).toLowerCase();
  if (ext === '.wav' || ext === '') {
    await getProvider(params.output).write(params.output, wav, 'audio/wav');
  } else {
    const tmpWav = tempPath('.wav');
    try {
      await writeFile(tmpWav, wav);
      const tmpOut = tempPath(ext);
      await ffmpegBatch(['-y', '-i', tmpWav, tmpOut]);
      const bytes = await (await import('node:fs/promises')).readFile(tmpOut);
      await getProvider(params.output).write(params.output, bytes);
      await rm(tmpOut, { force: true }).catch(() => {});
    } finally {
      await rm(tmpWav, { force: true }).catch(() => {});
    }
  }

  return {
    voice: effectiveVoice,
    durationSeconds: pcm.length / (sampleRate * channels * 2),
    sampleRate,
    channels,
  };
}

export function registerSpeechGenTools(server: McpServer): void {
  registerTool<GenerateSpeechParams>(
    server,
    'gemini_generate_speech',
    'Generate natural-sounding speech from text via Gemini TTS (gemini-2.5-flash-preview-tts by default). Returns PCM wrapped in WAV; other extensions are transcoded via ffmpeg. Uses GOOGLE_API_KEY.',
    generateSpeechSchema.shape,
    async ({ model, text, output, voice, language_code, style }) => {
      try {
        const result = await generateSpeechToFile({
          model,
          text,
          output,
          voice,
          language_code,
          style,
        });
        return {
          content: [
            {
              type: 'text',
              text: `Generated speech (${result.voice}, ${result.sampleRate}Hz, ${result.channels}ch, ${result.durationSeconds.toFixed(1)}s) → ${output}`,
            },
          ],
        };
      } catch (e) {
        return {
          content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }],
        };
      }
    },
  );
}
