const fs = require("fs");
const path = require("path");

// load .env if present (keeps secrets out of the repo)
(function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
})();

// Sentry performance monitoring (no-ops when SENTRY_DSN is not set)
if (process.env.SENTRY_DSN) {
  const Sentry = require("@sentry/node");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.SENTRY_ENV || "development",
    release: "furnish@" + require("./package.json").version,
  });
  console.log("Sentry performance monitoring enabled");
}

const express = require("express");
const { listProducts } = require("./src/routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.get("/api/products", listProducts);

app.listen(PORT, () => {
  console.log(`Furnish storefront listening on http://localhost:${PORT}`);
});
