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

  // ── video_add_transitions ──────────────────────────────────────────────

  describe('video_add_transitions', () => {
    it('builds xfade filter chain with correct offset (2 inputs)', async () => {
      await client.callTool({
        name: 'video_add_transitions',
        arguments: {
          inputs: ['/tmp/a.mp4', '/tmp/b.mp4'],
          output: '/tmp/out.mp4',
          transition: 'fade',
          duration: 1,
        },
      });

      const args = ffmpegState.calls[0].args;
      const filter = args[args.indexOf('-filter_complex') + 1];
      // Mock returns durationSeconds: 10. Offset = 10 - 1 = 9.000
      expect(filter).toContain('xfade=transition=fade:duration=1:offset=9.000');
      expect(filter).toContain('acrossfade=d=1');
    });

    it('chains xfades across N inputs with cumulative offset', async () => {
      await client.callTool({
        name: 'video_add_transitions',
        arguments: {
          inputs: ['/tmp/a.mp4', '/tmp/b.mp4', '/tmp/c.mp4'],
          output: '/tmp/out.mp4',
          transition: 'wipeleft',
          duration: 0.5,
        },
      });

      const args = ffmpegState.calls[0].args;
      const filter = args[args.indexOf('-filter_complex') + 1];
      // First xfade at 10 - 0.5 = 9.500
      expect(filter).toContain('offset=9.500');
      // Second xfade at 9.5 + (10 - 0.5) = 19.000
      expect(filter).toContain('offset=19.000');
      expect(filter).toContain('transition=wipeleft');
    });
  });

  // ── video_add_image_overlay ────────────────────────────────────────────

  describe('video_add_image_overlay', () => {
    it('builds overlay filter with x/y position and full opacity', async () => {
      await client.callTool({
        name: 'video_add_image_overlay',
        arguments: {
          input: '/tmp/in.mp4',
          overlay: '/tmp/logo.png',
          output: '/tmp/out.mp4',
          x: 20,
          y: 30,
          opacity: 1,
        },
      });

      const args = ffmpegState.calls[0].args;
      const filter = args[args.indexOf('-filter_complex') + 1];
      expect(filter).toContain('overlay=20:30');
      expect(filter).not.toContain('colorchannelmixer');
    });

    it('applies colorchannelmixer for opacity < 1', async () => {
      await client.callTool({
        name: 'video_add_image_overlay',
        arguments: {
          input: '/tmp/in.mp4',
          overlay: '/tmp/logo.png',
          output: '/tmp/out.mp4',
          x: 10,
          y: 10,
          opacity: 0.5,
        },
      });

      const filter = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-filter_complex') + 1];
      expect(filter).toContain('colorchannelmixer=aa=0.5');
    });

    it('adds enable=between when time range is given', async () => {
      await client.callTool({
        name: 'video_add_image_overlay',
        arguments: {
          input: '/tmp/in.mp4',
          overlay: '/tmp/logo.png',
          output: '/tmp/out.mp4',
          x: 10,
          y: 10,
          opacity: 1,
          start_seconds: 2,
          end_seconds: 5,
        },
      });

      const filter = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-filter_complex') + 1];
      expect(filter).toContain('between(t,2,5)');
    });
  });

  // ── video_add_text_overlay ─────────────────────────────────────────────

  describe('video_add_text_overlay', () => {
    it('builds drawtext filter with text, size, color, position', async () => {
      await client.callTool({
        name: 'video_add_text_overlay',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          text: 'Hello',
          font_size: 64,
          color: 'yellow',
          x: 100,
          y: 200,
          box: false,
          box_color: 'black@0.5',
          box_border_width: 10,
        },
      });

      const args = ffmpegState.calls[0].args;
      const vf = args[args.indexOf('-vf') + 1];
      expect(vf).toContain('drawtext=');
      expect(vf).toContain("text='Hello'");
      expect(vf).toContain('fontsize=64');
      expect(vf).toContain('fontcolor=yellow');
      expect(vf).toContain('x=100');
      expect(vf).toContain('y=200');
    });

    it('adds box clauses when box=true', async () => {
      await client.callTool({
        name: 'video_add_text_overlay',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          text: 'Boxed',
          font_size: 48,
          color: 'white',
          x: 10,
          y: 10,
          box: true,
          box_color: 'red@0.8',
          box_border_width: 12,
        },
      });

      const vf = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-vf') + 1];
      expect(vf).toContain('box=1');
      expect(vf).toContain('boxcolor=red@0.8');
      expect(vf).toContain('boxborderw=12');
    });

    it('escapes colons and single quotes in the text', async () => {
      await client.callTool({
        name: 'video_add_text_overlay',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          text: `It's 3:45 PM`,
          font_size: 48,
          color: 'white',
          x: 10,
          y: 10,
          box: false,
          box_color: 'black@0.5',
          box_border_width: 10,
        },
      });

      const vf = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-vf') + 1];
      // "It's" → "It\'s" and "3:45" → "3\:45"
      expect(vf).toContain("It\\'s");
      expect(vf).toContain('3\\:45');
    });
  });

  // ── video_add_subtitles ────────────────────────────────────────────────

  describe('video_add_subtitles', () => {
    it('uses subtitles filter when burn_in=true', async () => {
      await client.callTool({
        name: 'video_add_subtitles',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          subtitle_file: '/tmp/subs.srt',
          burn_in: true,
        },
      });

      const args = ffmpegState.calls[0].args;
      const vf = args[args.indexOf('-vf') + 1];
      expect(vf).toContain("subtitles='/tmp/subs.srt'");
    });

    it('includes force_style when provided', async () => {
      await client.callTool({
        name: 'video_add_subtitles',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          subtitle_file: '/tmp/subs.srt',
          burn_in: true,
          force_style: 'FontSize=28,PrimaryColour=&HFFFFFF&',
        },
      });

      const vf = ffmpegState.calls[0].args[ffmpegState.calls[0].args.indexOf('-vf') + 1];
      expect(vf).toContain('force_style=');
      expect(vf).toContain('FontSize=28');
    });

    it('muxes as soft track when burn_in=false with mov_text for mp4', async () => {
      await client.callTool({
        name: 'video_add_subtitles',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          subtitle_file: '/tmp/subs.srt',
          burn_in: false,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-c:s');
      expect(args).toContain('mov_text');
    });
  });

  // ── video_add_b_roll ───────────────────────────────────────────────────

  describe('video_add_b_roll', () => {
    it('builds cutaway filter when replace_main_duration=true', async () => {
      await client.callTool({
        name: 'video_add_b_roll',
        arguments: {
          main: '/tmp/main.mp4',
          b_roll: '/tmp/broll.mp4',
          output: '/tmp/out.mp4',
          insert_at_seconds: 3,
          b_roll_duration_seconds: 2,
          replace_main_duration: true,
        },
      });

      const args = ffmpegState.calls[0].args;
      const filter = args[args.indexOf('-filter_complex') + 1];
      expect(filter).toContain('[0:v]trim=0:3');
      expect(filter).toContain('[1:v]trim=0:2');
      // postStart = 3 + 2 = 5
      expect(filter).toContain('[0:v]trim=5,');
      expect(filter).toContain('concat=n=3:v=1:a=0');
      // main's audio is mapped directly, not spliced
      expect(args).toContain('0:a?');
    });

    it('builds additive insert when replace_main_duration=false', async () => {
      await client.callTool({
        name: 'video_add_b_roll',
        arguments: {
          main: '/tmp/main.mp4',
          b_roll: '/tmp/broll.mp4',
          output: '/tmp/out.mp4',
          insert_at_seconds: 5,
          b_roll_duration_seconds: 3,
          replace_main_duration: false,
        },
      });

      const args = ffmpegState.calls[0].args;
      const filter = args[args.indexOf('-filter_complex') + 1];
      // postStart = insert_at_seconds (no duration replacement)
      expect(filter).toContain('[0:v]trim=5,');
      expect(filter).toContain('[1:a]atrim=0:3');
      expect(filter).toContain('concat=n=3:v=1:a=1');
    });
  });

  // ── video_set_bitrate ──────────────────────────────────────────────────

  describe('video_set_bitrate', () => {
    it('sets video and audio bitrate via single pass', async () => {
      await client.callTool({
        name: 'video_set_bitrate',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          video_bitrate: '2M',
          audio_bitrate: '128k',
          two_pass: false,
        },
      });

      expect(ffmpegState.calls).toHaveLength(1);
      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-b:v');
      expect(args).toContain('2M');
      expect(args).toContain('-b:a');
      expect(args).toContain('128k');
    });

    it('runs two-pass encode when two_pass=true', async () => {
      await client.callTool({
        name: 'video_set_bitrate',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          video_bitrate: '4M',
          two_pass: true,
        },
      });

      // 2 ffmpeg invocations: pass 1 + pass 2
      expect(ffmpegState.calls).toHaveLength(2);
      const pass1 = ffmpegState.calls[0].args;
      const pass2 = ffmpegState.calls[1].args;
      expect(pass1).toContain('-pass');
      expect(pass1).toContain('1');
      expect(pass2).toContain('-pass');
      expect(pass2).toContain('2');
    });

    it('errors when neither bitrate is given', async () => {
      const result = await client.callTool({
        name: 'video_set_bitrate',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          two_pass: false,
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /video_bitrate|audio_bitrate/.test(text);
      expect(isError).toBe(true);
    });
  });

  // ── video_set_codec ────────────────────────────────────────────────────

  describe('video_set_codec', () => {
    it('applies video codec + CRF + preset', async () => {
      await client.callTool({
        name: 'video_set_codec',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          video_codec: 'libx265',
          crf: 23,
          preset: 'slow',
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-c:v');
      expect(args).toContain('libx265');
      expect(args).toContain('-crf');
      expect(args).toContain('23');
      expect(args).toContain('-preset');
      expect(args).toContain('slow');
    });

    it('stream-copies video when only audio_codec is specified', async () => {
      await client.callTool({
        name: 'video_set_codec',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          audio_codec: 'libopus',
        },
      });

      const args = ffmpegState.calls[0].args;
      const cvIdx = args.indexOf('-c:v');
      expect(args[cvIdx + 1]).toBe('copy');
      const caIdx = args.indexOf('-c:a');
      expect(args[caIdx + 1]).toBe('libopus');
    });

    it('errors when neither codec given', async () => {
      const result = await client.callTool({
        name: 'video_set_codec',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /codec/.test(text);
      expect(isError).toBe(true);
    });
  });

  // ── video_set_frame_rate ───────────────────────────────────────────────

  describe('video_set_frame_rate', () => {
    it('uses fps filter when drop_duplicate_frames=true', async () => {
      await client.callTool({
        name: 'video_set_frame_rate',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          frame_rate: 30,
          drop_duplicate_frames: true,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-vf');
      expect(args[args.indexOf('-vf') + 1]).toBe('fps=30');
    });

    it('uses -r flag when drop_duplicate_frames=false', async () => {
      await client.callTool({
        name: 'video_set_frame_rate',
        arguments: {
          input: '/tmp/in.mp4',
          output: '/tmp/out.mp4',
          frame_rate: 60,
          drop_duplicate_frames: false,
        },
      });

      const args = ffmpegState.calls[0].args;
      expect(args).toContain('-r');
      expect(args).toContain('60');
      expect(args).not.toContain('-vf');
    });
  });
});
