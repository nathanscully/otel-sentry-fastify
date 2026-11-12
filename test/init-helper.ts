import { afterAll, afterEach, beforeAll } from "vitest";
import { getOtelSDK } from "../src/instrumentation/otel-sdk";

beforeAll(() => {
  console.log("starting before all");
  const sdk = getOtelSDK();
  sdk.start();
});
afterEach(() => {
  console.log("afterEach");
});
afterAll(() => {
  console.log("afterAll");
});
