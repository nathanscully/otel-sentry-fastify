import { trace } from "@opentelemetry/api";

import fastify from "fastify";
import type { FastifyInstance } from "fastify";
import pino from "pino";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      THING: string;
    };
    thing: string;
  }
}
export const buildFastify = async () => {
  const prettyTransport = pino.transport({
    target: "pino-pretty",
  });
  const streams = [{ level: "info", stream: prettyTransport }];
  const app: FastifyInstance = fastify({
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

  return app;
};
