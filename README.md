# Furnish

Furnish is an online furniture storefront. This repository contains the
storefront application: a Node.js/Express API backed by MongoDB and a simple
browser UI for browsing the catalog.

## Local development

```bash
npm install
npm run seed   # one-time: load sample catalog data (~2 min first run)
npm start      # http://localhost:3000
```

The app uses a bundled local MongoDB instance (via `mongodb-memory-server`);
data is stored under `.mongodb/` and survives restarts after seeding.

## Environment variables

Copy `.env.example` to `.env` and fill in values. `.env` is gitignored.
