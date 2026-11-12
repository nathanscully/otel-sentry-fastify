import { register } from "node:module";
register("@opentelemetry/instrumentation/hook.mjs", import.meta.url);
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  InMemorySpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import {
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions/incubating";
import pkg from "@fastify/otel";
const { FastifyOtelInstrumentation } = pkg;
// For debug logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const resource = new Resource({
  [ATTR_SERVICE_NAME]: "test",
  [ATTR_SERVICE_NAMESPACE]: "test",
  [ATTR_SERVICE_VERSION]: "1.0.0",
  [ATTR_SERVICE_INSTANCE_ID]: "test",
});
export const traceExporter = new InMemorySpanExporter();

const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({
  // registerOnInitialization: true,
});
// const sdk = new NodeSDK({
//   instrumentations: [getNodeAutoInstrumentations(), fastifyOtelInstrumentation],
//   //@ts-ignore
//   spanProcessors: [new BatchSpanProcessor(traceExporter)],
//   resource: resource,
//   //@ts-ignore
// });
const provider = new NodeTracerProvider({
  resource: resource,
  spanProcessors: [new SimpleSpanProcessor(traceExporter)],
});
fastifyOtelInstrumentation.setTracerProvider(provider);
provider.register();

// sdk.start();
export default provider;
