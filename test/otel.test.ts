import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-node";

describe("OpenTelemetry Trace Integration", async () => {
  const SERVER_PORT = 3000;
  beforeAll(async () => {});

  afterAll(async () => {});

  it("should create traces with correct attributes for GET /", async () => {
    // Make a request to the endpoint to generate some data
    const r1 = await fetch(`http://localhost:${SERVER_PORT}/`);
    expect(r1.status).toBe(200);

    const r2 = await fetch(`http://localhost:${SERVER_PORT}/path/1`);
    expect(r2.status).toBe(200);

    // We need to wait a bit to make sure the spans are exported
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(await r1.text()).toBe("hello world");
    expect(await r2.json()).toStrictEqual({ id: "1" });

    // // Give some time for the spans to be exported

    // // Get the exported spans
    const spans = await (
      await fetch(`http://localhost:${SERVER_PORT}/spans`)
    ).json();
    // console.log(spans);

    // // Find the server span (the one handling the HTTP request)
    const httpSpans = spans.filter((span) => {
      return span.instrumentName === "@opentelemetry/instrumentation-http";
    });
    console.log(httpSpans);
    // Verify the span exists and has the correct attributes
    expect(httpSpans.length).toBeGreaterThan(0);

    for (const span of httpSpans) {
      expect(span.name).toBe("GET /");
      expect(span.attributes["http.route"]).toBe("/");
    }

    // // Verify other span properties
    // expect(serverSpan?.name).toBe("GET /");
    // expect(serverSpan?.kind).toBe(SpanKind.SERVER);
    // expect(serverSpan?.status.code).toBe(SpanStatusCode.OK);
  });
});
