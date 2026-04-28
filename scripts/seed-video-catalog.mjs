#!/usr/bin/env node
// @ts-check

/**
 * One-shot seeder for the full fal video catalog (t2v + i2v + multi-ref + FLF).
 *
 * Reads src/catalog/models.json, replaces the `video` capability block with the
 * full enumeration below, writes back. Run once after committing to ship the
 * complete fal video surface. Run again if fal adds new model families and we
 * decide to mirror them.
 *
 * Source: 2026-04-28 audit of `https://fal.ai/api/models?categories=text-to-video`
 * and `?categories=image-to-video`. Excludes streaming variants, pure v2v /
 * upscale / interp models, lipsync-only models (sync.so / latentsync), and
 * transitions / effects-only endpoints.
 *
 * Cost field is a placeholder — `scripts/sync-fal-specs.mjs` populates real
 * pricing from each model's llms.txt after this script runs.
 *
 * Usage:
 *   node scripts/seed-video-catalog.mjs           # write merged models.json
 *   node scripts/seed-video-catalog.mjs --dry     # print summary, no writes
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELS_JSON = resolve(__dirname, '..', 'src/catalog/models.json');

const PLACEHOLDER_COST = 'Pricing pending sync';

/**
 * Build a fal-only catalog entry. `stub` defaults to false.
 */
function falEntry(slug, falModel, guide, stub = false) {
  return {
    slug,
    prompt_guide: guide,
    access_routes: [
      {
        provider: 'fal',
        tool: 'fal_generate_video',
        model: falModel,
        cost: PLACEHOLDER_COST,
        key_env_var: 'FAL_KEY',
        stub,
      },
    ],
  };
}

/**
 * Build an entry with a Google route (gemini_generate_video) plus an optional
 * fal sibling route. Used for the Veo lineage where Google hosts the lite
 * variant directly and fal mirrors the full / fast / lite tiers.
 */
function googleAndFalEntry(slug, googleModel, falModel, guide) {
  return {
    slug,
    prompt_guide: guide,
    access_routes: [
      {
        provider: 'google',
        tool: 'gemini_generate_video',
        model: googleModel,
        cost: '~$0.05 per second (Lite) / ~$0.10 per second (Fast) / ~$0.40 per second (Standard); see Google Cloud pricing',
        key_env_var: 'GOOGLE_API_KEY',
        stub: false,
      },
      {
        provider: 'fal',
        tool: 'fal_generate_video',
        model: falModel,
        cost: PLACEHOLDER_COST,
        key_env_var: 'FAL_KEY',
        stub: false,
      },
    ],
  };
}

// ── video.cinematic ────────────────────────────────────────────────────────
// Premium tier: Veo, Sora, Luma Ray, Kling Master/O3/3, Seedance 2.x/1.5, Marey

