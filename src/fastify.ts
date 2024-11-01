
import {
    trace,
  } from "@opentelemetry/api";
  
  import fastify from "fastify";
import {
    FastifyInstance,
  } from "fastify";
  import pino from "pino";


declare module "fastify" {
    interface FastifyInstance {
        config:{
            THING: string;
        }
        thing: string;
}
}
  export const buildFastify = async () => {
    const prettyTransport = pino.transport({
        target: "pino-pretty",
      });
    const streams = [
        { level: "info", stream: prettyTransport },
      ];
    const app:FastifyInstance = fastify({ logger: {
        level: 'info',
        stream: pino.multistream(streams),
      }});

      app.addHook("preHandler", async () => {});

// Declare a route
app.get("/", async (request, reply) => {
    const span = trace.getActiveSpan();
    console.log("This span will already be ended :(", span);
    span?.setAttribute("attribute", "value");
    return reply.status(200).send("hello world");});
      return app;
    };