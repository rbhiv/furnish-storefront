const { getDb } = require("../db");

// GET /api/products?category=sofa&maxPrice=2000&inStock=true
async function listProducts(req, res) {
  const started = Date.now();
  const db = await getDb();

  const category = String(req.query.category || "sofa");
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null;
  const inStock = req.query.inStock == null ? undefined : req.query.inStock === "true";

  const query = {};
  if (category) query.category = category;
  if (maxPrice != null && !Number.isNaN(maxPrice)) query.price = { $lte: maxPrice };
  if (inStock != null) query.inStock = inStock;

  const products = await db
    .collection("products")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(48)
    .toArray();

  // enrich with live warehouse stock (single batched query)
  const skus = products.map((p) => p.sku);
  const stock = await db.collection("inventory").find({ sku: { $in: skus } }).toArray();
  const bySku = new Map(stock.map((s) => [s.sku, s.count]));
  const items = products.map((p) => ({ ...p, stockCount: bySku.get(p.sku) || 0 }));

  res.json({ tookMs: Date.now() - started, count: items.length, items });
}

module.exports = { listProducts };
