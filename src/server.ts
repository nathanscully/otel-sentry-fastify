import fastify from "fastify";
import { isWrapped } from "@opentelemetry/core";
import type { FastifyInstance } from "fastify";
import pino from "pino";
import { traceExporter } from "./instrumentation/adora.js";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-node";

const formatSpans = (spans: ReadableSpan[]) => {
  return spans.map((span: ReadableSpan) => {
    return {
      name: span.name,
      kind: span.kind,
      status: span.status,
      attributes: span.attributes,
      events: span.events,
      instrumentName: span.instrumentationLibrary.name,
    };
  });
};

export const buildFastify = async () => {
  const prettyTransport = pino.transport({
    target: "pino-pretty",
  });
  const streams = [{ level: "info", stream: prettyTransport }];
  const app: FastifyInstance = await fastify({
    logger: {
      level: "info",
      stream: pino.multistream(streams),
    },
  });

  app.addHook("preHandler", async () => {});

  app.get("/", async (request, reply) => {
    return reply.status(200).send("hello world");
  });

  app.get("/path/:id", async (request, reply) => {
    const r = request.params as unknown as { id: number };
    return reply.status(200).send(r);
  });

  app.get("/spans", async (request, reply) => {
    const spans = traceExporter.getFinishedSpans();
    return reply.status(200).send(formatSpans(spans));
  });

  return app;
};

export const start = async (port = 3000) => {
  const app = await buildFastify();
  app.listen(
    {
      port: port,
      host: "0.0.0.0",
    },
    async (err, address) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
      console.log(`*******\nServer listening at ${address}\n`);
      console.log(`Fastify otel wrapped: ${isWrapped(app.addHook)}\n******\n`);
    },
  );
};
