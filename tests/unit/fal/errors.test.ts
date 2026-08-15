import { describe, it, expect } from 'vitest';
import {
  parseFalError,
  FalError,
  FalValidationError,
  FalContentPolicyViolationError,
  FalGenerationTimeoutError,
  FalServerError,
  FalInfrastructureError,
  FalClientError,
  FalUnknownError,
} from '../../../src/generation/fal/errors.js';

// Real-shape fixtures modeled on fal's documented response bodies
// (https://fal.ai/docs/errors). Each fixture mimics what `@fal-ai/client`'s
// ApiError / ValidationError carries when the SDK throws — status + body
// + requestId — because that is the input surface our dispatcher sees.
function apiError(status: number, body: unknown, requestId = 'req-abc123') {
  return Object.assign(new Error(`HTTP ${status}`), {
    status,
    body,
    requestId,
  });
}

describe('parseFalError — nested body shape', () => {
  it('classifies content_policy_violation (422) as FalContentPolicyViolationError', () => {
    const err = parseFalError(
      apiError(422, {
        detail: [
          {
            loc: ['body', 'prompt'],
            msg: 'Content policy violation',
            type: 'content_policy_violation',
            url: 'https://docs.fal.ai/errors/#content_policy_violation',
          },
        ],
      }),
    );

    expect(err).toBeInstanceOf(FalContentPolicyViolationError);
    // Subclass of FalValidationError — both instanceof checks pass.
    expect(err).toBeInstanceOf(FalValidationError);
    expect(err).toBeInstanceOf(FalError);
    expect(err.status).toBe(422);
    expect(err.errorType).toBe('content_policy_violation');
    expect(err.retryable).toBe(false);
    expect(err.requestId).toBe('req-abc123');
    expect(err.message).toBe('Content policy violation');
  });

  it('classifies audio_duration_too_short (422) as FalValidationError with ctx preserved', () => {
    const err = parseFalError(
      apiError(422, {
        detail: [
          {
            loc: ['body', 'audio_url'],
            msg: 'Audio shorter than minimum',
            type: 'audio_duration_too_short',
            ctx: { min_duration: 2, provided_duration: 0.5 },
            input: 'https://example.com/short.mp3',
          },
        ],
      }),
    );

    expect(err).toBeInstanceOf(FalValidationError);
    expect(err).not.toBeInstanceOf(FalContentPolicyViolationError);
    const v = err as FalValidationError;
    expect(v.errorType).toBe('audio_duration_too_short');
    expect(v.firstCtx).toEqual({ min_duration: 2, provided_duration: 0.5 });
    expect(v.detail[0].input).toBe('https://example.com/short.mp3');
    expect(v.retryable).toBe(false);
  });

  it('classifies file_download_error (422) as FalValidationError', () => {
    const err = parseFalError(
      apiError(422, {
        detail: [
          {
            loc: ['body', 'image_url'],
            msg: 'Failed to download file',
            type: 'file_download_error',
          },
        ],
      }),
    );

    expect(err).toBeInstanceOf(FalValidationError);
    expect(err.errorType).toBe('file_download_error');
    expect(err.retryable).toBe(false);
  });

  it('classifies generation_timeout (504) as FalGenerationTimeoutError and marks retryable', () => {
    const err = parseFalError(
      apiError(504, {
        detail: [
          {
            loc: ['body'],
            msg: 'Generation timed out after 2723.9s',
            type: 'generation_timeout',
          },
        ],
      }),
    );

    expect(err).toBeInstanceOf(FalGenerationTimeoutError);
    expect(err).not.toBeInstanceOf(FalValidationError);
    expect(err.status).toBe(504);
    expect(err.errorType).toBe('generation_timeout');
    expect(err.retryable).toBe(true);
  });

  it('classifies nested internal_server_error (500) as FalServerError and marks retryable', () => {
    const err = parseFalError(
      apiError(500, {
        detail: [
          {
            loc: ['body'],
            msg: 'Model runner failed',
            type: 'internal_server_error',
          },
        ],
      }),
    );

    expect(err).toBeInstanceOf(FalServerError);
    expect(err).not.toBeInstanceOf(FalInfrastructureError);
    expect(err.retryable).toBe(true);
    expect(err.errorType).toBe('internal_server_error');
  });

  it('falls through unfamiliar nested types to FalValidationError at 422', () => {
    const err = parseFalError(
      apiError(422, {
        detail: [
          {
            loc: ['body'],
            msg: 'Future error type fal added after we shipped',
            type: 'some_newly_added_error',
          },
        ],
      }),
    );

    expect(err).toBeInstanceOf(FalValidationError);
    expect(err.errorType).toBe('some_newly_added_error');
  });
});

