import { metrics } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { ConsoleMetricExporter, MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { AlwaysOnSampler, BatchSpanProcessor, ParentBasedSampler, TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_INSTANCE_ID, ATTR_SERVICE_NAME, ATTR_SERVICE_NAMESPACE, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions/incubating";
import * as  Sentry from "@sentry/node";
import {
  SentrySpanProcessor,
  SentryPropagator,
  SentrySampler,
} from "@sentry/opentelemetry";

const SAMPLE_RATE = 1.0;

const resource = new Resource({
  [ATTR_SERVICE_NAME]: "test",
  [ATTR_SERVICE_NAMESPACE]: "test",
  [ATTR_SERVICE_VERSION]: 1,
  [ATTR_SERVICE_INSTANCE_ID]: "localhost",
});

const sentryClient = Sentry.init({
  skipOpenTelemetrySetup: true,
  tracesSampleRate: SAMPLE_RATE,
  debug: true,
  registerEsmLoaderHooks: true
});

const sampler = sentryClient
  ? new SentrySampler(sentryClient)
  : process.env.NODE_ENV === "development"
    ? new AlwaysOnSampler()
    : new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(SAMPLE_RATE),
    });

const metricReader = new PeriodicExportingMetricReader({
  exportIntervalMillis: 10000,
  exporter: new OTLPMetricExporter()
});
const exporter = new OTLPTraceExporter();
const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [
    getNodeAutoInstrumentations(),
  ],
  spanProcessors: [new BatchSpanProcessor(exporter), new SentrySpanProcessor()],
  contextManager: new Sentry.SentryContextManager(),
  resource: resource,
  sampler: sampler,
  textMapPropagator: new SentryPropagator(),
  metricReader: metricReader,
});

sdk.start();


Sentry.validateOpenTelemetrySetup();
