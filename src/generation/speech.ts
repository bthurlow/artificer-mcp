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

  if (usesInteractions(params.model)) {
    const audio = await synthesizeViaInteractions(client, {
      model: params.model,
      text: params.text,
      voice: effectiveVoice,
      style: effectiveStyle,
      language: effectiveLanguageCode,
    });
    return writeSpeech(params.output, audio, effectiveVoice);
  }
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

  const { sampleRate, channels } = parsePcmMime(audio.mimeType);
  return writeSpeech(
    params.output,
    { pcm: Buffer.from(audio.data, 'base64'), sampleRate, channels },
    effectiveVoice,
  );
}

interface SpeechPcm {
  pcm: Buffer;
  sampleRate: number;
  channels: number;
}

/** Wrap PCM in WAV and write it, transcoding via ffmpeg for other extensions. */
async function writeSpeech(
  output: string,
  { pcm, sampleRate, channels }: SpeechPcm,
  voice: string,
): Promise<{ voice: string; durationSeconds: number; sampleRate: number; channels: number }> {
  const wav = pcmToWav(pcm, sampleRate, channels);

  const ext = extname(output).toLowerCase();
  if (ext === '.wav' || ext === '') {
    await getProvider(output).write(output, wav, 'audio/wav');
  } else {
    const tmpWav = tempPath('.wav');
    try {
      await writeFile(tmpWav, wav);
      const tmpOut = tempPath(ext);
      await ffmpegBatch(['-y', '-i', tmpWav, tmpOut]);
      const bytes = await (await import('node:fs/promises')).readFile(tmpOut);
      await getProvider(output).write(output, bytes);
      await rm(tmpOut, { force: true }).catch(() => {});
    } finally {
      await rm(tmpWav, { force: true }).catch(() => {});
    }
  }

  return {
    voice,
    durationSeconds: pcm.length / (sampleRate * channels * 2),
    sampleRate,
    channels,
  };
}

/**
 * Gemini 3.8 TTS (gemini-3.8-flash-tts, -flash-lite-tts) is served through
 * the Interactions API, not generateContent. The preview models it replaces
 * (gemini-2.5-flash-preview-tts shuts down 2026-11-17) stay on generateContent.
 */
export function usesInteractions(model: string): boolean {
  return /^(models\/)?gemini-3\.8-/.test(model);
}

/** Sample rate requested from the Interactions API (its default, 24 kHz). */
const INTERACTIONS_SAMPLE_RATE = 24000;

/**
 * The Interactions request for one TTS call. The text is a verbatim
 * transcript: 3.8 speaks everything in `text`, so a style goes in a
 * `speech_metadata` annotation instead of being prefixed as the preview
 * models' stage direction was. Audio comes back as raw 16-bit PCM
 * (`audio/l16`; the unary default would be WAV), like generateContent's.
 */
export function buildTtsInteraction(p: {
  model: string;
  text: string;
  voice: string;
  style?: string;
  language?: string;
}): Record<string, unknown> {
  const text: Record<string, unknown> = { type: 'text', text: p.text };
  if (p.style) text['annotations'] = [{ type: 'speech_metadata', style: p.style }];
  return {
    model: p.model,
    input: [{ type: 'user_input', content: [text] }],
    response_format: {
      type: 'audio',
      mime_type: 'audio/l16',
      sample_rate: INTERACTIONS_SAMPLE_RATE,
    },
    generation_config: {
      speech_config: [{ voice: p.voice, ...(p.language ? { language: p.language } : {}) }],
    },
  };
}

interface TtsInteraction {
  id?: string;
  status?: string;
  output_audio?: { data?: string; mime_type?: string };
  steps?: Array<{
    type?: string;
    content?: Array<{ type?: string; data?: string; mime_type?: string }>;
  }>;
  errors?: Array<{ message?: string }>;
}

/** The audio of a finished interaction: the SDK's output_audio, else the last audio block of the steps. */
export function extractInteractionAudio(
  interaction: TtsInteraction,
): { data: string; mimeType?: string } | undefined {
  if (interaction.output_audio?.data) {
    return { data: interaction.output_audio.data, mimeType: interaction.output_audio.mime_type };
  }
  let found: { data: string; mimeType?: string } | undefined;
  for (const step of interaction.steps ?? []) {
    for (const c of step.content ?? []) {
      if (c.type === 'audio' && c.data) found = { data: c.data, mimeType: c.mime_type };
    }
  }
  return found;
}

/** PCM from an audio block: raw L16 as requested, or a WAV's data chunk if one comes back anyway. */
export function audioToPcm(audio: { data: string; mimeType?: string }): SpeechPcm {
  const bytes = Buffer.from(audio.data, 'base64');
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF') {
    let sampleRate = INTERACTIONS_SAMPLE_RATE;
    let channels = 1;
    let off = 12;
    while (off + 8 <= bytes.length) {
      const id = bytes.toString('ascii', off, off + 4);
      const size = bytes.readUInt32LE(off + 4);
      if (id === 'fmt ') {
        channels = bytes.readUInt16LE(off + 10);
        sampleRate = bytes.readUInt32LE(off + 12);
      } else if (id === 'data') {
        return { pcm: bytes.subarray(off + 8, off + 8 + size), sampleRate, channels };
      }
      off += 8 + size + (size % 2);
    }
    throw new Error('Speech generation failed — WAV response has no data chunk.');
  }
  const { sampleRate, channels } = parsePcmMime(audio.mimeType);
  return { pcm: bytes, sampleRate, channels };
}

const TTS_POLL_TIMEOUT_MS = 120_000;
const TTS_FAILED = new Set(['failed', 'cancelled', 'incomplete']);

async function synthesizeViaInteractions(
  client: ReturnType<typeof getGenAIClient>,
  p: { model: string; text: string; voice: string; style?: string; language?: string },
): Promise<SpeechPcm> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interactions = (client as any).interactions;
  if (!interactions?.create) {
    throw new Error(
      `${p.model} needs the Interactions API, which the installed @google/genai does not expose.`,
    );
  }
  let interaction = (await interactions.create(buildTtsInteraction(p))) as TtsInteraction;
  // A unary TTS call normally comes back completed; poll briefly if not.
  const deadline = Date.now() + TTS_POLL_TIMEOUT_MS;
  while (
    interaction.status &&
    interaction.status !== 'completed' &&
    !TTS_FAILED.has(interaction.status)
  ) {
    if (Date.now() > deadline || !interaction.id) {
      throw new Error(
        `Speech generation timed out (interaction ${interaction.id ?? '?'}, status "${interaction.status}").`,
      );
    }
    await new Promise((r) => setTimeout(r, 1000));
    interaction = (await interactions.get(interaction.id)) as TtsInteraction;
  }
  const audio = extractInteractionAudio(interaction);
  if (!audio) {
    const detail = interaction.errors
      ?.map((e) => e.message)
      .filter(Boolean)
      .join('; ');
    const what =
      interaction.status && interaction.status !== 'completed'
        ? `interaction ${interaction.status}`
        : 'no audio data returned';
    throw new Error(`Speech generation failed — ${what}${detail ? `: ${detail}` : ''}.`);
  }
  return audioToPcm(audio);
}

export function registerSpeechGenTools(server: McpServer): void {
  registerTool<GenerateSpeechParams>(
    server,
    'gemini_generate_speech',
    'Generate natural-sounding speech from text via Gemini TTS (gemini-3.8-flash-tts by default). Returns PCM wrapped in WAV; other extensions are transcoded via ffmpeg. Uses GOOGLE_API_KEY.',
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
