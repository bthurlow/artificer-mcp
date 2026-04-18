import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Same promisified-execFile mock pattern as exec-ffmpeg.test.ts — see
// comments there for the rationale.
const execFileMock = vi.fn();

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return {
    ...actual,
    execFile: (
      ...args: [
        string,
        string[],
        unknown,
        (err: Error | null, result: { stdout: string; stderr: string }) => void,
      ]
    ) => {
      const callback = args[args.length - 1] as (
        err: Error | null,
        result: { stdout: string; stderr: string },
      ) => void;
      execFileMock(...args.slice(0, -1));
      const next = execFileMock.mock.results[execFileMock.mock.results.length - 1];
      const queued = (next?.value as
        | { err?: Error | null; stdout?: string; stderr?: string }
        | undefined) ?? { stdout: '', stderr: '' };
      if (queued.err) {
        callback(queued.err, { stdout: '', stderr: '' });
      } else {
        callback(null, { stdout: queued.stdout ?? '', stderr: queued.stderr ?? '' });
      }
    },
  };
});

const { magick, magickBatch } = await import('../../../src/utils/exec.js');

function queueResult(result: { stdout?: string; stderr?: string; err?: Error | null }): void {
  execFileMock.mockImplementationOnce(() => result);
}

describe('magick wrappers', () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  afterEach(() => {
    execFileMock.mockReset();
  });

  it('magick returns stdout on success with the default 30s timeout', async () => {
    queueResult({ stdout: 'Version: ImageMagick 7.x\n' });
    const out = await magick(['-version']);
    expect(out).toContain('ImageMagick');
    expect(execFileMock).toHaveBeenCalledWith(
      'magick',
      ['-version'],
      expect.objectContaining({ timeout: 30_000, maxBuffer: 10 * 1024 * 1024 }),
    );
  });

  it('magick honors a caller-supplied timeout override', async () => {
    queueResult({ stdout: 'ok' });
    await magick(['identify', 'x.png'], { timeout: 1_000 });
    expect(execFileMock).toHaveBeenCalledWith(
      'magick',
      ['identify', 'x.png'],
      expect.objectContaining({ timeout: 1_000 }),
    );
  });

  it('magick tolerates non-error stderr warnings and returns stdout', async () => {
    queueResult({ stdout: 'ok', stderr: 'warning: embedded profile' });
    const out = await magick(['x.png', 'y.webp']);
    expect(out).toBe('ok');
  });

  it('magick wraps subprocess errors as "ImageMagick failed:" with stderr detail', async () => {
    const err = Object.assign(new Error('exit 1'), { stderr: 'unable to open image' });
    queueResult({ err });
    await expect(magick(['bad.png'])).rejects.toThrow(/ImageMagick failed: unable to open image/);
  });

  it('magick falls back to "Unknown ImageMagick error" when error has no details', async () => {
    queueResult({ err: {} as Error });
    await expect(magick(['x'])).rejects.toThrow(/Unknown ImageMagick error/);
  });

  it('magickBatch delegates to magick with the 120s batch timeout', async () => {
    queueResult({ stdout: '' });
    await magickBatch(['composite', 'a.png', 'b.png', 'out.png']);
    expect(execFileMock).toHaveBeenCalledWith(
      'magick',
      ['composite', 'a.png', 'b.png', 'out.png'],
      expect.objectContaining({ timeout: 120_000 }),
    );
  });
});
