import * as os from "node:os";
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import {
  InMemoryMetricExporter,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  AlwaysOnSampler,
  BatchSpanProcessor,
  InMemorySpanExporter,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";
import {
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions/incubating";
import * as Sentry from "@sentry/node";
import {
  SentryPropagator,
  SentrySampler,
  SentrySpanProcessor,
} from "@sentry/opentelemetry";
import { config } from "dotenv";

config();
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

process.env.OTEL_NODE_ENABLED_INSTRUMENTATIONS =
  "fastify,http,ioredis,pg,pino,fs,redis";

const VERSION = process.env.VERSION || "unknown";
const HOSTNAME = process.env.HOSTNAME || os.hostname() || "unknown";
const ENV =
  process.env.DEPLOYMENT_ENVIRONMENT || process.env.NODE_ENV || "development";

const sentryClient = Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: ENV,
  serverName: HOSTNAME,
  debug: true,
  release: VERSION,
  attachStacktrace: true,
  skipOpenTelemetrySetup: true,
  integrations: [Sentry.httpIntegration({ spans: false })],
  tracesSampleRate: 1.0,
});

const resource = new Resource({
  [ATTR_SERVICE_NAME]: "server",
  [ATTR_SERVICE_NAMESPACE]: "adora",
  [ATTR_SERVICE_VERSION]: VERSION,
  [ATTR_SERVICE_INSTANCE_ID]: HOSTNAME,
});
// const sentryClient = undefined;
const sampler = sentryClient
  ? new SentrySampler(sentryClient)
  : process.env.NODE_ENV === "development"
    ? new AlwaysOnSampler()
    : new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(1),
      });

const metricReader = new PeriodicExportingMetricReader({
  exporter: new InMemoryMetricExporter(0),
});
export const traceExporter = new InMemorySpanExporter();

const sdk = new NodeSDK({
  traceExporter: traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        requireParentSpan: true,
      },
      "@opentelemetry/instrumentation-pg": {
        requireParentSpan: true,
      },
      "@opentelemetry/instrumentation-http": {
        requireParentforOutgoingSpans: true,
      },
    }),
  ],
  spanProcessors: [
    new BatchSpanProcessor(traceExporter, {
      maxExportBatchSize: 20480,
      scheduledDelayMillis: 1000,
      maxQueueSize: 40960,
    }),
    new SentrySpanProcessor(),
  ],
  contextManager: new Sentry.SentryContextManager(),
  resource: resource,
  sampler: sampler,
  textMapPropagator: new SentryPropagator(),
  metricReader: metricReader,
});
sdk.start();
Sentry.validateOpenTelemetrySetup();