const cinematic = [
  // Sora 2 (OpenAI on fal)
  falEntry('sora-2-pro-t2v', 'fal-ai/sora-2/text-to-video/pro', 'sora_video_prompt_guide'),
  falEntry('sora-2-pro-i2v', 'fal-ai/sora-2/image-to-video/pro', 'sora_video_prompt_guide'),
  falEntry('sora-2-t2v', 'fal-ai/sora-2/text-to-video', 'sora_video_prompt_guide'),
  falEntry('sora-2-i2v', 'fal-ai/sora-2/image-to-video', 'sora_video_prompt_guide'),

  // Veo 3.1 family (full / fast / lite × t2v / i2v / FLF / ref)
  falEntry('veo-3.1-t2v', 'fal-ai/veo3.1', 'veo_video_prompt_guide'),
  falEntry('veo-3.1-fast-t2v', 'fal-ai/veo3.1/fast', 'veo_video_prompt_guide'),
  // Lite tier — pair the Google Veo route here (it is Veo 3.1 Lite Preview)
  googleAndFalEntry(
    'veo-3.1-lite-t2v',
    'veo-3.1-lite-generate-preview',
    'fal-ai/veo3.1/lite',
    'veo_video_prompt_guide',
  ),
  falEntry('veo-3.1-i2v', 'fal-ai/veo3.1/image-to-video', 'veo_video_prompt_guide'),
  falEntry('veo-3.1-fast-i2v', 'fal-ai/veo3.1/fast/image-to-video', 'veo_video_prompt_guide'),
  falEntry('veo-3.1-lite-i2v', 'fal-ai/veo3.1/lite/image-to-video', 'veo_video_prompt_guide'),
  falEntry('veo-3.1-ref-to-video', 'fal-ai/veo3.1/reference-to-video', 'veo_video_prompt_guide'),
  falEntry('veo-3.1-flf', 'fal-ai/veo3.1/first-last-frame-to-video', 'veo_video_prompt_guide'),
  falEntry(
    'veo-3.1-fast-flf',
    'fal-ai/veo3.1/fast/first-last-frame-to-video',
    'veo_video_prompt_guide',
  ),
  falEntry(
    'veo-3.1-lite-flf',
    'fal-ai/veo3.1/lite/first-last-frame-to-video',
    'veo_video_prompt_guide',
  ),

  // Veo 3 family
  falEntry('veo-3-t2v', 'fal-ai/veo3', 'veo_video_prompt_guide'),
  falEntry('veo-3-fast-t2v', 'fal-ai/veo3/fast', 'veo_video_prompt_guide'),
  falEntry('veo-3-i2v', 'fal-ai/veo3/image-to-video', 'veo_video_prompt_guide'),
  falEntry('veo-3-fast-i2v', 'fal-ai/veo3/fast/image-to-video', 'veo_video_prompt_guide'),

  // Veo 2 (legacy)
  falEntry('veo-2-t2v', 'fal-ai/veo2', 'veo_video_prompt_guide'),

  // Luma Ray 2 family
  falEntry('luma-ray-2-t2v', 'fal-ai/luma-dream-machine/ray-2', 'luma_ray_prompt_guide'),
  falEntry(
    'luma-ray-2-i2v',
    'fal-ai/luma-dream-machine/ray-2/image-to-video',
    'luma_ray_prompt_guide',
  ),
  falEntry('luma-ray-2-flash-t2v', 'fal-ai/luma-dream-machine/ray-2-flash', 'luma_ray_prompt_guide'),
  falEntry(
    'luma-ray-2-flash-i2v',
    'fal-ai/luma-dream-machine/ray-2-flash/image-to-video',
    'luma_ray_prompt_guide',
  ),

  // Kling 3.0 (Pro / Std / 4K)
  falEntry(
    'kling-3-pro-t2v',
    'fal-ai/kling-video/v3/pro/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-3-pro-i2v',
    'fal-ai/kling-video/v3/pro/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-3-std-t2v',
    'fal-ai/kling-video/v3/standard/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-3-std-i2v',
    'fal-ai/kling-video/v3/standard/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-3-4k-t2v',
    'fal-ai/kling-video/v3/4k/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-3-4k-i2v',
    'fal-ai/kling-video/v3/4k/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling O3 (Pro / Std / 4K + reference variants)
  falEntry(
    'kling-o3-pro-t2v',
    'fal-ai/kling-video/o3/pro/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o3-pro-i2v',
    'fal-ai/kling-video/o3/pro/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o3-std-t2v',
    'fal-ai/kling-video/o3/standard/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o3-std-i2v',
    'fal-ai/kling-video/o3/standard/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o3-pro-ref',
    'fal-ai/kling-video/o3/pro/reference-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o3-std-ref',
    'fal-ai/kling-video/o3/standard/reference-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o3-4k-i2v',
    'fal-ai/kling-video/o3/4k/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o3-4k-ref',
    'fal-ai/kling-video/o3/4k/reference-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling 2.x Master tier (premium prior-gen)
  falEntry(
    'kling-2.1-master-t2v',
    'fal-ai/kling-video/v2.1/master/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-2.1-master-i2v',
    'fal-ai/kling-video/v2.1/master/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-2-master-t2v',
    'fal-ai/kling-video/v2/master/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-2-master-i2v',
    'fal-ai/kling-video/v2/master/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling 2.5 Turbo (premium fast lane)
  falEntry(
    'kling-2.5-turbo-pro-t2v',
    'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-2.5-turbo-pro-i2v',
    'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
    'kling_video_prompt_guide',
  ),

  // ByteDance Seedance 2.0 (premium current)
  falEntry('seedance-2-t2v', 'bytedance/seedance-2.0/text-to-video', 'seedance_prompt_guide'),
  falEntry('seedance-2-i2v', 'bytedance/seedance-2.0/image-to-video', 'seedance_prompt_guide'),
  falEntry(
    'seedance-2-ref-to-video',
    'bytedance/seedance-2.0/reference-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-2-fast-t2v',
    'bytedance/seedance-2.0/fast/text-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-2-fast-i2v',
    'bytedance/seedance-2.0/fast/image-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-2-fast-ref',
    'bytedance/seedance-2.0/fast/reference-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1.5-pro-t2v',
    'fal-ai/bytedance/seedance/v1.5/pro/text-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1.5-pro-i2v',
    'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
    'seedance_prompt_guide',
  ),

  // Moonvalley Marey (licensed-data lineage)
  falEntry('marey-t2v', 'moonvalley/marey/t2v', 'marey_prompt_guide'),
  falEntry('marey-i2v', 'moonvalley/marey/i2v', 'marey_prompt_guide'),
];

// ── video.general ──────────────────────────────────────────────────────────
// Mid-tier versatile: Wan all tiers, Kling 1.x/2.x non-Master, Hailuo, Pika,
// PixVerse, LTX, Hunyuan, Vidu Q1-Q3, Kandinsky, Grok, Seedance Lite, Decart,
// Krea Wan, Cosmos, LongCat, Sana, MAGI, MultiShot, niche research models

const general = [
  // Wan 2.7 (latest)
  falEntry('wan-2.7-t2v', 'fal-ai/wan/v2.7/text-to-video', 'wan_video_prompt_guide'),
  falEntry('wan-2.7-ref-to-video', 'fal-ai/wan/v2.7/reference-to-video', 'wan_video_prompt_guide'),

  // Wan 2.6
  falEntry('wan-2.6-t2v', 'wan/v2.6/text-to-video', 'wan_video_prompt_guide'),
  falEntry('wan-2.6-i2v', 'wan/v2.6/image-to-video', 'wan_video_prompt_guide'),
  falEntry('wan-2.6-flash-i2v', 'wan/v2.6/image-to-video/flash', 'wan_video_prompt_guide'),

  // Wan 2.5 preview
  falEntry('wan-2.5-t2v', 'fal-ai/wan-25-preview/text-to-video', 'wan_video_prompt_guide'),
  falEntry('wan-2.5-i2v', 'fal-ai/wan-25-preview/image-to-video', 'wan_video_prompt_guide'),

  // Wan 2.2 A14B (open weights)
  falEntry('wan-2.2-a14b-t2v', 'fal-ai/wan/v2.2-a14b/text-to-video', 'wan_video_prompt_guide'),
  falEntry(
    'wan-2.2-a14b-turbo-t2v',
    'fal-ai/wan/v2.2-a14b/text-to-video/turbo',
    'wan_video_prompt_guide',
  ),
  falEntry(
    'wan-2.2-a14b-lora-t2v',
    'fal-ai/wan/v2.2-a14b/text-to-video/lora',
    'wan_video_prompt_guide',
  ),
  falEntry('wan-2.2-a14b-i2v', 'fal-ai/wan/v2.2-a14b/image-to-video', 'wan_video_prompt_guide'),
  falEntry(
    'wan-2.2-a14b-turbo-i2v',
    'fal-ai/wan/v2.2-a14b/image-to-video/turbo',
    'wan_video_prompt_guide',
  ),

  // Wan 2.2 5B (smaller open)
  falEntry('wan-2.2-5b-t2v', 'fal-ai/wan/v2.2-5b/text-to-video', 'wan_video_prompt_guide'),
  falEntry(
    'wan-2.2-5b-fastvideo-t2v',
    'fal-ai/wan/v2.2-5b/text-to-video/fast-wan',
    'wan_video_prompt_guide',
  ),
  falEntry(
    'wan-2.2-5b-distill-t2v',
    'fal-ai/wan/v2.2-5b/text-to-video/distill',
    'wan_video_prompt_guide',
  ),
  falEntry('wan-2.2-5b-i2v', 'fal-ai/wan/v2.2-5b/image-to-video', 'wan_video_prompt_guide'),

  // Wan 2.1 (compact pricing)
  falEntry('wan-2.1-t2v', 'fal-ai/wan-t2v', 'wan_video_prompt_guide'),
  falEntry('wan-2.1-i2v', 'fal-ai/wan-i2v', 'wan_video_prompt_guide'),
  falEntry('wan-2.1-pro-t2v', 'fal-ai/wan-pro/text-to-video', 'wan_video_prompt_guide'),
  falEntry('wan-2.1-pro-i2v', 'fal-ai/wan-pro/image-to-video', 'wan_video_prompt_guide'),
  // wan-2.1-1.3b-t2v removed — fal endpoint 404 as of 2026-04-28 sync.
  falEntry('wan-2.1-t2v-lora', 'fal-ai/wan-t2v-lora', 'wan_video_prompt_guide'),
  falEntry('wan-2.1-i2v-lora', 'fal-ai/wan-i2v-lora', 'wan_video_prompt_guide'),

  // Wan Alpha (transparent backgrounds — niche but unique, lives in general)
  falEntry('wan-alpha-t2v', 'fal-ai/wan-alpha', 'wan_video_prompt_guide'),

  // Krea-tuned Wan
  falEntry('krea-wan-14b-t2v', 'fal-ai/krea-wan-14b/text-to-video', 'wan_video_prompt_guide'),

  // Kling 2.6 (mid-tier with audio)
  falEntry(
    'kling-2.6-pro-t2v',
    'fal-ai/kling-video/v2.6/pro/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-2.6-pro-i2v',
    'fal-ai/kling-video/v2.6/pro/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling 2.5 Turbo Standard
  falEntry(
    'kling-2.5-turbo-std-i2v',
    'fal-ai/kling-video/v2.5-turbo/standard/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling 2.1 non-Master
  falEntry(
    'kling-2.1-pro-i2v',
    'fal-ai/kling-video/v2.1/pro/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-2.1-std-i2v',
    'fal-ai/kling-video/v2.1/standard/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling 1.6 (legacy mid)
  falEntry(
    'kling-1.6-pro-t2v',
    'fal-ai/kling-video/v1.6/pro/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-1.6-pro-i2v',
    'fal-ai/kling-video/v1.6/pro/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-1.6-std-t2v',
    'fal-ai/kling-video/v1.6/standard/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-1.6-std-i2v',
    'fal-ai/kling-video/v1.6/standard/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling 1.5 (legacy mid)
  falEntry(
    'kling-1.5-pro-t2v',
    'fal-ai/kling-video/v1.5/pro/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-1.5-pro-i2v',
    'fal-ai/kling-video/v1.5/pro/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling 1.0 (earliest)
  falEntry(
    'kling-1-std-t2v',
    'fal-ai/kling-video/v1/standard/text-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-1-std-i2v',
    'fal-ai/kling-video/v1/standard/image-to-video',
    'kling_video_prompt_guide',
  ),

  // Kling O1 (FLF + ref variants)
  falEntry(
    'kling-o1-i2v-flf',
    'fal-ai/kling-video/o1/image-to-video',
    'kling_video_prompt_guide',
  ),
  falEntry(
    'kling-o1-std-ref',
    'fal-ai/kling-video/o1/standard/reference-to-video',
    'kling_video_prompt_guide',
  ),

  // ByteDance Seedance 1.0
  falEntry(
    'seedance-1-pro-t2v',
    'fal-ai/bytedance/seedance/v1/pro/text-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1-pro-i2v',
    'fal-ai/bytedance/seedance/v1/pro/image-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1-pro-fast-t2v',
    'fal-ai/bytedance/seedance/v1/pro/fast/text-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1-pro-fast-i2v',
    'fal-ai/bytedance/seedance/v1/pro/fast/image-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1-lite-t2v',
    'fal-ai/bytedance/seedance/v1/lite/text-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1-lite-i2v',
    'fal-ai/bytedance/seedance/v1/lite/image-to-video',
    'seedance_prompt_guide',
  ),
  falEntry(
    'seedance-1-lite-ref',
    'fal-ai/bytedance/seedance/v1/lite/reference-to-video',
    'seedance_prompt_guide',
  ),

  // MiniMax Hailuo 2.3
  falEntry(
    'hailuo-2.3-pro-t2v',
    'fal-ai/minimax/hailuo-2.3/pro/text-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-2.3-pro-i2v',
    'fal-ai/minimax/hailuo-2.3/pro/image-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-2.3-std-t2v',
    'fal-ai/minimax/hailuo-2.3/standard/text-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-2.3-std-i2v',
    'fal-ai/minimax/hailuo-2.3/standard/image-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-2.3-fast-std-i2v',
    'fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video',
    'hailuo_prompt_guide',
  ),

  // MiniMax Hailuo 02
  falEntry(
    'hailuo-02-pro-t2v',
    'fal-ai/minimax/hailuo-02/pro/text-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-02-pro-i2v',
    'fal-ai/minimax/hailuo-02/pro/image-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-02-std-t2v',
    'fal-ai/minimax/hailuo-02/standard/text-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-02-std-i2v',
    'fal-ai/minimax/hailuo-02/standard/image-to-video',
    'hailuo_prompt_guide',
  ),
  falEntry(
    'hailuo-02-fast-i2v',
    'fal-ai/minimax/hailuo-02-fast/image-to-video',
    'hailuo_prompt_guide',
  ),

  // MiniMax Video 01 (legacy lineage; separate guide)
  falEntry('minimax-video-01-t2v', 'fal-ai/minimax/video-01', 'minimax_video_prompt_guide'),
  falEntry(
    'minimax-video-01-live-t2v',
    'fal-ai/minimax/video-01-live',
    'minimax_video_prompt_guide',
  ),
  falEntry(
    'minimax-video-01-live-i2v',
    'fal-ai/minimax/video-01-live/image-to-video',
    'minimax_video_prompt_guide',
  ),
  falEntry(
    'minimax-video-01-director-t2v',
    'fal-ai/minimax/video-01-director',
    'minimax_video_prompt_guide',
  ),
  falEntry(
    'minimax-video-01-director-i2v',
    'fal-ai/minimax/video-01-director/image-to-video',
    'minimax_video_prompt_guide',
  ),
  falEntry(
    'minimax-video-01-i2v',
    'fal-ai/minimax/video-01/image-to-video',
    'minimax_video_prompt_guide',
  ),
  falEntry(
    'minimax-video-01-subject-ref-i2v',
    'fal-ai/minimax/video-01-subject-reference',
    'minimax_video_prompt_guide',
  ),

  // Pika
  falEntry('pika-2.2-t2v', 'fal-ai/pika/v2.2/text-to-video', 'pika_prompt_guide'),
  falEntry('pika-2.1-t2v', 'fal-ai/pika/v2.1/text-to-video', 'pika_prompt_guide'),
  falEntry('pika-2.1-i2v', 'fal-ai/pika/v2.1/image-to-video', 'pika_prompt_guide'),
  falEntry('pika-2-turbo-t2v', 'fal-ai/pika/v2/turbo/text-to-video', 'pika_prompt_guide'),
  falEntry('pika-2-turbo-i2v', 'fal-ai/pika/v2/turbo/image-to-video', 'pika_prompt_guide'),
  falEntry('pika-2.2-pikascenes-i2v', 'fal-ai/pika/v2.2/pikascenes', 'pika_prompt_guide'),

  // PixVerse C1 / v6 / v5.x / v4.x / v3.5 / v4 — recent + legacy
  falEntry('pixverse-c1-t2v', 'fal-ai/pixverse/c1/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v6-t2v', 'fal-ai/pixverse/v6/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v6-i2v', 'fal-ai/pixverse/v6/image-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v5.6-t2v', 'fal-ai/pixverse/v5.6/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v5.6-i2v', 'fal-ai/pixverse/v5.6/image-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v5.5-t2v', 'fal-ai/pixverse/v5.5/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v5-t2v', 'fal-ai/pixverse/v5/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v4.5-t2v', 'fal-ai/pixverse/v4.5/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v4.5-i2v', 'fal-ai/pixverse/v4.5/image-to-video', 'pixverse_prompt_guide'),
  falEntry(
    'pixverse-v4.5-fast-t2v',
    'fal-ai/pixverse/v4.5/text-to-video/fast',
    'pixverse_prompt_guide',
  ),
  falEntry(
    'pixverse-v4.5-fast-i2v',
    'fal-ai/pixverse/v4.5/image-to-video/fast',
    'pixverse_prompt_guide',
  ),
  falEntry('pixverse-v4-t2v', 'fal-ai/pixverse/v4/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v4-i2v', 'fal-ai/pixverse/v4/image-to-video', 'pixverse_prompt_guide'),

  // LTX-2.3 (latest LTX line)
  falEntry('ltx-2.3-22b-t2v', 'fal-ai/ltx-2.3-22b/text-to-video', 'ltx_video_prompt_guide'),
  falEntry('ltx-2.3-22b-i2v', 'fal-ai/ltx-2.3-22b/image-to-video', 'ltx_video_prompt_guide'),
  falEntry(
    'ltx-2.3-22b-distilled-t2v',
    'fal-ai/ltx-2.3-22b/distilled/text-to-video',
    'ltx_video_prompt_guide',
  ),
  falEntry(
    'ltx-2.3-22b-distilled-i2v',
    'fal-ai/ltx-2.3-22b/distilled/image-to-video',
    'ltx_video_prompt_guide',
  ),
  falEntry(
    'ltx-2.3-22b-lora-t2v',
    'fal-ai/ltx-2.3-22b/text-to-video/lora',
    'ltx_video_prompt_guide',
  ),
  falEntry(
    'ltx-2.3-22b-lora-i2v',
    'fal-ai/ltx-2.3-22b/image-to-video/lora',
    'ltx_video_prompt_guide',
  ),
  falEntry(
    'ltx-2.3-22b-distilled-lora-t2v',
    'fal-ai/ltx-2.3-22b/distilled/text-to-video/lora',
    'ltx_video_prompt_guide',
  ),
  falEntry(
    'ltx-2.3-22b-distilled-lora-i2v',
    'fal-ai/ltx-2.3-22b/distilled/image-to-video/lora',
    'ltx_video_prompt_guide',
  ),
  falEntry('ltx-2.3-pro-t2v', 'fal-ai/ltx-2.3/text-to-video', 'ltx_video_prompt_guide'),
  falEntry('ltx-2.3-fast-t2v', 'fal-ai/ltx-2.3/text-to-video/fast', 'ltx_video_prompt_guide'),
  falEntry('ltx-2.3-pro-i2v', 'fal-ai/ltx-2.3/image-to-video', 'ltx_video_prompt_guide'),
  falEntry('ltx-2.3-fast-i2v', 'fal-ai/ltx-2.3/image-to-video/fast', 'ltx_video_prompt_guide'),

  // LTX-2 (prior gen)
  falEntry('ltx-2-pro-t2v', 'fal-ai/ltx-2/text-to-video', 'ltx_video_prompt_guide'),
  falEntry('ltx-2-fast-t2v', 'fal-ai/ltx-2/text-to-video/fast', 'ltx_video_prompt_guide'),
  falEntry('ltx-2-pro-i2v', 'fal-ai/ltx-2/image-to-video', 'ltx_video_prompt_guide'),
  falEntry('ltx-2-fast-i2v', 'fal-ai/ltx-2/image-to-video/fast', 'ltx_video_prompt_guide'),

  // LTX-2-19b (open weights)
  falEntry('ltx-2-19b-t2v', 'fal-ai/ltx-2-19b/text-to-video', 'ltx_video_prompt_guide'),
  falEntry(
    'ltx-2-19b-distilled-t2v',
    'fal-ai/ltx-2-19b/distilled/text-to-video',
    'ltx_video_prompt_guide',
  ),
  falEntry('ltx-2-19b-i2v', 'fal-ai/ltx-2-19b/image-to-video', 'ltx_video_prompt_guide'),
  falEntry(
    'ltx-2-19b-distilled-i2v',
    'fal-ai/ltx-2-19b/distilled/image-to-video',
    'ltx_video_prompt_guide',
  ),
  falEntry('ltx-2-19b-lora-t2v', 'fal-ai/ltx-2-19b/text-to-video/lora', 'ltx_video_prompt_guide'),
  falEntry(
    'ltx-2-19b-distilled-lora-t2v',
    'fal-ai/ltx-2-19b/distilled/text-to-video/lora',
    'ltx_video_prompt_guide',
  ),
  falEntry('ltx-2-19b-lora-i2v', 'fal-ai/ltx-2-19b/image-to-video/lora', 'ltx_video_prompt_guide'),
  falEntry(
    'ltx-2-19b-distilled-lora-i2v',
    'fal-ai/ltx-2-19b/distilled/image-to-video/lora',
    'ltx_video_prompt_guide',
  ),

  // LTX legacy
  falEntry('ltx-video-preview-t2v', 'fal-ai/ltx-video', 'ltx_video_prompt_guide'),
  falEntry(
    'ltx-video-13b-distilled-t2v',
    'fal-ai/ltx-video-13b-distilled',
    'ltx_video_prompt_guide',
  ),
  falEntry('ltx-video-13b-dev-t2v', 'fal-ai/ltx-video-13b-dev', 'ltx_video_prompt_guide'),
  falEntry(
    'ltx-video-13b-distilled-i2v',
    'fal-ai/ltx-video-13b-distilled/image-to-video',
    'ltx_video_prompt_guide',
  ),
  falEntry(
    'ltx-video-13b-dev-i2v',
    'fal-ai/ltx-video-13b-dev/image-to-video',
    'ltx_video_prompt_guide',
  ),
  falEntry(
    'ltx-video-lora-i2v',
    'fal-ai/ltx-video-lora/image-to-video',
    'ltx_video_prompt_guide',
  ),
  falEntry('ltx-video-v095-t2v', 'fal-ai/ltx-video-v095', 'ltx_video_prompt_guide'),
  falEntry('ltx-video-preview-i2v', 'fal-ai/ltx-video/image-to-video', 'ltx_video_prompt_guide'),
  falEntry('ltxv-13b-098-distilled-t2v', 'fal-ai/ltxv-13b-098-distilled', 'ltx_video_prompt_guide'),
  falEntry(
    'ltxv-13b-098-distilled-i2v',
    'fal-ai/ltxv-13b-098-distilled/image-to-video',
    'ltx_video_prompt_guide',
  ),

  // Tencent Hunyuan
  falEntry('hunyuan-video-t2v', 'fal-ai/hunyuan-video', 'hunyuan_video_prompt_guide'),
  falEntry(
    'hunyuan-video-1.5-t2v',
    'fal-ai/hunyuan-video-v1.5/text-to-video',
    'hunyuan_video_prompt_guide',
  ),
  falEntry(
    'hunyuan-video-1.5-i2v',
    'fal-ai/hunyuan-video-v1.5/image-to-video',
    'hunyuan_video_prompt_guide',
  ),
  falEntry(
    'hunyuan-video-i2v',
    'fal-ai/hunyuan-video-image-to-video',
    'hunyuan_video_prompt_guide',
  ),
  falEntry('hunyuan-video-lora-t2v', 'fal-ai/hunyuan-video-lora', 'hunyuan_video_prompt_guide'),
  falEntry(
    'hunyuan-video-img2vid-lora-i2v',
    'fal-ai/hunyuan-video-img2vid-lora',
    'hunyuan_video_prompt_guide',
  ),
  falEntry('hunyuan-custom-i2v', 'fal-ai/hunyuan-custom', 'hunyuan_video_prompt_guide'),

  // Vidu Q3
  falEntry('vidu-q3-t2v', 'fal-ai/vidu/q3/text-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-q3-i2v', 'fal-ai/vidu/q3/image-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-q3-turbo-t2v', 'fal-ai/vidu/q3/text-to-video/turbo', 'vidu_prompt_guide'),
  falEntry('vidu-q3-turbo-i2v', 'fal-ai/vidu/q3/image-to-video/turbo', 'vidu_prompt_guide'),
  falEntry('vidu-q3-ref-mix-i2v', 'fal-ai/vidu/q3/reference-to-video/mix', 'vidu_prompt_guide'),

  // Vidu Q2
  falEntry('vidu-q2-t2v', 'fal-ai/vidu/q2/text-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-q2-turbo-i2v', 'fal-ai/vidu/q2/image-to-video/turbo', 'vidu_prompt_guide'),
  falEntry('vidu-q2-pro-i2v', 'fal-ai/vidu/q2/image-to-video/pro', 'vidu_prompt_guide'),
  falEntry('vidu-q2-pro-ref-i2v', 'fal-ai/vidu/q2/reference-to-video/pro', 'vidu_prompt_guide'),

  // Vidu Q1
  falEntry('vidu-q1-t2v', 'fal-ai/vidu/q1/text-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-q1-i2v', 'fal-ai/vidu/q1/image-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-q1-flf-i2v', 'fal-ai/vidu/q1/start-end-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-q1-ref-i2v', 'fal-ai/vidu/q1/reference-to-video', 'vidu_prompt_guide'),

  // Vidu basic
  falEntry('vidu-basic-i2v', 'fal-ai/vidu/image-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-ref-i2v', 'fal-ai/vidu/reference-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-flf-i2v', 'fal-ai/vidu/start-end-to-video', 'vidu_prompt_guide'),
  falEntry('vidu-template-i2v', 'fal-ai/vidu/template-to-video', 'vidu_prompt_guide'),

  // Kandinsky 5
  falEntry('kandinsky-5-t2v', 'fal-ai/kandinsky5/text-to-video', 'kandinsky_video_prompt_guide'),
  falEntry(
    'kandinsky-5-pro-t2v',
    'fal-ai/kandinsky5-pro/text-to-video',
    'kandinsky_video_prompt_guide',
  ),
  falEntry(
    'kandinsky-5-pro-i2v',
    'fal-ai/kandinsky5-pro/image-to-video',
    'kandinsky_video_prompt_guide',
  ),
  falEntry(
    'kandinsky-5-distill-t2v',
    'fal-ai/kandinsky5/text-to-video/distill',
    'kandinsky_video_prompt_guide',
  ),

  // Grok Imagine (xAI)
  falEntry('grok-imagine-t2v', 'xai/grok-imagine-video/text-to-video', 'grok_imagine_prompt_guide'),
  falEntry(
    'grok-imagine-i2v',
    'xai/grok-imagine-video/image-to-video',
    'grok_imagine_prompt_guide',
  ),
  falEntry(
    'grok-imagine-ref-i2v',
    'xai/grok-imagine-video/reference-to-video',
    'grok_imagine_prompt_guide',
  ),

  // Decart Lucy (lightning-fast)
  falEntry('decart-lucy-i2v', 'decart/lucy-i2v', 'decart_lucy_prompt_guide'),
  // decart-lucy-5b-i2v removed — fal endpoint 404 as of 2026-04-28 sync.

  // CogVideoX (open weights)
  falEntry('cogvideox-5b-t2v', 'fal-ai/cogvideox-5b', 'cogvideox_prompt_guide'),
  falEntry('cogvideox-5b-i2v', 'fal-ai/cogvideox-5b/image-to-video', 'cogvideox_prompt_guide'),

  // Mochi (open weights)
  falEntry('mochi-v1-t2v', 'fal-ai/mochi-v1', 'mochi_prompt_guide'),

  // NVIDIA Cosmos (world-model lineage)
  falEntry(
    'cosmos-2.5-t2v',
    'fal-ai/cosmos-predict-2.5/text-to-video',
    'nvidia_cosmos_prompt_guide',
  ),
  falEntry(
    'cosmos-2.5-i2v',
    'fal-ai/cosmos-predict-2.5/image-to-video',
    'nvidia_cosmos_prompt_guide',
  ),
  falEntry(
    'cosmos-2.5-distilled-t2v',
    'fal-ai/cosmos-predict-2.5/distilled/text-to-video',
    'nvidia_cosmos_prompt_guide',
  ),

  // Meituan LongCat (long-form)
  falEntry(
    'longcat-720p-t2v',
    'fal-ai/longcat-video/text-to-video/720p',
    'longcat_prompt_guide',
  ),
  falEntry(
    'longcat-distilled-720p-t2v',
    'fal-ai/longcat-video/distilled/text-to-video/720p',
    'longcat_prompt_guide',
  ),
  falEntry(
    'longcat-480p-t2v',
    'fal-ai/longcat-video/text-to-video/480p',
    'longcat_prompt_guide',
  ),
  falEntry(
    'longcat-distilled-480p-t2v',
    'fal-ai/longcat-video/distilled/text-to-video/480p',
    'longcat_prompt_guide',
  ),
  falEntry(
    'longcat-720p-i2v',
    'fal-ai/longcat-video/image-to-video/720p',
    'longcat_prompt_guide',
  ),
  falEntry(
    'longcat-distilled-720p-i2v',
    'fal-ai/longcat-video/distilled/image-to-video/720p',
    'longcat_prompt_guide',
  ),
  falEntry(
    'longcat-480p-i2v',
    'fal-ai/longcat-video/image-to-video/480p',
    'longcat_prompt_guide',
  ),
  falEntry(
    'longcat-distilled-480p-i2v',
    'fal-ai/longcat-video/distilled/image-to-video/480p',
    'longcat_prompt_guide',
  ),

  // Sana Video (lightweight/fast)
  falEntry('sana-video-t2v', 'fal-ai/sana-video', 'sana_prompt_guide'),

  // MAGI (physics-aware)
  falEntry('magi-t2v', 'fal-ai/magi', 'magi_prompt_guide'),
  falEntry('magi-distilled-t2v', 'fal-ai/magi-distilled', 'magi_prompt_guide'),
  falEntry('magi-i2v', 'fal-ai/magi/image-to-video', 'magi_prompt_guide'),
  falEntry('magi-distilled-i2v', 'fal-ai/magi-distilled/image-to-video', 'magi_prompt_guide'),

  // Specialty research models
  falEntry('multishot-master-t2v', 'fal-ai/multishot-master', 'specialized_video_prompt_guide'),
  falEntry('transpixar-t2v', 'fal-ai/transpixar', 'specialized_video_prompt_guide'),
  falEntry('skyreels-i2v', 'fal-ai/skyreels-i2v', 'specialized_video_prompt_guide'),
  falEntry('lyra-2-zoom-i2v', 'fal-ai/lyra-2/zoom', 'specialized_video_prompt_guide'),
  falEntry('ovi-t2v', 'fal-ai/ovi', 'specialized_video_prompt_guide'),
  falEntry('ovi-i2v', 'fal-ai/ovi/image-to-video', 'specialized_video_prompt_guide'),
  falEntry(
    'infinity-star-t2v',
    'fal-ai/infinity-star/text-to-video',
    'specialized_video_prompt_guide',
  ),

  // Legacy / open-weights AnimateDiff and SVD (lives in general; cheap fallbacks)
  falEntry(
    'animatediff-sparsectrl-lcm-t2v',
    'fal-ai/animatediff-sparsectrl-lcm',
    'legacy_video_prompt_guide',
  ),
  falEntry(
    'fast-animatediff-t2v',
    'fal-ai/fast-animatediff/text-to-video',
    'legacy_video_prompt_guide',
  ),
  falEntry(
    'fast-animatediff-turbo-t2v',
    'fal-ai/fast-animatediff/turbo/text-to-video',
    'legacy_video_prompt_guide',
  ),
  falEntry('t2v-turbo-t2v', 'fal-ai/t2v-turbo', 'legacy_video_prompt_guide'),
  falEntry('fast-svd-t2v', 'fal-ai/fast-svd/text-to-video', 'legacy_video_prompt_guide'),
  falEntry('fast-svd-lcm-t2v', 'fal-ai/fast-svd-lcm/text-to-video', 'legacy_video_prompt_guide'),
  falEntry('fast-svd-lcm-i2v', 'fal-ai/fast-svd-lcm', 'legacy_video_prompt_guide'),
  falEntry('stable-video-i2v', 'fal-ai/stable-video', 'legacy_video_prompt_guide'),
];

// ── video.stylized ─────────────────────────────────────────────────────────
// Anime / illustrated / 3D-style — subset of pixverse early gens (anime
// lineage) + dedicated stylized models live here for discovery.

const stylized = [
  falEntry('pixverse-v3.5-t2v', 'fal-ai/pixverse/v3.5/text-to-video', 'pixverse_prompt_guide'),
  falEntry('pixverse-v3.5-i2v', 'fal-ai/pixverse/v3.5/image-to-video', 'pixverse_prompt_guide'),
];

// ── video.talking_head ─────────────────────────────────────────────────────
// Existing (kept verbatim) + new audio-driven / lip-sync / character-id
// models. The existing slugs (`wan-2.7`, `kling-ai-avatar-v2-pro`,
// `veed-fabric-1.0`) stay so we don't break catalog discovery for callers
// already using those names.

const talkingHead = [
  // Existing (preserved)
  {
    slug: 'wan-2.7',
    prompt_guide: 'wan_video_prompt_guide',
    access_routes: [
      {
        provider: 'fal',
        tool: 'fal_generate_video',
        model: 'fal-ai/wan/v2.7/image-to-video',
        cost: PLACEHOLDER_COST,
        key_env_var: 'FAL_KEY',
        stub: false,
      },
    ],
  },
  {
    slug: 'kling-ai-avatar-v2-pro',
    prompt_guide: 'kling_avatar_prompt_guide',
    access_routes: [
      {
        provider: 'fal',
        tool: 'fal_generate_video',
        model: 'fal-ai/kling-video/ai-avatar/v2/pro',
        cost: PLACEHOLDER_COST,
        key_env_var: 'FAL_KEY',
        stub: false,
      },
    ],
  },
  {
    slug: 'veed-fabric-1.0',
    prompt_guide: 'veed_fabric_prompt_guide',
    access_routes: [
      {
        provider: 'fal',
        tool: 'fal_generate_video',
        model: 'veed/fabric-1.0',
        cost: PLACEHOLDER_COST,
        key_env_var: 'FAL_KEY',
        stub: false,
      },
    ],
  },

  // New additions: Alibaba Happy Horse, ByteDance Lynx
  falEntry('happy-horse-t2v', 'alibaba/happy-horse/text-to-video', 'happy_horse_prompt_guide'),
  falEntry('happy-horse-i2v', 'alibaba/happy-horse/image-to-video', 'happy_horse_prompt_guide'),
  falEntry(
    'happy-horse-ref-i2v',
    'alibaba/happy-horse/reference-to-video',
    'happy_horse_prompt_guide',
  ),
  falEntry('bytedance-lynx-i2v', 'bytedance/lynx', 'bytedance_lynx_prompt_guide'),
];

const newVideoBlock = {
  cinematic,
  general,
  stylized,
  talking_head: talkingHead,
};

async function main() {
  const dryRun = process.argv.includes('--dry');
  const text = await readFile(MODELS_JSON, 'utf8');
  const catalog = JSON.parse(text);

  catalog.video = newVideoBlock;

  // Counts for the run summary.
  const counts = Object.fromEntries(
    Object.entries(newVideoBlock).map(([k, v]) => [k, v.length]),
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  console.log('Video catalog summary (after seed):');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(14)} ${v}`);
  }
  console.log(`  ${'TOTAL'.padEnd(14)} ${total}`);

  if (dryRun) {
    console.log('\nDry run — no writes.');
    return;
  }

  await writeFile(MODELS_JSON, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`\nWrote ${MODELS_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
