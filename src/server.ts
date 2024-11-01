import { buildFastify } from "./fastify.js";
import { isWrapped} from "@opentelemetry/core";

export const  start = async () => {
const fastify = await buildFastify();
fastify.listen(
    {
      port: 3000,
      host: "0.0.0.0",
    },
    async function (err, address) {
      if (err) {
          fastify.log.error(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
      console.log(`\n\n\n\n*******\n${isWrapped(fastify.addHook)}******\n`);
    }
);
}