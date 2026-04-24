/**
 * fal.ai error taxonomy.
 *
 * fal returns two distinct error body shapes:
 *
 *  Model-level (nested, PyDantic-style) — returned by the model runner for
 *  input validation, content policy, generation timeouts, and model-internal
 *  server errors:
 *    { detail: [{ loc, msg, type, url, ctx, input }] }
 *
 *  Request-level (flat) — returned by fal's infrastructure for routing,
 *  runner scheduling, client cancellation, and bad requests:
 *    { detail: "string", error_type: "<type>" }
 *    plus header: X-Fal-Error-Type: <type>
 *
 * Documented error list: https://fal.ai/docs/errors (~40 types across two
 * shapes). This module dispatches into 6 concrete classes plus a catchall,
 * preserving fal's raw body for caller inspection.
 *
 * Integration: `@fal-ai/client`'s ApiError and ValidationError already
 * carry `.status`, `.body`, and `.requestId`. `parseFalError(err)` maps
 * those SDK errors into our richer taxonomy. Unknown or non-ApiError
 * inputs surface as FalUnknownError so nothing escapes unclassified.
 */

export interface FalValidationDetail {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
  url?: string;
  ctx?: Record<string, unknown>;
  input?: unknown;
}

interface FalErrorArgs {
  message: string;
  status: number;
  errorType: string;
  retryable: boolean;
  raw: unknown;
  requestId?: string;
}

/** Base class for every fal-surfaced error. */
export class FalError extends Error {
  readonly status: number;
  readonly errorType: string;
  readonly retryable: boolean;
  readonly raw: unknown;
  readonly requestId: string | undefined;

  constructor(args: FalErrorArgs) {
    super(args.message);
    this.name = this.constructor.name;
    this.status = args.status;
    this.errorType = args.errorType;
    this.retryable = args.retryable;
    this.raw = args.raw;
    this.requestId = args.requestId;
  }
}

/**
 * 422 with nested body — the bulk of fal's documented errors.
 *
 * Covers content_policy_violation, no_media_generated, file_download_error,
 * face_detection_error, all `*_too_large` / `*_too_small` variants,
 * numeric range errors (greater_than, less_than, multiple_of, ...),
 * sequence length errors, audio / video / image format errors, archive
 * errors, and feature_not_supported. Callers needing the validation
 * context (e.g. max_size, min_duration, supported_formats) read from
 * `detail[i].ctx`.
 *
 * Never retryable — the input needs to change.
 */
export class FalValidationError extends FalError {
  readonly detail: FalValidationDetail[];

  constructor(args: FalErrorArgs & { detail: FalValidationDetail[] }) {
    super({ ...args, retryable: false });
    this.detail = args.detail;
  }

  /** Convenience: the first validation entry's ctx, if any. */
  get firstCtx(): Record<string, unknown> | undefined {
    return this.detail[0]?.ctx;
  }
}

/**
 * 422 with `type: "content_policy_violation"`. Subclassed from
 * FalValidationError so callers can `instanceof` either the broad
 * validation class or this specific one depending on how they handle it.
 */
export class FalContentPolicyViolationError extends FalValidationError {}

/**
 * 504 with nested body and `type: "generation_timeout"`. The model runner
 * accepted the job and started inference but didn't finish within fal's
 * generation budget (observed: 2723s before surfacing).
 *
 * Marked retryable because timeouts can clear with a smaller workload
 * (e.g. lower resolution) or on a warm runner. fal's docs note these
 * are "variable" — callers should decide based on whether the input
 * was at the edge of the model's capacity.
 */
export class FalGenerationTimeoutError extends FalError {
  readonly detail: FalValidationDetail[];

  constructor(args: FalErrorArgs & { detail: FalValidationDetail[] }) {
    super({ ...args, retryable: true });
    this.detail = args.detail;
  }
}

/**
 * 500 with nested body and `type: "internal_server_error"`. The runner
 * hit a model-internal failure. Distinct from infrastructure 500s
 * (which use the flat body shape).
 */
export class FalServerError extends FalError {
  readonly detail: FalValidationDetail[];

  constructor(args: FalErrorArgs & { detail: FalValidationDetail[] }) {
    super({ ...args, retryable: true });
    this.detail = args.detail;
  }
}

/**
 * Flat-body infrastructure errors. Covers the runner_* family (503/502),
 * request_timeout and startup_timeout (504), and the non-retryable flat
 * 500s (internal_error, runner_server_error).
 *
 * Retryability is per-error-type and set by the dispatcher from fal's
 * documented table.
 */
export class FalInfrastructureError extends FalError {
  readonly detailMessage: string;

