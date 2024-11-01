//todo
import { register } from 'module';
register('@opentelemetry/instrumentation/hook.mjs', import.meta.url);
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_INSTANCE_ID, ATTR_SERVICE_NAME, ATTR_SERVICE_NAMESPACE, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions/incubating";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const resource = new Resource({
    [ATTR_SERVICE_NAME]: "test",
    [ATTR_SERVICE_NAMESPACE]: "test",
    [ATTR_SERVICE_VERSION]: "1.0.0",
    [ATTR_SERVICE_INSTANCE_ID]: "test",
  });
const metricReader = new PeriodicExportingMetricReader({
    exportIntervalMillis: 10000,
    exporter:  new ConsoleMetricExporter()
  });
const exporter = new ConsoleSpanExporter()

const sdk = new NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations(),
    ],
    spanProcessors: [new BatchSpanProcessor(exporter)],
    resource: resource,
  });
  
  sdk.start();
  