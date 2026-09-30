// Times the storefront category endpoint the way a shopper experiences it.
// Usage: npm run bench   (requires the app to be running on :3000)
const URL =
  process.env.BENCH_URL ||
  "http://localhost:3000/api/products?category=sofa&maxPrice=2000&inStock=true";
const N = Number(process.env.BENCH_N || 5);

(async () => {
  console.log(`Benchmarking ${URL} (${N} runs)\n`);
  const times = [];
  for (let i = 0; i < N; i++) {
    const t0 = Date.now();
    const res = await fetch(URL);
    const body = await res.json();
    const ms = Date.now() - t0;
    times.push(ms);
    console.log(`run ${i + 1}: ${ms} ms (server took ${body.tookMs} ms, ${body.count} products)`);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`\navg: ${avg.toFixed(0)} ms over ${N} runs`);
})();
