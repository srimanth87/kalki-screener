# Kalki Screener

Static browser UI for the Kalki screener.

The page runs in the browser and calls:

```text
https://kalki-screener.srimanthgada87.workers.dev/scan
```

## Deploy

Pushing to `main` deploys the UI to Cloudflare Pages with GitHub Actions:

```text
index.html -> kalki-screener.pages.dev
```

Required GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```
