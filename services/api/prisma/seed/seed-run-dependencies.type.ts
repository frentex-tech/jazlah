import type { INestApplicationContext } from '@nestjs/common';
import type { Env } from '@config/env.type';

/** What a seed run reads and starts (runSeed); its test replaces each with a fake. */
export type SeedRunDependencies = Readonly<{
  /** The validated environment. Reading it connects to nothing. */
  loadEnv: () => Promise<Env>;
  /** Whether the command line has `--allow-staging`: the confirmation a staging run needs. */
  allowStaging: boolean;
  /** The application context: the step that connects to the database, Redis and storage. */
  createApp: () => Promise<INestApplicationContext>;
  write: (text: string) => void;
  writeError: (text: string) => void;
}>;
