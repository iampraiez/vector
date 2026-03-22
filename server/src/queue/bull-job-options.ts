import type { JobsOptions } from 'bullmq';

/** Default BullMQ options for email + account jobs (retries + cleanup). */
export const STANDARD_QUEUE_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: true,
  removeOnFail: 100,
};
