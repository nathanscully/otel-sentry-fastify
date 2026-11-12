import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import * as Sentry from "@sentry/node";
import {
  SentrySpanProcessor,
  SentryPropagator,
  SentrySampler,
} from "@sentry/opentelemetry";
import {
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions/incubating";
import { Resource } from "@opentelemetry/resources";
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sentryClient = Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  skipOpenTelemetrySetup: true,
  tracesSampleRate: 1.0,
});

const resource = new Resource({
  [ATTR_SERVICE_NAME]: "test",
  [ATTR_SERVICE_NAMESPACE]: "test",
  [ATTR_SERVICE_VERSION]: "1.0.0",
  [ATTR_SERVICE_INSTANCE_ID]: "test",
});
const provider = new NodeTracerProvider({
  sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
  spanProcessors: [new SentrySpanProcessor()],
  resource: resource,
});
provider.register({
  propagator: new SentryPropagator(),
  contextManager: new Sentry.SentryContextManager(),
});
// Validate that the setup is correct
Sentry.validateOpenTelemetrySetup();
