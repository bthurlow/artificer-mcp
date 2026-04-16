import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

vi.mock('../../../src/utils/exec-ffmpeg.js', async () => {
  const { createFfmpegMock } = await import('../../helpers/mock-ffmpeg.js');
  return createFfmpegMock();
});

import { ffmpegState, resetFfmpegMock } from '../../helpers/mock-ffmpeg.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerVideoTools } from '../../../src/video/index.js';

describe('Video Tools', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerVideoTools(server);

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

  // ── video_concatenate ──────────────────────────────────────────────────

  describe('video_concatenate', () => {
    it('uses concat demuxer with -c copy when reencode=false', async () => {
      const result = await client.callTool({
        name: 'video_concatenate',
        arguments: {
          inputs: ['/tmp/a.mp4', '/tmp/b.mp4'],
          output: '/tmp/out.mp4',
          reencode: false,
        },
      });

      expect(ffmpegState.calls).toHaveLength(1);
      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-f');
      expect(args).toContain('concat');
      expect(args).toContain('-c');
      expect(args).toContain('copy');
      expect(args[args.length - 1]).toBe('/tmp/out.mp4');
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Concatenated 2 videos');
      expect(content[0].text).toContain('stream copy');
    });

    it('uses concat filter with re-encoding when reencode=true', async () => {
      await client.callTool({
        name: 'video_concatenate',
        arguments: {
          inputs: ['/tmp/a.mp4', '/tmp/b.mp4', '/tmp/c.mp4'],
          output: '/tmp/out.mp4',
          reencode: true,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-filter_complex');
      const filter = args[args.indexOf('-filter_complex') + 1];
      expect(filter).toContain('concat=n=3:v=1:a=1');
    });
  });

  // ── video_trim ─────────────────────────────────────────────────────────

  describe('video_trim', () => {
    it('uses -ss and -t with stream copy when reencode=false', async () => {
      const result = await client.callTool({
        name: 'video_trim',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          start_seconds: 5,
          duration_seconds: 10,
          reencode: false,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-ss');
      expect(args).toContain('5');
      expect(args).toContain('-t');
      expect(args).toContain('10');
      expect(args).toContain('-c');
      expect(args).toContain('copy');
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Trimmed');
    });

    it('uses -to when end_seconds is given', async () => {
      await client.callTool({
        name: 'video_trim',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          start_seconds: 2,
          end_seconds: 8,
          reencode: false,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-to');
      expect(args).toContain('8');
    });

    it('re-encodes with libx264/aac when reencode=true', async () => {
      await client.callTool({
        name: 'video_trim',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          start_seconds: 0,
          duration_seconds: 5,
          reencode: true,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('libx264');
      expect(args).toContain('aac');
    });
  });

  // ── video_change_aspect_ratio ──────────────────────────────────────────

  describe('video_change_aspect_ratio', () => {
    it('builds crop filter for "9:16" mode=crop', async () => {
      await client.callTool({
        name: 'video_change_aspect_ratio',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          aspect_ratio: '9:16',
          mode: 'crop',
          pad_color: 'black',
        },
      });

      const args = ffmpegState.calls[0].args;
      const vfIdx = args.indexOf('-vf');
      expect(vfIdx).toBeGreaterThanOrEqual(0);
      expect(args[vfIdx + 1]).toContain('crop=');
      expect(args[vfIdx + 1]).toContain('9');
      expect(args[vfIdx + 1]).toContain('16');
    });

    it('builds pad filter when mode=pad', async () => {
      await client.callTool({
        name: 'video_change_aspect_ratio',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          aspect_ratio: '16:9',
          mode: 'pad',
          pad_color: '#FF0000',
        },
      });

      const args = ffmpegState.calls[0].args;
      const vf = args[args.indexOf('-vf') + 1];
      expect(vf).toContain('pad=');
      expect(vf).toContain('color=#FF0000');
    });

    it('accepts arbitrary W:H aspect ratios', async () => {
      await client.callTool({
        name: 'video_change_aspect_ratio',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          aspect_ratio: '5:4',
          mode: 'crop',
          pad_color: 'black',
        },
      });

      const vf = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-vf') + 1];
      expect(vf).toContain('5/4');
    });
  });

  // ── video_convert_format ───────────────────────────────────────────────

  describe('video_convert_format', () => {
    it('picks libvpx-vp9 + libopus for webm', async () => {
      await client.callTool({
        name: 'video_convert_format',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.webm',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('libvpx-vp9');
      expect(args).toContain('libopus');
    });

    it('picks libx264 + aac for mp4/mov', async () => {
      await client.callTool({
        name: 'video_convert_format',
        arguments: {
          input: '/tmp/in.webm',
          output: '/tmp/out.mp4',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('libx264');
      expect(args).toContain('aac');
    });

    it('passes explicit -f format when provided', async () => {
      await client.callTool({
        name: 'video_convert_format',
        arguments: {
          input: '/tmp/in.mkv',
          output: '/tmp/out.mp4',
          format: 'mp4',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-f');
      expect(args).toContain('mp4');
    });
  });

  // ── video_change_speed ─────────────────────────────────────────────────

  describe('video_change_speed', () => {
    it('builds setpts + atempo filter when preserve_audio=true', async () => {
      await client.callTool({
        name: 'video_change_speed',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          speed: 2,
          preserve_audio: true,
        },
      });

      const args = ffmpegState.calls[0].args;
      const filter = args[args.indexOf('-filter_complex') + 1];
      expect(filter).toContain('setpts=0.500000*PTS');
      expect(filter).toContain('atempo=2');
    });

    it('drops audio with -an when preserve_audio=false', async () => {
      await client.callTool({
        name: 'video_change_speed',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          speed: 4,
          preserve_audio: false,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-an');
      const vf = args[args.indexOf('-vf') + 1];
      expect(vf).toContain('setpts=0.250000*PTS');
    });

    it('errors when preserve_audio=true and speed outside [0.5, 2.0]', async () => {
      const result = await client.callTool({
        name: 'video_change_speed',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          speed: 3,
          preserve_audio: true,
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /0\.5.*2\.0/.test(text);
      expect(isError).toBe(true);
    });
  });

  // ── video_set_resolution ───────────────────────────────────────────────

  describe('video_set_resolution', () => {
    it('uses preset dimensions for "1080p"', async () => {
      await client.callTool({
        name: 'video_set_resolution',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          preset: '1080p',
          preserve_aspect_ratio: true,
        },
      });

      const args = ffmpegState.calls[0].args;
      const vf = args[args.indexOf('-vf') + 1];
      expect(vf).toContain('1920');
      expect(vf).toContain('1080');
      expect(vf).toContain('force_original_aspect_ratio=decrease');
    });

    it('uses explicit width/height when provided', async () => {
      await client.callTool({
        name: 'video_set_resolution',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          width: 640,
          height: 360,
          preserve_aspect_ratio: false,
        },
      });

      const args = ffmpegState.calls[0].args;
      const vf = args[args.indexOf('-vf') + 1];
      expect(vf).toContain('scale=640:360');
    });

    it('errors on unknown preset', async () => {
      const result = await client.callTool({
        name: 'video_set_resolution',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          preset: '8k',
          preserve_aspect_ratio: true,
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /Unknown preset/i.test(text);
      expect(isError).toBe(true);
    });
  });
});
