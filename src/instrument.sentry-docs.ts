import { metrics } from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleMetricExporter, MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor, NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import * as  Sentry from "@sentry/node";
import {
  SentrySpanProcessor,
  SentryPropagator,
  SentrySampler,
} from "@sentry/opentelemetry";

const sentryClient = Sentry.init({
  skipOpenTelemetrySetup: true,
  tracesSampleRate: 1.0,
  debug: true,
  registerEsmLoaderHooks: true
});

const provider = new NodeTracerProvider({
  sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
});

provider.addSpanProcessor(new SentrySpanProcessor());
provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter));
provider.register({
  propagator: new SentryPropagator(),
  contextManager: new Sentry.SentryContextManager(),
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(), // or new OTLPMetricExporter(),
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  readers: [metricReader],

});

// This never emits fastify or http metrics
metrics.setGlobalMeterProvider(myServiceMeterProvider);
// Validate that the setup is correct
Sentry.validateOpenTelemetrySetup();
