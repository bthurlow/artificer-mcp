#!/usr/bin/env node
/**
 * Phase 0 Q2 bake-off — compare fal-hosted image-to-video models on the
 * audio-decoupled use case. Produces output clips + a markdown summary for
 * docs/plans/fal-bakeoff-YYYY-MM-DD.md.
 *
 * No dependencies (native fetch). Does NOT install @fal-ai/client yet —
 * Phase 0 is read-only infra. Phase 1 adds the SDK.
 *
 * Usage:
 *   export FAL_KEY=your-key
 *   export JENN_AVATAR_URL=https://public-url-to-jenns-reference-image.jpg
 *   export TTS_AUDIO_URL=https://public-url-to-10s-tts-track-with-tail-silence.mp3
 *   # optional overrides:
 *   export BAKEOFF_PROMPT="A woman speaking directly to camera, natural lighting, head and shoulders."
 *   export BAKEOFF_DURATION=10
 *   export BAKEOFF_OUT_DIR=./out/bakeoff-$(date +%s)
 *
 *   node scripts/fal-bakeoff.mjs
 *
 * IMPORTANT before running:
 *   1. Verify each model's exact input schema at https://fal.ai/models/{model-id}/api
 *      (fal occasionally renames fields like `duration` vs `duration_seconds` during
 *      early-GA windows). Adjust the MODELS array below if any field mismatches.
 *   2. Image and audio URLs must be publicly reachable over HTTPS. Private GCS /
 *      signed URLs may or may not work — if fal returns a 4xx citing URL fetch,
 *      move the asset to a public bucket for this bake-off.
 *   3. Expected spend: ~$3 total (Wan $1, Kling Avatar $1.15, veed/fabric $0.80 at
 *      480p, 10s clips). Budget cap below kills any single model that exceeds $2.
 *
 * Output:
 *   - {OUT_DIR}/{label}/output.mp4
 *   - {OUT_DIR}/{label}/raw-response.json
 *   - {OUT_DIR}/summary.md   (paste into docs/plans/fal-bakeoff-YYYY-MM-DD.md)
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { join } from 'node:path';

const FAL_KEY = process.env.FAL_KEY;
const IMAGE_URL = process.env.JENN_AVATAR_URL;
const AUDIO_URL = process.env.TTS_AUDIO_URL;
const PROMPT =
  process.env.BAKEOFF_PROMPT ??
  'A woman speaking directly to camera, natural lighting, head and shoulders, steady frame.';
const DURATION = Number.parseInt(process.env.BAKEOFF_DURATION ?? '10', 10);
const OUT_DIR = process.env.BAKEOFF_OUT_DIR ?? `./out/bakeoff-${Date.now()}`;
const BUDGET_CAP_USD = 2.0; // per-model cost kill-switch

if (!FAL_KEY || !IMAGE_URL || !AUDIO_URL) {
  console.error('Missing required env:');
  console.error('  FAL_KEY           =', FAL_KEY ? 'set' : 'MISSING');
  console.error('  JENN_AVATAR_URL   =', IMAGE_URL ?? 'MISSING');
  console.error('  TTS_AUDIO_URL     =', AUDIO_URL ?? 'MISSING');
  process.exit(1);
}

/**
 * Per-model config. Cross-check each `input` shape against the live model page
 * before running — field names can drift in early-GA. `costPerSec` is Q1 research.
 */
const MODELS = [
  {
    id: 'fal-ai/wan/v2.7/image-to-video',
    label: 'wan-2.7',
    input: {
      prompt: PROMPT,
      image_url: IMAGE_URL,
      audio_url: AUDIO_URL,
      duration: DURATION,
    },
    costPerSec: 0.10,
    expectedDurationSec: DURATION,
  },
  {
    id: 'fal-ai/kling-video/ai-avatar/v2/pro',
    label: 'kling-avatar',
    input: {
      image_url: IMAGE_URL,
      audio_url: AUDIO_URL,
      prompt: PROMPT,
      // output scales to audio length — no duration param
    },
    costPerSec: 0.115,
    expectedDurationSec: DURATION,
  },
  {
    id: 'veed/fabric-1.0',
    label: 'veed-fabric',
    input: {
      image_url: IMAGE_URL,
      audio_url: AUDIO_URL,
      prompt: PROMPT,
      resolution: '480p',
    },
    costPerSec: 0.08,
    expectedDurationSec: DURATION,
  },
];

const FAL_HEADERS = {
  Authorization: `Key ${FAL_KEY}`,
  'Content-Type': 'application/json',
};

/** Submit to fal's queue API. Returns { request_id, status_url, response_url }. */
async function submit(modelId, input) {
  const url = `https://queue.fal.run/${modelId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: FAL_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(
      `fal submit ${modelId} -> ${res.status} ${res.statusText}: ${await res.text()}`,
    );
  }
  return res.json();
}

/** Poll status_url until COMPLETED (or failure / timeout). */
async function poll(statusUrl, { intervalMs = 3000, timeoutMs = 600_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(statusUrl, { headers: FAL_HEADERS });
    if (!res.ok) {
      throw new Error(`poll ${statusUrl} -> ${res.status} ${res.statusText}`);
    }
    const body = await res.json();
    if (body.status === 'COMPLETED') return body;
    if (body.status === 'FAILED' || body.status === 'ERROR') {
      throw new Error(`fal job failed: ${JSON.stringify(body)}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`fal poll timeout after ${timeoutMs}ms`);
}

