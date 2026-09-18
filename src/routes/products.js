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

  res.json({ tookMs: Date.now() - started, count: products.length, items: products });
}

module.exports = { listProducts };
