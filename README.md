# BIP-110

Website for BIP-110: Protecting Bitcoin's Purpose

**Live at:** [bip110.org](https://bip110.org)

## Development

```bash
cd web
npm install
npm run dev
```

## Deploy

### Production

```bash
just deploy
```

### Preview

```bash
just preview
```

## GitHub Actions (Cloudflare Workers via Wrangler)

This repo deploys previews for every PR update and deploys production on pushes to `master`.