/** Fetch the final result JSON from response_url. */
async function fetchResult(responseUrl) {
  const res = await fetch(responseUrl, { headers: FAL_HEADERS });
  if (!res.ok) {
    throw new Error(`fetchResult ${responseUrl} -> ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Download the video URL to a local path. */
async function download(videoUrl, outPath) {
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(`download ${videoUrl} -> ${res.status}`);
  }
  await pipeline(res.body, createWriteStream(outPath));
}

/** Find a video URL in fal's result JSON (fal uses { video: { url } } across most models). */
function extractVideoUrl(result) {
  if (result?.video?.url) return result.video.url;
  if (result?.video_url) return result.video_url;
  if (Array.isArray(result?.videos) && result.videos[0]?.url) return result.videos[0].url;
  throw new Error(`no video url in result: ${JSON.stringify(result).slice(0, 500)}`);
}

/** Run one model end-to-end. Returns a result object for the summary table. */
async function runModel(model) {
  const modelDir = join(OUT_DIR, model.label);
  await mkdir(modelDir, { recursive: true });

  const estCost = model.costPerSec * model.expectedDurationSec;
  if (estCost > BUDGET_CAP_USD) {
    return {
      ...model,
      status: 'SKIPPED',
      reason: `estimated $${estCost.toFixed(2)} exceeds per-model cap $${BUDGET_CAP_USD.toFixed(2)}`,
    };
  }

  const started = Date.now();
  try {
    console.log(`[${model.label}] submit -> ${model.id}`);
    const submission = await submit(model.id, model.input);
    console.log(`[${model.label}] request_id=${submission.request_id}`);

    const completed = await poll(submission.status_url);
    const result = await fetchResult(submission.response_url);
    await writeFile(join(modelDir, 'raw-response.json'), JSON.stringify(result, null, 2));

    const videoUrl = extractVideoUrl(result);
    const outPath = join(modelDir, 'output.mp4');
    await download(videoUrl, outPath);

    const elapsedMs = Date.now() - started;
    console.log(`[${model.label}] done in ${(elapsedMs / 1000).toFixed(1)}s -> ${outPath}`);

    return {
      ...model,
      status: 'OK',
      elapsedMs,
      estCostUsd: estCost,
      videoUrl,
      outPath,
      metrics: completed.metrics ?? null,
    };
  } catch (err) {
    console.error(`[${model.label}] FAILED:`, err.message);
    return {
      ...model,
      status: 'FAILED',
      error: err.message,
      elapsedMs: Date.now() - started,
    };
  }
}

/** Render a markdown summary table ready to paste into the bake-off doc. */
function renderSummary(results) {
  const rows = results
    .map((r) => {
      if (r.status === 'SKIPPED') {
        return `| \`${r.id}\` | SKIPPED | — | — | — | ${r.reason} |`;
      }
      if (r.status === 'FAILED') {
        return `| \`${r.id}\` | FAILED | ${(r.elapsedMs / 1000).toFixed(1)}s | — | — | ${r.error} |`;
      }
      return (
        `| \`${r.id}\` | OK | ${(r.elapsedMs / 1000).toFixed(1)}s | ` +
        `$${r.estCostUsd.toFixed(3)} | \`${r.outPath}\` | fill rubric manually |`
      );
    })
    .join('\n');

  const totalEstCost = results
    .filter((r) => r.status === 'OK')
    .reduce((sum, r) => sum + r.estCostUsd, 0);

  return `# fal.ai Q2 Bake-off Results

**Date:** ${new Date().toISOString().slice(0, 10)}
**Input image:** ${IMAGE_URL}
**Input audio:** ${AUDIO_URL}
**Prompt:** ${PROMPT}
**Duration requested:** ${DURATION}s

## Results

| Model | Status | Wall time | Est. cost | Output | Rubric |
|-------|--------|-----------|-----------|--------|--------|
${rows}

**Total estimated spend:** $${totalEstCost.toFixed(2)}

## Manual rubric (fill after viewing each output)

For each OK row, score yes/no:

- **Lip-sync accuracy:** mouth tracks audio on key phonemes >90% of clip?
- **Character consistency:** no visible face/hair/skin-tone drift frame 0 → last frame?
- **Tail silence preservation:** last 1s silent (mouth closed, no invented speech)? — KILLER TEST
- **Cost-per-finished-second:** actual ÷ output duration

## Decision

- **Default model (Phase 1 \`ARTIFICER_FAL_VIDEO_MODEL\`):** TBD — pick after review
- **Fallback order:** TBD
- **Models to exclude:** TBD

## Unresolved (carry to Phase 1)

- [ ] Signed-GCS URL passthrough vs upload-to-fal (did public HTTPS work on first try? was upload needed?)
- [ ] Mid-run failure billing (file a separate deliberate-failure probe)
`;
}

(async () => {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Bake-off output: ${OUT_DIR}`);
  console.log(`Running ${MODELS.length} models in parallel...\n`);

  const results = await Promise.all(MODELS.map(runModel));

  const summary = renderSummary(results);
  const summaryPath = join(OUT_DIR, 'summary.md');
  await writeFile(summaryPath, summary);

  console.log('\n' + '='.repeat(60));
  console.log(summary);
  console.log('='.repeat(60));
  console.log(`\nSummary written to ${summaryPath}`);

  const failed = results.filter((r) => r.status === 'FAILED');
  if (failed.length > 0) {
    console.error(`\n${failed.length} model(s) failed — review errors above.`);
    process.exit(2);
  }
})();
