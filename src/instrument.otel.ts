import { register } from 'module';
register('@opentelemetry/instrumentation/hook.mjs', import.meta.url);
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_INSTANCE_ID, ATTR_SERVICE_NAME, ATTR_SERVICE_NAMESPACE, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions/incubating";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// For debug logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const resource = new Resource({
    [ATTR_SERVICE_NAME]: "test",
    [ATTR_SERVICE_NAMESPACE]: "test",
    [ATTR_SERVICE_VERSION]: "1.0.0",
    [ATTR_SERVICE_INSTANCE_ID]: "test",
  });
const metricReader = new PeriodicExportingMetricReader({
    exportIntervalMillis: 10000,
    exporter:  new OTLPMetricExporter()
  });
const exporter = new OTLPTraceExporter()
const sdk = new NodeSDK({
  traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-net": {
          enabled: false, // seems to send a lot of noise to otel spans due to pinging sentry constantly.
        },
        "@opentelemetry/instrumentation-dns": {
          enabled: false, // seems to send a lot of noise to otel spans due to pinging sentry constantly.
        },
        "@opentelemetry/instrumentation-pg": {
          // requireParentSpan: true,
          enabled: false,
        },
        "@opentelemetry/instrumentation-fastify": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-http": {
          enabled: true,
          requireParentforOutgoingSpans: true,
        },
        "@opentelemetry/instrumentation-grpc": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-pino": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-ioredis": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-aws-sdk": {
          enabled: false,
        },
      }),
    ],
    spanProcessors: [new BatchSpanProcessor(exporter)],
    resource: resource,
    metricReader:metricReader
  });

  sdk.start();
  