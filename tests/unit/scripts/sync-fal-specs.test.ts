import { describe, it, expect } from 'vitest';
// @ts-expect-error — scripts/*.mjs is outside tsconfig rootDir; we import
// it only for parser testing. Vitest handles the ESM resolution at runtime.
import { extractPricing } from '../../../scripts/sync-fal-specs.mjs';

describe('extractPricing', () => {
  it('extracts a simple Price bullet (Kling shape)', () => {
    const llms = [
      '# Kling AI Avatar',
      '',
      '## Pricing',
      '',
      '- **Price**: $0.115 per seconds',
      '',
      'For more details, see [fal.ai pricing](https://fal.ai/pricing).',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe('- **Price**: $0.115 per seconds');
  });

  it('joins a multi-sentence prose block with tiered pricing (Wan shape)', () => {
    const llms = [
      '## Pricing',
      '',
      'Your request will cost **$0.1** per second for 720p resolution. For 1080p your request will cost **$0.15** per second.',
      '',
      'For more details, see [fal.ai pricing](https://fal.ai/pricing).',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe(
      'Your request will cost **$0.1** per second for 720p resolution. For 1080p your request will cost **$0.15** per second.',
    );
  });

  it('preserves a comma-separated resolution tier list (veed shape)', () => {
    const llms = [
      '## Pricing',
      '',
      '480p - $0.08 per second, 720p - $0.15 per second',
      '',
      'For more details, see [fal.ai pricing](https://fal.ai/pricing).',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe(
      '480p - $0.08 per second, 720p - $0.15 per second',
    );
  });

  it('drops the "For more details" footer regardless of case', () => {
    const llms = [
      '## Pricing',
      '',
      '$0.05 per image',
      'FOR MORE DETAILS, see pricing page.',
      '',
      '## Next Section',
    ].join('\n');
    expect(extractPricing(llms)).toBe('$0.05 per image');
  });

  it('returns null when no Pricing section is present', () => {
    const llms = [
      '# Some Model',
      '',
      '## Overview',
      'Stuff.',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBeNull();
  });

  it('returns null when the Pricing section exists but is empty', () => {
    const llms = [
      '## Pricing',
      '',
      '',
      '## Next Section',
    ].join('\n');
    expect(extractPricing(llms)).toBeNull();
  });

  it('collapses runs of blank lines inside the Pricing block', () => {
    const llms = [
      '## Pricing',
      '',
      'Line one.',
      '',
      '',
      'Line two.',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe('Line one. Line two.');
  });

  it('handles Pricing as the final section (no trailing heading)', () => {
    const llms = ['## Pricing', '', '$1 per call'].join('\n');
    expect(extractPricing(llms)).toBe('$1 per call');
  });
});
