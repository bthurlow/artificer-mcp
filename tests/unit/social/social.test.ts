import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

vi.mock('../../../src/utils/exec.js', async () => {
  const { createExecMock } = await import('../../helpers/mock-exec.js');
  return createExecMock();
});

import { mockState, resetMock } from '../../helpers/mock-exec.js';
import { createTestServerClient } from '../../helpers/server.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('Social Tools', () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const setup = await createTestServerClient();
    client = setup.client;
    cleanup = setup.cleanup;
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(() => {
    resetMock();
  });

  // ── social-card ────────────────────────────────────────────────────────

  describe('social-card', () => {
    it('generates OG card with correct 1200x630 dimensions', async () => {
      const result = await client.callTool({
        name: 'social-card',
        arguments: {
          input: '/test/hero.jpg',
          output_dir: '/out/social',
          platforms: ['og'],
        },
      });

      expect(mockState.calls.length).toBeGreaterThan(0);
      const args = mockState.calls[0].args;
      expect(args[0]).toBe('/test/hero.jpg');
      expect(args).toContain('-resize');
      expect(args).toContain('1200x630^');
      expect(args).toContain('-gravity');
      expect(args).toContain('center');
      expect(args).toContain('-extent');
      expect(args).toContain('1200x630');
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('social cards');
      expect(content[0].text).toContain('og');
    });

    it('adds title text overlay when title is provided', async () => {
      await client.callTool({
        name: 'social-card',
        arguments: {
          input: '/test/hero.jpg',
          output_dir: '/out/social',
          platforms: ['og'],
          title: 'My Post Title',
        },
      });

      const args = mockState.calls[0].args;
      expect(args).toContain('-annotate');
      expect(args).toContain('My Post Title');
      expect(args).toContain('gradient:#00000080-transparent');
    });
  });

  // ── carousel-set ───────────────────────────────────────────────────────

  describe('carousel-set', () => {
    it('generates output for each input', async () => {
      const result = await client.callTool({
        name: 'carousel-set',
        arguments: {
          inputs: ['/test/slide1.jpg'],
          output_dir: '/out/carousel',
        },
      });

      expect(mockState.calls.length).toBeGreaterThan(0);
      const args = mockState.calls[0].args;
      expect(args[0]).toBe('/test/slide1.jpg');
      expect(args).toContain('-resize');
      expect(args).toContain('1080x1080^');
      expect(args).toContain('-extent');
      expect(args).toContain('1080x1080');
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Carousel');
      expect(content[0].text).toContain('1 slides');
    });

    it('adds slide numbers with circle style by default', async () => {
      await client.callTool({
        name: 'carousel-set',
        arguments: {
          inputs: ['/test/slide1.jpg', '/test/slide2.jpg'],
          output_dir: '/out/carousel',
        },
      });

      // 2 slides => 2 magick calls
      expect(mockState.calls.length).toBe(2);
      // Circle badge: draw circle command
      const args = mockState.calls[0].args;
      expect(args).toContain('-draw');
      expect(args.some((a: string) => a.includes('circle'))).toBe(true);
    });
  });

  // ── quote-card ─────────────────────────────────────────────────────────

  describe('quote-card', () => {
    it('builds caption: arg for quote text', async () => {
      const result = await client.callTool({
        name: 'quote-card',
        arguments: {
          output: '/out/quote.png',
          quote: 'The best things in life are free.',
        },
      });

      expect(mockState.calls.length).toBeGreaterThan(0);
      const args = mockState.calls[0].args;
      expect(args.some((a: string) => a.startsWith('caption:'))).toBe(true);
      expect(args.some((a: string) => a.includes('The best things in life are free.'))).toBe(true);
      // Default background color
      expect(args.some((a: string) => a.includes('xc:#1a1a2e'))).toBe(true);
      // Quotation mark
      expect(args).toContain('\u201C');
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Quote card');
    });

    it('includes attribution when provided', async () => {
      await client.callTool({
        name: 'quote-card',
        arguments: {
          output: '/out/quote.png',
          quote: 'Test quote',
          attribution: '— John Doe',
        },
      });

      const args = mockState.calls[0].args;
      expect(args).toContain('— John Doe');
      // Accent line drawn
      expect(args).toContain('-stroke');
      expect(args.some((a: string) => a.startsWith('line '))).toBe(true);
    });
  });

  // ── email-header ───────────────────────────────────────────────────────

  describe('email-header', () => {
    it('builds correct default 600x200 size args', async () => {
      const result = await client.callTool({
        name: 'email-header',
        arguments: {
          output: '/out/email-header.png',
        },
      });

      expect(mockState.calls.length).toBeGreaterThan(0);
      const args = mockState.calls[0].args;
      // No input => solid color background
      expect(args).toContain('-size');
      expect(args).toContain('600x200');
      expect(args.some((a: string) => a.startsWith('xc:'))).toBe(true);
      expect(args[args.length - 1]).toBe('/out/email-header.png');
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Email header');
      expect(content[0].text).toContain('600x200');
    });

    it('resizes input image when provided', async () => {
      await client.callTool({
        name: 'email-header',
        arguments: {
          input: '/test/banner.jpg',
          output: '/out/email-header.png',
        },
      });

      const args = mockState.calls[0].args;
      expect(args[0]).toBe('/test/banner.jpg');
      expect(args).toContain('-resize');
      expect(args).toContain('600x200^');
      expect(args).toContain('-extent');
      expect(args).toContain('600x200');
    });

    it('adds title text when specified', async () => {
      await client.callTool({
        name: 'email-header',
        arguments: {
          output: '/out/email-header.png',
          title: 'Weekly Newsletter',
        },
      });

      const args = mockState.calls[0].args;
      expect(args).toContain('Weekly Newsletter');
      expect(args).toContain('-annotate');
    });
  });
});
