import { startVitest } from "vitest/node";

const vitest = await startVitest("test", [], {
  watch: false,
});

// Wait for tests to complete
await vitest.waitForFinish();

// Cleanup
process.exit(vitest.state.getCountOfFailedTests() > 0 ? 1 : 0);
