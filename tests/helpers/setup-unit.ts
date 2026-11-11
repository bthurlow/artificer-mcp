import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Keep unit runs out of the real fal job log (src/generation/fal/jobs.ts).
process.env['ARTIFICER_FAL_JOBS_FILE'] = join(
  tmpdir(),
  'artificer-test',
  `fal-jobs-${process.pid}-${process.env['VITEST_WORKER_ID'] ?? 0}.jsonl`,
);
