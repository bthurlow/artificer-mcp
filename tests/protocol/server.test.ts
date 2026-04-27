import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

vi.mock('../../src/utils/exec.js', async () => {
  const { createExecMock } = await import('../helpers/mock-exec.js');
  return createExecMock();
});

import { mockState, resetMock, setIdentifyOutput, mockMagick } from '../helpers/mock-exec.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createTestServerClient } from '../helpers/server.js';

/**
 * All 137 tool names registered by the artificer-mcp server, grouped by category.
 */
const EXPECTED_TOOLS = {
  core: [
    'resize',
    'crop',
    'smart-crop',
    'rotate',
    'flip',
    'format-convert',
    'compress',
    'info',
    'strip-metadata',
    'batch',
  ],
  text: ['text-overlay', 'text-fit', 'text-path', 'annotate', 'caption-bar'],
  compositing: [
    'composite',
    'watermark',
    'gradient-overlay',
    'background-remove',
    'drop-shadow',
    'border',
    'rounded-corners',
    'mask-apply',
  ],
  color: [
    'adjust',
    'tint',
    'blur',
    'sharpen',
    'pixelate-region',
    'color-extract',
    'normalize',
    'vignette',
  ],
  content: [
    'thumbnail',
    'collage',
    'before-after',
    'gif-from-frames',
    'sticker-cutout',
  ],
  social: ['social-card', 'carousel-set', 'quote-card', 'email-header'],
  ads: [
    'banner-set',
    'cta-button',
    'price-badge',
    'a-b-variants',
    'template-fill',
    'qr-code-overlay',
    'product-mockup',
  ],
  assets: [
    'responsive-set',
    'favicon-set',
    'app-icon-set',
    'splash-screen',
    'sprite-sheet',
    'nine-patch',
    'aspect-crop-set',
    'pdf-to-image',
    'image-diff',
    'optimize-batch',
  ],
  storage: [
    'storage_upload',
    'storage_download',
    'storage_list',
    'storage_delete',
    'storage_exists',
    'storage_get_public_url',
    'storage_get_signed_url',
  ],
  video: [
    'video_concatenate',
    'video_trim',
    'video_change_aspect_ratio',
    'video_convert_format',
    'video_change_speed',
    'video_set_resolution',
    'video_add_transitions',
    'video_add_image_overlay',
    'video_add_text_overlay',
    'video_add_subtitles',
    'video_add_b_roll',
    'video_set_bitrate',
    'video_set_codec',
    'video_set_frame_rate',
    'video_from_image',
    'video_set_audio',
    'build_ass_karaoke',
  ],
  audio: [
    'audio_extract_from_video',
    'audio_normalize',
    'audio_convert_format',
    'audio_convert_properties',
    'audio_set_bitrate',
    'audio_set_channels',
    'audio_set_sample_rate',
    'audio_remove_silence',
    'audio_mix',
    'audio_pad',
  ],
  generation: [
    'gemini_generate_image',
    'gemini_edit_image',
    'gemini_upscale_image',
    'gemini_generate_video',
    'gemini_nanobanana_generate_image',
    'gemini_generate_speech',
    'gemini_generate_music',
    'gemini_generate_music_live',
    'fal_generate_video',
    'fal_classify_text',
    'fal_generate_speech',
    'fal_generate_music',
    'fal_transcribe',
  ],
  guides: [
    'gemini_image_prompt_guide',
    'gemini_nanobanana_prompt_guide',
    'veo_video_prompt_guide',
    'gemini_tts_prompt_guide',
    'gemini_lyria_prompt_guide',
    'wan_video_prompt_guide',
    'kling_avatar_prompt_guide',
    'veed_fabric_prompt_guide',
    'elevenlabs_speech_prompt_guide',
    'elevenlabs_dialogue_prompt_guide',
    'elevenlabs_music_prompt_guide',
    'elevenlabs_sfx_prompt_guide',
    'minimax_speech_prompt_guide',
    'minimax_voice_clone_prompt_guide',
    'minimax_music_prompt_guide',
    'dia_dialogue_prompt_guide',
    'lyria2_prompt_guide',
    'stable_audio_prompt_guide',
    'cassette_sfx_prompt_guide',
    'transcription_prompt_guide',
    'ass_karaoke_prompt_guide',
    'brand_spec_get',
  ],
  catalog: [
    'model_catalog',
  ],
  workflows: [
    'workflow_brand_asset_pack',
    'workflow_social_carousel',
    'workflow_carousel_compose',
    'workflow_talking_head',
    'workflow_ad_creative_set',
    'workflow_ig_reel',
    'workflow_tiktok_reel',
    'workflow_yt_short',
    'workflow_fb_reel',
    'workflow_narrated_explainer',
  ],
} as const;

const ALL_TOOL_NAMES = Object.values(EXPECTED_TOOLS).flat();