  constructor(args: FalErrorArgs & { detailMessage: string }) {
    super(args);
    this.detailMessage = args.detailMessage;
  }
}

/**
 * Flat-body client-side errors. 400 bad_request, 499 client_disconnected
 * and client_cancelled. Always non-retryable — the caller has to change
 * what they did.
 */
export class FalClientError extends FalError {
  readonly detailMessage: string;

  constructor(args: FalErrorArgs & { detailMessage: string }) {
    super({ ...args, retryable: false });
    this.detailMessage = args.detailMessage;
  }
}

/**
 * Catchall — body shape doesn't match either pattern, or status/type
 * combo is unrecognized. Preserves whatever we got so callers have a
 * hope of debugging.
 */
export class FalUnknownError extends FalError {}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

/**
 * Documented flat-body infrastructure error types that ARE retryable.
 * Everything else with a flat body and 5xx status is treated as retryable
 * by default, but these two families (client errors, runner_server_error,
 * internal_error) are explicit non-retryable per fal's docs.
 */
const NON_RETRYABLE_INFRASTRUCTURE_TYPES = new Set<string>([
  'runner_server_error',
  'internal_error',
]);

interface ApiErrorLike {
  status?: number;
  body?: unknown;
  requestId?: string;
  message?: string;
}

function hasApiErrorShape(err: unknown): err is ApiErrorLike {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof (err as { status: unknown }).status === 'number'
  );
}

function isNestedBody(body: unknown): body is { detail: FalValidationDetail[] } {
  return (
    typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as { detail?: unknown }).detail)
  );
}

function isFlatBody(body: unknown): body is { detail: string; error_type?: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as { detail?: unknown }).detail === 'string'
  );
}

function summarize(details: FalValidationDetail[], fallback: string): string {
  const first = details[0];
  if (first?.msg) return first.msg;
  if (first?.type) return `fal error: ${first.type}`;
  return fallback;
}

/**
 * Turn whatever `@fal-ai/client` threw into one of our concrete FalError
 * subclasses. Never throws — always returns a FalError (FalUnknownError
 * for anything the dispatcher can't classify).
 */
export function parseFalError(err: unknown): FalError {
  if (!hasApiErrorShape(err)) {
    const message = err instanceof Error ? err.message : String(err);
    return new FalUnknownError({
      message: `Non-API error from fal client: ${message}`,
      status: 0,
      errorType: 'unknown',
      retryable: false,
      raw: err,
    });
  }

  const status = err.status ?? 0;
  const body = err.body;
  const requestId = err.requestId;
  const sdkMessage = err.message ?? `fal request failed with status ${status}`;

  if (isNestedBody(body)) {
    const detail = body.detail;
    const errorType = detail[0]?.type ?? 'unknown';
    const message = summarize(detail, sdkMessage);

    if (status === 422 && errorType === 'content_policy_violation') {
      return new FalContentPolicyViolationError({
        message,
        status,
        errorType,
        retryable: false,
        raw: body,
        requestId,
        detail,
      });
    }

    if (status === 504 && errorType === 'generation_timeout') {
      return new FalGenerationTimeoutError({
        message,
        status,
        errorType,
        retryable: true,
        raw: body,
        requestId,
        detail,
      });
    }

    if (status === 500 && errorType === 'internal_server_error') {
      return new FalServerError({
        message,
        status,
        errorType,
        retryable: true,
        raw: body,
        requestId,
        detail,
      });
    }

    // Any other nested-body error — validation. This covers the full
    // ~30-error 422 surface (file_too_large, audio_duration_too_short,
    // unsupported_image_format, etc.) plus any future nested errors fal
    // adds that don't carve off into a more specific class above.
    return new FalValidationError({
      message,
      status,
      errorType,
      retryable: false,
      raw: body,
      requestId,
      detail,
    });
  }

  if (isFlatBody(body)) {
    const errorType = body.error_type ?? 'unknown';
    const message = body.detail || sdkMessage;

    if (status === 400 || status === 499) {
      return new FalClientError({
        message,
        status,
        errorType,
        retryable: false,
        raw: body,
        requestId,
        detailMessage: message,
      });
    }

    if (status >= 500 && status < 600) {
      const retryable = !NON_RETRYABLE_INFRASTRUCTURE_TYPES.has(errorType);
      return new FalInfrastructureError({
        message,
        status,
        errorType,
        retryable,
        raw: body,
        requestId,
        detailMessage: message,
      });
    }

    // Flat body, unrecognized status band — fall through to unknown so
    // the dispatcher doesn't invent a classification.
  }

  return new FalUnknownError({
    message: sdkMessage,
    status,
    errorType: 'unknown',
    retryable: false,
    raw: body ?? err,
    requestId,
  });
}
