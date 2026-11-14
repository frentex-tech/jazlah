// Starts src/main.ts the way `node dist/main` would start the built API, with
// environment variables given as KEY=VALUE arguments set first. Used by
// test/startup.e2e-spec.ts to check how the API fails to start; TypeScript tests may
// not touch process.env (rule R11), so the variables are set here.
for (const argument of process.argv.slice(2)) {
  const separator = argument.indexOf('=');
  process.env[argument.slice(0, separator)] = argument.slice(separator + 1);
}
require('ts-node').register({ transpileOnly: true });
require('tsconfig-paths/register');
require('../../src/main.ts');
