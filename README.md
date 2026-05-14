# Kalki Screener

Static browser UI for the Kalki screener.

The page runs in the browser and calls:

```text
https://kalki-screener.srimanthgada87.workers.dev/scan
```

## Deploy

Pushing to `main` deploys the Worker and UI to Cloudflare with GitHub Actions:

```text
src/worker.js -> kalki-screener.srimanthgada87.workers.dev
index.html    -> kalki-screener.pages.dev
```

Required GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```
