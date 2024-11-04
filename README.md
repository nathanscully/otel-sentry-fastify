# OTEL / SENTRY / FASTIFY

This repo is intended to show Sentry not working correctly with Fastify and Open Telemetry. There are three instrumentation files:

- `instrument.otel.ts` - this is a standard otel setup and emits both traces and metrics to an otel collector
- `instrument.sentry-docs.ts` - this is a copy/paste from the [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/custom-setup/) but adds a metric exporter. **The metric exporter does not work**
- `instrument.otel-sentry.ts` - this is an attempt to use the standard NodeSDK otel setup working with Sentry. It mostly works but the Fastify `http.route` attribute is stripped, making metric tracking of routes impossible.

## Install

If you use Nix and `direnv` you can run `direnv allow` and get a shell with all the dependencies setup. If not, make sure you have `pnpm` and `node`.

```
pnpm i
```

## Running 

There are three start scripts:

- `pnpm start:otel`
- `pnpm start:otel-sentry`
- `pnpm start:sentry-docs`

There is also a very basic load generation script to save you hitting the endpoints manually. 

`pnpm load`

## OTEL Collector

You can either run the basic otel collector and sift through the logs yourself:

```
docker run -p 4318:4318 otel/opentelemetry-collector-contrib:0.112.0
```

Or you can run the grafana-lgtm stack which has an inbuilt otel collector and gives you a UI to explore the data:

```
docker run -p 7777:3000 -p 4317:4317 -p 4318:4318 --rm -ti -e ENABLE_LOGS_OTELCOL=true grafana/otel-lgtm:0.7.6 
```