describe('MCP Protocol — artificer-mcp Server', () => {
  let server: McpServer;
  let client: Client;
  let cleanup: () => Promise<void>;
  let tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>;

  beforeAll(async () => {
    const ctx = await createTestServerClient();
    server = ctx.server;
    client = ctx.client;
    cleanup = ctx.cleanup;

    const result = await client.listTools();
    tools = result.tools as typeof tools;
  });

  afterAll(async () => {
    await cleanup();
  });

  // ── 1. Server initialization ──────────────────────────────────────────────

  describe('server initialization', () => {
    it('should connect server and client successfully', () => {
      expect(server).toBeDefined();
      expect(client).toBeDefined();
    });
  });

  // ── 2. Tool discovery ─────────────────────────────────────────────────────

  describe('tool discovery', () => {
    it('should return exactly 137 tools', () => {
      expect(tools).toHaveLength(137);
    });
  });

  // ── 3. Tool names ─────────────────────────────────────────────────────────

  describe('tool names', () => {
    it('should contain all 137 expected tool names', () => {
      const registeredNames = tools.map((t) => t.name).sort();
      const expectedNames = [...ALL_TOOL_NAMES].sort();

      expect(registeredNames).toEqual(expectedNames);
    });

    it.each(ALL_TOOL_NAMES)('should include tool "%s"', (name) => {
      expect(tools.some((t) => t.name === name)).toBe(true);
    });
  });

  // ── 4. Tool descriptions ──────────────────────────────────────────────────

  describe('tool descriptions', () => {
    it('every tool should have a non-empty description string', () => {
      for (const tool of tools) {
        expect(tool.description, `tool "${tool.name}" missing description`).toBeTruthy();
        expect(typeof tool.description).toBe('string');
        expect(tool.description.length).toBeGreaterThan(0);
      }
    });
  });

  // ── 5. Tool schemas ───────────────────────────────────────────────────────

  describe('tool schemas', () => {
    it('every tool should have an inputSchema with type "object" and properties', () => {
      for (const tool of tools) {
        expect(tool.inputSchema, `tool "${tool.name}" missing inputSchema`).toBeDefined();
        expect(tool.inputSchema.type, `tool "${tool.name}" schema type`).toBe('object');
        expect(
          tool.inputSchema.properties,
          `tool "${tool.name}" missing properties`,
        ).toBeDefined();
        expect(typeof tool.inputSchema.properties).toBe('object');
      }
    });
  });

  // ── 6. Category coverage ──────────────────────────────────────────────────

  describe('category coverage', () => {
    const registeredNames = () => new Set(tools.map((t) => t.name));

    it.each(Object.entries(EXPECTED_TOOLS))(
      'should include all tools from the "%s" category',
      (category, toolNames) => {
        const registered = registeredNames();
        for (const name of toolNames) {
          expect(registered.has(name), `${category}/${name} not found`).toBe(true);
        }
      },
    );

    it('should cover exactly 15 categories', () => {
      expect(Object.keys(EXPECTED_TOOLS)).toHaveLength(15);
    });
  });

  // ── 7. Tool call with valid params ────────────────────────────────────────

  describe('tool call with valid params', () => {
    it('should return a well-formed response when calling the "info" tool', async () => {
      resetMock();

      const result = await client.callTool({
        name: 'info',
        arguments: { input: '/tmp/test.png' },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);

      const first = (result.content as Array<{ type: string; text: string }>)[0];
      expect(first.type).toBe('text');
      expect(typeof first.text).toBe('string');
    });

    it('should invoke the mocked exec when calling a tool', async () => {
      resetMock();

      await client.callTool({
        name: 'info',
        arguments: { input: '/tmp/test.png' },
      });

      expect(mockState.calls.length).toBeGreaterThan(0);
      expect(mockState.calls[0].args).toContain('identify');
    });
  });

  // ── 8. Tool call with missing required params ─────────────────────────────

  describe('tool call with missing required params', () => {
    it('should return an error when required params are omitted', async () => {
      const result = await client.callTool({
        name: 'resize',
        arguments: {},
      });

      // The MCP SDK wraps validation errors in the response content
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /error|invalid|required/i.test(text);
      expect(isError).toBe(true);
    });
  });

  // ── 9. Unknown tool ───────────────────────────────────────────────────────

  describe('unknown tool', () => {
    it('should return an error when calling a nonexistent tool', async () => {
      try {
        const result = await client.callTool({
          name: 'nonexistent-tool-that-does-not-exist',
          arguments: {},
        });

        // If it does not throw, the response should indicate an error
        expect(result).toBeDefined();
        const content = result.content as Array<{ type: string; text: string }>;
        const text = content.map((c) => c.text).join(' ');
        const isError = result.isError === true || /error|not found|unknown/i.test(text);
        expect(isError).toBe(true);
      } catch (err: unknown) {
        // The SDK may throw for unknown tools — that is acceptable
        expect(err).toBeDefined();
      }
    });
  });
});
