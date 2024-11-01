import fastify from 'fastify';
import pino from 'pino';
import { isWrapped} from "@opentelemetry/core";

const prettyTransport = pino.transport({
    target: "pino-pretty",
  });
const streams = [
    { level: "info", stream: prettyTransport },
  ];
const app = fastify({ logger: {
    level: 'info',
    stream: pino.multistream(streams),
  }});

app.listen(
  {
    port: 3000,
    host: "0.0.0.0",
  },
  async function (err, address) {
    if (err) {
        app.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    console.log(isWrapped(app.addHook))

  }
);