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

  // ── workflow_carousel_compose ─────────────────────────────────────────

  describe('workflow_carousel_compose', () => {
    it('composes multi-element slide: color bg + text + rect', async () => {
      const result = await client.callTool({
        name: 'workflow_carousel_compose',
        arguments: {
          slides: [
            {
              background: { type: 'color', color: '#ffffff' },
              elements: [
                {
                  type: 'text',
                  content: 'MYTH:',
                  font_size: 60,
                  color: '#b0445b',
                  gravity: 'NorthWest',
                  x: 80,
                  y: 100,
                },
                {
                  type: 'rect',
                  x: 0,
                  y: 900,
                  width: 1080,
                  height: 20,
                  color: '#b0445b',
                },
              ],
            },
          ],
          output_dir: '/tmp/carousel',
          width: 1080,
          height: 1080,
        },
      });

      expect(mockState.calls).toHaveLength(1);
      const args = mockState.calls[0].args;
      // Color background
      expect(args).toContain('1080x1080');
      expect(args).toContain('xc:#ffffff');
      // Text element
      expect(args).toContain('MYTH:');
      expect(args).toContain('60');
      expect(args).toContain('#b0445b');
      // Rect element
      expect(args.some((a: string) => a.startsWith('rectangle 0,900,1079,919'))).toBe(true);

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('1 slides');
      expect(content[0].text).toContain('2 elements');
    });

    it('supports image background with overlay', async () => {
      await client.callTool({
        name: 'workflow_carousel_compose',
        arguments: {
          slides: [
            {
              background: {
                type: 'image',
                source: '/tmp/bg.jpg',
                overlay_color: '#00000080',
              },
              elements: [
                {
                  type: 'text',
                  content: 'Hello',
                  font_size: 48,
                  color: 'white',
                  gravity: 'Center',
                  x: 0,
                  y: 0,
                },
              ],
            },
          ],
          output_dir: '/tmp/carousel',
        },
      });

      const args = mockState.calls[0].args;
      expect(args[0]).toBe('/tmp/bg.jpg');
      expect(args).toContain('xc:#00000080');
      expect(args).toContain('Hello');
    });

    it('uses brand.font as default for text elements', async () => {
      await client.callTool({
        name: 'workflow_carousel_compose',
        arguments: {
          slides: [
            {
              background: { type: 'color', color: '#fff' },
              elements: [
                {
                  type: 'text',
                  content: 'Branded',
                  font_size: 32,
                  color: 'black',
                  gravity: 'NorthWest',
                  x: 10,
                  y: 10,
                },
              ],
            },
          ],
          output_dir: '/tmp/carousel',
          brand: { font: '/tmp/DMSans.ttf' },
        },
      });

      const args = mockState.calls[0].args;
      expect(args).toContain('-font');
      expect(args).toContain('/tmp/DMSans.ttf');
    });

    it('applies filename_pattern with zero-padded index', async () => {
      const result = await client.callTool({
        name: 'workflow_carousel_compose',
        arguments: {
          slides: [
            {
              background: { type: 'color', color: '#fff' },
              elements: [],
            },
            {
              background: { type: 'color', color: '#fff' },
              elements: [],
            },
          ],
          output_dir: '/tmp/carousel',
          filename_pattern: 'slide_{n:03d}.png',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content[0].text;
      expect(text).toContain('slide_001.png');
      expect(text).toContain('slide_002.png');
    });

    it('composites image element with resize', async () => {
      await client.callTool({
        name: 'workflow_carousel_compose',
        arguments: {
          slides: [
            {
              background: { type: 'color', color: '#fff' },
              elements: [
                {
                  type: 'image',
                  source: '/tmp/icon.png',
                  x: 100,
                  y: 200,
                  width: 150,
                  height: 150,
                },
              ],
            },
          ],
          output_dir: '/tmp/carousel',
        },
      });

      const args = mockState.calls[0].args;
      expect(args).toContain('/tmp/icon.png');
      expect(args).toContain('150x150!');
      expect(args).toContain('+100+200');
      expect(args).toContain('-composite');
    });

    it('draws a line element with stroke width', async () => {
      await client.callTool({
        name: 'workflow_carousel_compose',
        arguments: {
          slides: [
            {
              background: { type: 'color', color: '#fff' },
              elements: [
                {
                  type: 'line',
                  x1: 100,
                  y1: 200,
                  x2: 900,
                  y2: 200,
                  color: '#b0445b',
                  width: 4,
                },
              ],
            },
          ],
          output_dir: '/tmp/carousel',
        },
      });

      const args = mockState.calls[0].args;
      expect(args).toContain('-strokewidth');
      expect(args).toContain('4');
      expect(args.some((a: string) => a.startsWith('line 100,200 900,200'))).toBe(true);
    });
  });

  // ── workflow_ig_reel ───────────────────────────────────────────────────

  describe('workflow_ig_reel', () => {
    it('runs minimal pipeline: normalize clips + concat + normalize audio + final copy', async () => {
      const result = await client.callTool({
        name: 'workflow_ig_reel',
        arguments: {
          clips: ['/tmp/a.mp4', '/tmp/b.mp4'],
          output: '/tmp/reel.mp4',
        },
      });

      // Stages for minimal:
      // 1. normalize each clip (2 calls)
      // 2. concat (demuxer, 1 call)
      // 3. normalize audio (1 call)
      // 4. final copy (1 call)
      expect(ffmpegState.calls.length).toBe(5);

      // First two calls are clip normalization — should include 1080:1920 scale
      for (let i = 0; i < 2; i++) {
        const vf = ffmpegState.calls[i].args[ffmpegState.calls[i].args.indexOf('-vf') + 1];
        expect(vf).toContain('1080:1920');
        expect(vf).toContain('format=yuv420p');
      }

      // The loudnorm filter must be applied
      const normCall = ffmpegState.calls.find((c) =>
        c.args.some((a) => typeof a === 'string' && a.includes('loudnorm=I=-14')),
      );
      expect(normCall).toBeDefined();

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('IG Reel composed');
      expect(content[0].text).toContain('1080×1920');
    });

    it('adds title + end cards and re-concatenates', async () => {
      await client.callTool({
        name: 'workflow_ig_reel',
        arguments: {
          clips: ['/tmp/body.mp4'],
          output: '/tmp/reel.mp4',
          title_card: { image: '/tmp/title.png', duration_seconds: 2 },
          end_card: { image: '/tmp/end.png', duration_seconds: 3 },
        },
      });

      // Clip normalization (1) + title encode (1) + end encode (1) +
      // card concat (1) + audio normalize (1) + final copy (1) = 6
      expect(ffmpegState.calls.length).toBe(6);

      // One call creates the title card from image: -loop 1 with -t 2
      const titleCall = ffmpegState.calls.find(
        (c) => c.args.includes('-loop') && c.args.includes('/tmp/title.png'),
      );
      expect(titleCall).toBeDefined();
      const tIdx = titleCall!.args.indexOf('-t');
      expect(titleCall!.args[tIdx + 1]).toBe('2');

      const endCall = ffmpegState.calls.find(
        (c) => c.args.includes('-loop') && c.args.includes('/tmp/end.png'),
      );
      expect(endCall).toBeDefined();
    });

    it('mixes music bed with sidechain duck when duck_to is set', async () => {
      await client.callTool({
        name: 'workflow_ig_reel',
        arguments: {
          clips: ['/tmp/body.mp4'],
          output: '/tmp/reel.mp4',
          music: {
            input: '/tmp/music.mp3',
            volume: 0.25,
            duck_to: -12,
          },
        },
      });

      // Find the mix ffmpeg call — it has two inputs (voice + music) and a
      // filter_complex that includes sidechaincompress.
      const mixCall = ffmpegState.calls.find((c) => {
        const fc = c.args.includes('-filter_complex')
          ? c.args[c.args.indexOf('-filter_complex') + 1]
          : '';
        return (
          typeof fc === 'string' && fc.includes('sidechaincompress') && fc.includes('amix=inputs=2')
        );
      });
      expect(mixCall).toBeDefined();
    });

    it('burns captions when captions_srt is set', async () => {
      await client.callTool({
        name: 'workflow_ig_reel',
        arguments: {
          clips: ['/tmp/body.mp4'],
          output: '/tmp/reel.mp4',
          captions_srt: '/tmp/captions.srt',
        },
      });

      const subCall = ffmpegState.calls.find((c) => {
        const vf = c.args.includes('-vf') ? c.args[c.args.indexOf('-vf') + 1] : '';
        return typeof vf === 'string' && vf.includes('subtitles=');
      });
      expect(subCall).toBeDefined();
    });

    it('overlays watermark with gravity-based position', async () => {
      await client.callTool({
        name: 'workflow_ig_reel',
        arguments: {
          clips: ['/tmp/body.mp4'],
          output: '/tmp/reel.mp4',
          watermark: {
            image: '/tmp/logo.png',
            gravity: 'SouthEast',
            x: 40,
            y: 120,
            opacity: 0.8,
          },
        },
      });

      const wmCall = ffmpegState.calls.find((c) => {
        const fc = c.args.includes('-filter_complex')
          ? c.args[c.args.indexOf('-filter_complex') + 1]
          : '';
        return typeof fc === 'string' && fc.includes('overlay=') && fc.includes('colorchannelmixer');
      });
      expect(wmCall).toBeDefined();
      const fc = wmCall!.args[wmCall!.args.indexOf('-filter_complex') + 1];
      // SouthEast: W-w-40:H-h-120
      expect(fc).toContain('W-w-40:H-h-120');
      expect(fc).toContain('aa=0.8');
    });

    it('applies xfade transition when transition is set', async () => {
      await client.callTool({
        name: 'workflow_ig_reel',
        arguments: {
          clips: ['/tmp/a.mp4', '/tmp/b.mp4', '/tmp/c.mp4'],
          output: '/tmp/reel.mp4',
          transition: 'fade',
          transition_duration: 0.5,
        },
      });

      const xfadeCall = ffmpegState.calls.find((c) => {
        const fc = c.args.includes('-filter_complex')
          ? c.args[c.args.indexOf('-filter_complex') + 1]
          : '';
        return typeof fc === 'string' && fc.includes('xfade=transition=fade');
      });
      expect(xfadeCall).toBeDefined();
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

describe('gravityToOverlayExpr', () => {
  // Imported lazily to avoid pulling in the tool-registration side effects
  // of src/workflows/index.ts until all the outer mocks are installed.
  it('emits the correct overlay=W/H expression for each gravity', async () => {
    const { gravityToOverlayExpr } = await import('../../../src/workflows/index.js');
    expect(gravityToOverlayExpr('NorthWest', 10, 20)).toBe('10:20');
    expect(gravityToOverlayExpr('North', 10, 20)).toBe('(W-w)/2+10:20');
    expect(gravityToOverlayExpr('NorthEast', 10, 20)).toBe('W-w-10:20');
    expect(gravityToOverlayExpr('West', 10, 20)).toBe('10:(H-h)/2+20');
    expect(gravityToOverlayExpr('Center', 10, 20)).toBe('(W-w)/2+10:(H-h)/2+20');
    expect(gravityToOverlayExpr('East', 10, 20)).toBe('W-w-10:(H-h)/2+20');
    expect(gravityToOverlayExpr('SouthWest', 10, 20)).toBe('10:H-h-20');
    expect(gravityToOverlayExpr('South', 10, 20)).toBe('(W-w)/2+10:H-h-20');
    expect(gravityToOverlayExpr('SouthEast', 10, 20)).toBe('W-w-10:H-h-20');
  });

  it('falls back to NorthWest-equivalent for an unknown gravity', async () => {
    const { gravityToOverlayExpr } = await import('../../../src/workflows/index.js');
    expect(gravityToOverlayExpr('Weirdness', 5, 7)).toBe('5:7');
  });
});
