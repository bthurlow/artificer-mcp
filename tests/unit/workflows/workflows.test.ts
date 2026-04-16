import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Mock ImageMagick
vi.mock('../../../src/utils/exec.js', async () => {
  const { createExecMock } = await import('../../helpers/mock-exec.js');
  return createExecMock();
});

// Mock FFmpeg
vi.mock('../../../src/utils/exec-ffmpeg.js', async () => {
  const { createFfmpegMock } = await import('../../helpers/mock-ffmpeg.js');
  return createFfmpegMock();
});

// Mock fs so workflows don't hit real filesystem
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return {
    ...actual,
    mkdir: vi.fn(async () => undefined),
    writeFile: vi.fn(async () => undefined),
    copyFile: vi.fn(async () => undefined),
    rm: vi.fn(async () => undefined),
  };
});

import { mockState, resetMock } from '../../helpers/mock-exec.js';
import { ffmpegState, resetFfmpegMock } from '../../helpers/mock-ffmpeg.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerWorkflowTools } from '../../../src/workflows/index.js';

describe('Workflow Tools', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerWorkflowTools(server);

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
    resetMock();
    resetFfmpegMock();
  });

  // ── workflow_brand_asset_pack ─────────────────────────────────────────

  describe('workflow_brand_asset_pack', () => {
    it('generates favicons, app icons, social card, and OG image', async () => {
      const result = await client.callTool({
        name: 'workflow_brand_asset_pack',
        arguments: {
          logo: '/tmp/logo.png',
          output_dir: '/tmp/assets',
          brand_name: 'TestBrand',
          brand_color: '#FF0000',
          background_color: '#FFFFFF',
        },
      });

      // 6 favicons + 9 app icons + 1 social card resize + 1 social card composite = 17 magick calls
      expect(mockState.calls.length).toBeGreaterThanOrEqual(16);

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content[0].text;
      expect(text).toContain('17 assets generated');
      expect(text).toContain('Favicons');
      expect(text).toContain('App icons');
      expect(text).toContain('Social card');
      expect(text).toContain('OG image');
    });

    it('generates social card without brand name', async () => {
      const result = await client.callTool({
        name: 'workflow_brand_asset_pack',
        arguments: {
          logo: '/tmp/logo.png',
          output_dir: '/tmp/assets',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('17 assets generated');

      // Social card magick call should NOT contain annotate when no brand_name
      const socialCardCall = mockState.calls.find(
        (c) => c.args.includes('1200x630'),
      );
      expect(socialCardCall).toBeDefined();
      expect(socialCardCall!.args).not.toContain('-annotate');
    });

    it('includes brand name annotation on social card when provided', async () => {
      await client.callTool({
        name: 'workflow_brand_asset_pack',
        arguments: {
          logo: '/tmp/logo.png',
          output_dir: '/tmp/assets',
          brand_name: 'MyBrand',
        },
      });

      const socialCardCall = mockState.calls.find(
        (c) => c.args.includes('1200x630') && c.args.includes('-annotate'),
      );
      expect(socialCardCall).toBeDefined();
      expect(socialCardCall!.args).toContain('MyBrand');
    });
  });

  // ── workflow_social_carousel ──────────────────────────────────────────

  describe('workflow_social_carousel', () => {
    it('creates numbered slides from input images', async () => {
      const result = await client.callTool({
        name: 'workflow_social_carousel',
        arguments: {
          images: ['/tmp/a.png', '/tmp/b.png', '/tmp/c.png'],
          output_dir: '/tmp/carousel',
          width: 1080,
          height: 1080,
        },
      });

      expect(mockState.calls).toHaveLength(3);
      // Each call should resize to 1080x1080
      for (const call of mockState.calls) {
        expect(call.args).toContain('1080x1080^');
        expect(call.args).toContain('1080x1080');
      }

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('3 slides');
      expect(content[0].text).toContain('Slide 1');
      expect(content[0].text).toContain('Slide 3');
    });

    it('adds caption bars when captions provided', async () => {
      await client.callTool({
        name: 'workflow_social_carousel',
        arguments: {
          images: ['/tmp/a.png', '/tmp/b.png'],
          output_dir: '/tmp/carousel',
          captions: ['First slide', 'Second slide'],
        },
      });

      // Both calls should have annotation
      for (const call of mockState.calls) {
        expect(call.args).toContain('-annotate');
      }
      expect(mockState.calls[0].args).toContain('First slide');
      expect(mockState.calls[1].args).toContain('Second slide');
    });

    it('errors when captions length mismatches images', async () => {
      const result = await client.callTool({
        name: 'workflow_social_carousel',
        arguments: {
          images: ['/tmp/a.png', '/tmp/b.png'],
          output_dir: '/tmp/carousel',
          captions: ['Only one'],
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /captions length/i.test(text);
      expect(isError).toBe(true);
    });

    it('uses custom font when font_file provided', async () => {
      await client.callTool({
        name: 'workflow_social_carousel',
        arguments: {
          images: ['/tmp/a.png', '/tmp/b.png'],
          output_dir: '/tmp/carousel',
          captions: ['Hello', 'World'],
          font_file: '/tmp/Roboto.ttf',
        },
      });

      for (const call of mockState.calls) {
        expect(call.args).toContain('-font');
        expect(call.args).toContain('/tmp/Roboto.ttf');
      }
    });
  });

  // ── workflow_talking_head ─────────────────────────────────────────────

  describe('workflow_talking_head', () => {
    it('runs full pipeline: trim + b-roll + subtitles + normalize', async () => {
      const result = await client.callTool({
        name: 'workflow_talking_head',
        arguments: {
          input: '/tmp/raw.mp4',
          output: '/tmp/final.mp4',
          trim_start_seconds: 2,
          trim_end_seconds: 30,
          b_roll: '/tmp/broll.mp4',
          b_roll_insert_at_seconds: 5,
          b_roll_duration_seconds: 3,
          subtitle_file: '/tmp/subs.srt',
          normalize_audio: true,
          target_lufs: -14,
        },
      });

      // 4 processing steps + 1 final copy = 5 ffmpeg calls
      expect(ffmpegState.calls.length).toBe(5);

      // Step 1: trim
      const trimArgs = ffmpegState.calls[0].args;
      expect(trimArgs).toContain('-ss');
      expect(trimArgs).toContain('-to');

      // Step 2: b-roll cutaway
      const brollArgs = ffmpegState.calls[1].args;
      expect(brollArgs).toContain('-filter_complex');
      const filter = brollArgs[brollArgs.indexOf('-filter_complex') + 1];
      expect(filter).toContain('concat=n=3');

      // Step 3: subtitles
      const subArgs = ffmpegState.calls[2].args;
      expect(subArgs).toContain('-vf');
      const vf = subArgs[subArgs.indexOf('-vf') + 1];
      expect(vf).toContain('subtitles=');

      // Step 4: loudnorm
      const normArgs = ffmpegState.calls[3].args;
      expect(normArgs).toContain('-af');
      const af = normArgs[normArgs.indexOf('-af') + 1];
      expect(af).toContain('loudnorm=I=-14');

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('4 steps');
    });

    it('skips all steps when nothing is requested', async () => {
      const result = await client.callTool({
        name: 'workflow_talking_head',
        arguments: {
          input: '/tmp/raw.mp4',
          output: '/tmp/final.mp4',
          normalize_audio: false,
        },
      });

      // Just a copy
      expect(ffmpegState.calls).toHaveLength(1);
      expect(ffmpegState.calls[0].args).toContain('-c');
      expect(ffmpegState.calls[0].args).toContain('copy');

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('No processing steps');
    });

    it('runs only trim when other steps omitted', async () => {
      const result = await client.callTool({
        name: 'workflow_talking_head',
        arguments: {
          input: '/tmp/raw.mp4',
          output: '/tmp/final.mp4',
          trim_start_seconds: 5,
          trim_end_seconds: 20,
          normalize_audio: false,
        },
      });

      // trim + final copy
      expect(ffmpegState.calls).toHaveLength(2);

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('1 steps');
      expect(content[0].text).toContain('Trimmed');
    });

    it('runs only normalize when audio-only requested', async () => {
      const result = await client.callTool({
        name: 'workflow_talking_head',
        arguments: {
          input: '/tmp/raw.mp4',
          output: '/tmp/final.mp4',
          normalize_audio: true,
          target_lufs: -16,
        },
      });

      // normalize + final copy
      expect(ffmpegState.calls).toHaveLength(2);
      const normArgs = ffmpegState.calls[0].args;
      expect(normArgs).toContain('-af');
      const af = normArgs[normArgs.indexOf('-af') + 1];
      expect(af).toContain('I=-16');

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Audio normalized');
    });
  });

  // ── workflow_ad_creative_set ──────────────────────────────────────────

  describe('workflow_ad_creative_set', () => {
    it('generates 6 default banner sizes', async () => {
      const result = await client.callTool({
        name: 'workflow_ad_creative_set',
        arguments: {
          background: '/tmp/bg.jpg',
          output_dir: '/tmp/ads',
          headline: 'Big Sale',
          cta_text: 'Shop Now',
        },
      });

      // 6 default sizes
      expect(mockState.calls).toHaveLength(6);

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content[0].text;
      expect(text).toContain('6 banners');
      expect(text).toContain('leaderboard');
      expect(text).toContain('medium-rectangle');
      expect(text).toContain('mobile-banner');
    });

    it('generates custom banner sizes when provided', async () => {
      const result = await client.callTool({
        name: 'workflow_ad_creative_set',
        arguments: {
          background: '/tmp/bg.jpg',
          output_dir: '/tmp/ads',
          headline: 'Test',
          sizes: [
            { name: 'square', w: 250, h: 250 },
            { name: 'wide', w: 970, h: 90 },
          ],
        },
      });

      expect(mockState.calls).toHaveLength(2);

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('2 banners');
      expect(content[0].text).toContain('square');
      expect(content[0].text).toContain('wide');
    });

    it('includes headline and CTA in magick args', async () => {
      await client.callTool({
        name: 'workflow_ad_creative_set',
        arguments: {
          background: '/tmp/bg.jpg',
          output_dir: '/tmp/ads',
          headline: 'Summer Sale',
          cta_text: 'Buy Now',
          headline_color: 'yellow',
          cta_color: 'black',
          cta_background: '#00FF00',
        },
      });

      // Check first banner call contains headline and CTA
      const args = mockState.calls[0].args;
      expect(args).toContain('Summer Sale');
      expect(args).toContain('Buy Now');
      expect(args).toContain('yellow');
      expect(args).toContain('#00FF00');
    });

    it('uses custom font when font_file provided', async () => {
      await client.callTool({
        name: 'workflow_ad_creative_set',
        arguments: {
          background: '/tmp/bg.jpg',
          output_dir: '/tmp/ads',
          headline: 'Test',
          font_file: '/tmp/Custom.ttf',
        },
      });

      for (const call of mockState.calls) {
        expect(call.args).toContain('-font');
        expect(call.args).toContain('/tmp/Custom.ttf');
      }
    });
  });
});
