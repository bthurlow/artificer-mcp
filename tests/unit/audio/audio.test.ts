import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

vi.mock('../../../src/utils/exec-ffmpeg.js', async () => {
  const { createFfmpegMock } = await import('../../helpers/mock-ffmpeg.js');
  return createFfmpegMock();
});

import { ffmpegState, resetFfmpegMock } from '../../helpers/mock-ffmpeg.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerAudioTools } from '../../../src/audio/index.js';

describe('Audio Tools', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerAudioTools(server);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    cleanup = async (): Promise<void> => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(() => {
    resetFfmpegMock();
  });

  // ── audio_extract_from_video ───────────────────────────────────────────

  describe('audio_extract_from_video', () => {
    it('strips video track with -vn and picks codec by extension', async () => {
      await client.callTool({
        name: 'audio_extract_from_video',
        arguments: { input: '/tmp/in.mp4', output: '/tmp/out.mp3' },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-vn');
      expect(args).toContain('-c:a');
      expect(args).toContain('libmp3lame');
    });

    it('respects explicit codec and bitrate', async () => {
      await client.callTool({
        name: 'audio_extract_from_video',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.aac',
          codec: 'aac',
          bitrate: '192k',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('aac');
      expect(args).toContain('-b:a');
      expect(args).toContain('192k');
    });
  });

  // ── audio_normalize ───────────────────────────────────────────────────

  describe('audio_normalize', () => {
    it('uses loudnorm filter with correct I/TP targets', async () => {
      await client.callTool({
        name: 'audio_normalize',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          mode: 'loudnorm',
          target_lufs: -14,
          target_peak_db: -1,
        },
      });

      const args = ffmpegState.calls[0].args;
      const af = args[args.indexOf('-af') + 1];
      expect(af).toContain('loudnorm=');
      expect(af).toContain('I=-14');
      expect(af).toContain('TP=-1');
    });

    it('uses volume filter for peak mode', async () => {
      await client.callTool({
        name: 'audio_normalize',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          mode: 'peak',
          target_lufs: -14,
          target_peak_db: -2,
        },
      });

      const af = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-af') + 1];
      expect(af).toBe('volume=-2dB');
    });

    it('picks AAC (not mp3) and copies video stream when output is .mp4', async () => {
      await client.callTool({
        name: 'audio_normalize',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          mode: 'loudnorm',
          target_lufs: -14,
          target_peak_db: -1,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('aac');
      expect(args).not.toContain('libmp3lame');
      // -c:v copy must be present so the video track is preserved
      const cvIdx = args.indexOf('-c:v');
      expect(cvIdx).toBeGreaterThan(-1);
      expect(args[cvIdx + 1]).toBe('copy');
    });

    it('picks libopus and copies video stream when output is .webm', async () => {
      await client.callTool({
        name: 'audio_normalize',
        arguments: {
          input: '/tmp/in.webm',
          output: '/tmp/out.webm',
          mode: 'loudnorm',
          target_lufs: -14,
          target_peak_db: -1,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('libopus');
      const cvIdx = args.indexOf('-c:v');
      expect(cvIdx).toBeGreaterThan(-1);
      expect(args[cvIdx + 1]).toBe('copy');
    });

    it('does NOT add -c:v copy when output is a pure audio container (.mp3)', async () => {
      await client.callTool({
        name: 'audio_normalize',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          mode: 'loudnorm',
          target_lufs: -14,
          target_peak_db: -1,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).not.toContain('-c:v');
    });
  });

  // ── audio_convert_format ──────────────────────────────────────────────

  describe('audio_convert_format', () => {
    it('picks libmp3lame for .mp3', async () => {
      await client.callTool({
        name: 'audio_convert_format',
        arguments: { input: '/tmp/in.wav', output: '/tmp/out.mp3' },
      });

      expect(ffmpegState.calls[0].args).toContain('libmp3lame');
    });

    it('picks libopus for .opus', async () => {
      await client.callTool({
        name: 'audio_convert_format',
        arguments: { input: '/tmp/in.mp3', output: '/tmp/out.opus' },
      });

      expect(ffmpegState.calls[0].args).toContain('libopus');
    });

    it('picks flac for .flac', async () => {
      await client.callTool({
        name: 'audio_convert_format',
        arguments: { input: '/tmp/in.wav', output: '/tmp/out.flac' },
      });

      expect(ffmpegState.calls[0].args).toContain('flac');
    });

    it('passes -f when format override given', async () => {
      await client.callTool({
        name: 'audio_convert_format',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.m4a',
          format: 'ipod',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-f');
      expect(args).toContain('ipod');
    });
  });

  // ── audio_convert_properties ──────────────────────────────────────────

  describe('audio_convert_properties', () => {
    it('applies multiple properties in one call', async () => {
      await client.callTool({
        name: 'audio_convert_properties',
        arguments: {
          input: '/tmp/in.wav',
          output: '/tmp/out.mp3',
          sample_rate: 44100,
          channels: 2,
          bitrate: '192k',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-ar');
      expect(args).toContain('44100');
      expect(args).toContain('-ac');
      expect(args).toContain('2');
      expect(args).toContain('-b:a');
      expect(args).toContain('192k');
    });

    it('errors when no property given', async () => {
      const result = await client.callTool({
        name: 'audio_convert_properties',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /at least one/.test(text);
      expect(isError).toBe(true);
    });
  });

  // ── audio_set_bitrate ─────────────────────────────────────────────────

  describe('audio_set_bitrate', () => {
    it('sets -b:a flag', async () => {
      await client.callTool({
        name: 'audio_set_bitrate',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          bitrate: '128k',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-b:a');
      expect(args).toContain('128k');
      expect(args).toContain('libmp3lame');
    });
  });

  // ── audio_set_channels ────────────────────────────────────────────────

  describe('audio_set_channels', () => {
    it('sets -ac flag for mono downmix', async () => {
      await client.callTool({
        name: 'audio_set_channels',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          channels: 1,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-ac');
      expect(args).toContain('1');
    });

    it('sets -ac flag for 5.1', async () => {
      await client.callTool({
        name: 'audio_set_channels',
        arguments: {
          input: '/tmp/in.wav',
          output: '/tmp/out.wav',
          channels: 6,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-ac');
      expect(args).toContain('6');
    });
  });

  // ── audio_set_sample_rate ─────────────────────────────────────────────

  describe('audio_set_sample_rate', () => {
    it('sets -ar flag', async () => {
      await client.callTool({
        name: 'audio_set_sample_rate',
        arguments: {
          input: '/tmp/in.wav',
          output: '/tmp/out.wav',
          sample_rate: 48000,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-ar');
      expect(args).toContain('48000');
    });
  });

  // ── audio_remove_silence ──────────────────────────────────────────────

  describe('audio_remove_silence', () => {
    it('builds simple start-only silenceremove filter', async () => {
      await client.callTool({
        name: 'audio_remove_silence',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          threshold_db: -50,
          min_silence_duration: 0.5,
          remove: 'start',
        },
      });

      const af = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-af') + 1];
      expect(af).toContain('silenceremove=start_periods=1');
      expect(af).toContain('start_threshold=-50dB');
      expect(af).toContain('start_duration=0.5');
      expect(af).not.toContain('areverse');
    });

    it('uses areverse trick for end-only trim', async () => {
      await client.callTool({
        name: 'audio_remove_silence',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          threshold_db: -50,
          min_silence_duration: 0.5,
          remove: 'end',
        },
      });

      const af = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-af') + 1];
      // areverse -> silenceremove -> areverse pattern
      expect(af.startsWith('areverse')).toBe(true);
      expect(af.endsWith('areverse')).toBe(true);
      expect(af).toContain('silenceremove=start_periods=1');
    });

    it('does both with two silenceremove passes around areverse', async () => {
      await client.callTool({
        name: 'audio_remove_silence',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          threshold_db: -40,
          min_silence_duration: 1,
          remove: 'both',
        },
      });

      const af = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-af') + 1];
      // Two silenceremove calls separated by areverse
      const matches = af.match(/silenceremove=/g) ?? [];
      expect(matches.length).toBe(2);
      expect(af).toContain('areverse');
    });

    it('uses stop_periods=-1 for "all" mode', async () => {
      await client.callTool({
        name: 'audio_remove_silence',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          threshold_db: -50,
          min_silence_duration: 0.3,
          remove: 'all',
        },
      });

      const af = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-af') + 1];
      expect(af).toContain('stop_periods=-1');
      expect(af).toContain('stop_threshold=-50dB');
    });
  });

  // ── audio_mix ─────────────────────────────────────────────────────────

  describe('audio_mix', () => {
    it('mixes two tracks with volume and amix filter', async () => {
      await client.callTool({
        name: 'audio_mix',
        arguments: {
          tracks: [
            { input: '/tmp/voice.mp3', volume: 1.0 },
            { input: '/tmp/music.mp3', volume: 0.3 },
          ],
          output: '/tmp/mixed.mp3',
          duration: 'longest',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('/tmp/voice.mp3');
      expect(args).toContain('/tmp/music.mp3');
      const fc = args[args.indexOf('-filter_complex') + 1];
      expect(fc).toContain('volume=0.3');
      expect(fc).toContain('amix=inputs=2');
      expect(fc).toContain('duration=longest');
      expect(args[args.indexOf('-map') + 1]).toBe('[aout]');
    });

    it('applies delay via adelay filter when delay_seconds > 0', async () => {
      await client.callTool({
        name: 'audio_mix',
        arguments: {
          tracks: [
            { input: '/tmp/a.mp3' },
            { input: '/tmp/b.mp3', delay_seconds: 1.5 },
          ],
          output: '/tmp/mixed.mp3',
          duration: 'longest',
        },
      });

      const fc = ffmpegState.calls[0].args[
        ffmpegState.calls[0].args.indexOf('-filter_complex') + 1
      ];
      expect(fc).toContain('adelay=1500|1500');
    });

    it('adds sidechaincompress when ducking params are set', async () => {
      await client.callTool({
        name: 'audio_mix',
        arguments: {
          tracks: [
            { input: '/tmp/voice.mp3' },
            { input: '/tmp/music.mp3' },
          ],
          output: '/tmp/mixed.mp3',
          duration: 'longest',
          duck_to: -12,
          duck_against_track: 1,
        },
      });

      const fc = ffmpegState.calls[0].args[
        ffmpegState.calls[0].args.indexOf('-filter_complex') + 1
      ];
      expect(fc).toContain('sidechaincompress');
      expect(fc).toContain('[a1_ducked]');
    });

    it('errors when duck_to is set without duck_against_track', async () => {
      const result = await client.callTool({
        name: 'audio_mix',
        arguments: {
          tracks: [{ input: '/tmp/a.mp3' }, { input: '/tmp/b.mp3' }],
          output: '/tmp/out.mp3',
          duration: 'longest',
          duck_to: -10,
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      expect(result.isError === true || /duck_against_track/.test(text)).toBe(true);
    });

    it('errors when duck_against_track is out of range', async () => {
      const result = await client.callTool({
        name: 'audio_mix',
        arguments: {
          tracks: [{ input: '/tmp/a.mp3' }, { input: '/tmp/b.mp3' }],
          output: '/tmp/out.mp3',
          duration: 'longest',
          duck_to: -10,
          duck_against_track: 5,
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      expect(result.isError === true || /out of range/.test(text)).toBe(true);
    });
  });

  // ── audio_pad ─────────────────────────────────────────────────────────

  describe('audio_pad', () => {
    it('prepends silence with adelay when only pad_start_seconds is set', async () => {
      await client.callTool({
        name: 'audio_pad',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          pad_start_seconds: 0.5,
        },
      });

      const args = ffmpegState.calls[0].args;
      const af = args[args.indexOf('-af') + 1];
      expect(af).toBe('adelay=delays=500:all=1');
      expect(args).toContain('-c:a');
      expect(args).toContain('libmp3lame');
      expect(args).toContain('-vn');
    });

    it('appends silence with apad when only pad_end_seconds is set', async () => {
      await client.callTool({
        name: 'audio_pad',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          pad_end_seconds: 1.5,
        },
      });

      const af = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-af') + 1];
      expect(af).toBe('apad=pad_dur=1.5');
    });

    it('chains adelay,apad when both pads are set', async () => {
      await client.callTool({
        name: 'audio_pad',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          pad_start_seconds: 0.25,
          pad_end_seconds: 2,
        },
      });

      const af = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-af') + 1];
      expect(af).toBe('adelay=delays=250:all=1,apad=pad_dur=2');
    });

    it('respects an explicit codec override', async () => {
      await client.callTool({
        name: 'audio_pad',
        arguments: {
          input: '/tmp/in.wav',
          output: '/tmp/out.m4a',
          pad_start_seconds: 1,
          codec: 'aac',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('aac');
    });

    it('errors when neither pad is provided', async () => {
      const result = await client.callTool({
        name: 'audio_pad',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      expect(result.isError === true || /at least one/.test(text)).toBe(true);
    });

    it('errors when both pads are zero', async () => {
      const result = await client.callTool({
        name: 'audio_pad',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          pad_start_seconds: 0,
          pad_end_seconds: 0,
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      expect(result.isError === true || /at least one/.test(text)).toBe(true);
    });

    it('rejects negative pad values via schema', async () => {
      const result = await client.callTool({
        name: 'audio_pad',
        arguments: {
          input: '/tmp/in.mp3',
          output: '/tmp/out.mp3',
          pad_start_seconds: -1,
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      expect(result.isError === true || /invalid|nonnegative|negative/i.test(text)).toBe(true);
    });
  });
});