describe('parseFalError — flat body shape', () => {
  it('classifies runner_disconnected (503) as retryable FalInfrastructureError', () => {
    const err = parseFalError(
      apiError(503, {
        detail: 'The runner disconnected mid-request',
        error_type: 'runner_disconnected',
      }),
    );

    expect(err).toBeInstanceOf(FalInfrastructureError);
    expect(err.retryable).toBe(true);
    expect(err.errorType).toBe('runner_disconnected');
    expect(err.status).toBe(503);
    expect((err as FalInfrastructureError).detailMessage).toBe(
      'The runner disconnected mid-request',
    );
  });

  it('classifies request_timeout (504) as retryable FalInfrastructureError', () => {
    const err = parseFalError(
      apiError(504, {
        detail: 'Request timed out before processing started',
        error_type: 'request_timeout',
      }),
    );

    expect(err).toBeInstanceOf(FalInfrastructureError);
    expect(err.retryable).toBe(true);
    expect(err.errorType).toBe('request_timeout');
  });

  it('classifies runner_server_error (500 flat) as FalInfrastructureError NON-retryable', () => {
    const err = parseFalError(
      apiError(500, {
        detail: 'Runner crashed',
        error_type: 'runner_server_error',
      }),
    );

    expect(err).toBeInstanceOf(FalInfrastructureError);
    expect(err.retryable).toBe(false);
  });

  it('classifies internal_error (500 flat) as FalInfrastructureError NON-retryable', () => {
    const err = parseFalError(
      apiError(500, {
        detail: 'Something went wrong',
        error_type: 'internal_error',
      }),
    );

    expect(err).toBeInstanceOf(FalInfrastructureError);
    expect(err.retryable).toBe(false);
  });

  it('classifies bad_request (400) as FalClientError non-retryable', () => {
    const err = parseFalError(
      apiError(400, {
        detail: 'Invalid request payload',
        error_type: 'bad_request',
      }),
    );

    expect(err).toBeInstanceOf(FalClientError);
    expect(err.retryable).toBe(false);
    expect(err.errorType).toBe('bad_request');
  });

  it('classifies client_cancelled (499) as FalClientError', () => {
    const err = parseFalError(
      apiError(499, {
        detail: 'Client cancelled the request',
        error_type: 'client_cancelled',
      }),
    );

    expect(err).toBeInstanceOf(FalClientError);
    expect(err.retryable).toBe(false);
  });
});

describe('parseFalError — unknown / catchall', () => {
  it('classifies a non-API throw (plain Error) as FalUnknownError', () => {
    const err = parseFalError(new Error('Connection reset by peer'));
    expect(err).toBeInstanceOf(FalUnknownError);
    expect(err.status).toBe(0);
    expect(err.retryable).toBe(false);
    expect(err.message).toContain('Connection reset by peer');
  });

  it('classifies a plain string throw as FalUnknownError', () => {
    const err = parseFalError('boom');
    expect(err).toBeInstanceOf(FalUnknownError);
    expect(err.raw).toBe('boom');
  });

  it('classifies ApiError-shaped input with unknown body shape as FalUnknownError', () => {
    const err = parseFalError(apiError(418, { teapot: true }));
    expect(err).toBeInstanceOf(FalUnknownError);
    expect(err.status).toBe(418);
    expect(err.raw).toEqual({ teapot: true });
  });

  it('preserves the raw body on every dispatched class', () => {
    const rawNested = {
      detail: [{ type: 'file_too_large', ctx: { max_size: 20_000_000 } }],
    };
    const nested = parseFalError(apiError(422, rawNested));
    expect(nested.raw).toBe(rawNested);

    const rawFlat = { detail: 'Oops', error_type: 'runner_disconnected' };
    const flat = parseFalError(apiError(503, rawFlat));
    expect(flat.raw).toBe(rawFlat);
  });

  it('preserves requestId on every dispatched class', () => {
    const nested = parseFalError(
      apiError(
        422,
        { detail: [{ type: 'content_policy_violation' }] },
        'req-nested-1',
      ),
    );
    expect(nested.requestId).toBe('req-nested-1');

    const flat = parseFalError(
      apiError(400, { detail: 'bad', error_type: 'bad_request' }, 'req-flat-2'),
    );
    expect(flat.requestId).toBe('req-flat-2');
  });
});

describe('FalError subclass names', () => {
  // Error.name is used by tools like Node's util.inspect and by test
  // reporters. Each subclass should report its own name, not "Error".
  it.each([
    [FalError, 'FalError'],
    [FalValidationError, 'FalValidationError'],
    [FalContentPolicyViolationError, 'FalContentPolicyViolationError'],
    [FalGenerationTimeoutError, 'FalGenerationTimeoutError'],
    [FalServerError, 'FalServerError'],
    [FalInfrastructureError, 'FalInfrastructureError'],
    [FalClientError, 'FalClientError'],
    [FalUnknownError, 'FalUnknownError'],
  ])('%p instance reports its own class name', (Cls, expected) => {
    const base = {
      message: 'x',
      status: 0,
      errorType: 'x',
      retryable: false,
      raw: null,
    };
    // FalValidationError and subclasses need a detail array; the infra
    // and client classes need a detailMessage. Passing a superset keeps
    // this table-driven test simple without a switch.
    const inst = new (Cls as new (args: Record<string, unknown>) => Error)({
      ...base,
      detail: [],
      detailMessage: 'x',
    });
    expect(inst.name).toBe(expected);
  });
});
