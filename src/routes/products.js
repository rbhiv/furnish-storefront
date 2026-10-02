const { getDb } = require("../db");

// GET /api/products?category=sofa&maxPrice=2000&inStock=true
//
// Revamped category filtering pipeline:
//  - case-insensitive category matching, so shopper input like "SOFA" or
//    "Sofa" resolves no matter how the SEO landing pages link here
//  - price + availability rules applied in the app layer, so merchandising
//    can tweak the rules without touching DB queries
//  - every match is enriched with live warehouse stock from the inventory
//    service at request time (no more trusting the catalog snapshot)
async function listProducts(req, res) {
  const started = Date.now();
  const db = await getDb();

  const category = String(req.query.category || "sofa");
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null;
  const inStock = req.query.inStock == null ? undefined : req.query.inStock === "true";

  // case-insensitive category match (e.g. "Sofa", "SOFA", "sofa")
  const query = { category: { $regex: new RegExp(`^${category}$`, "i") } };
  let products = await db.collection("products").find(query).toArray();

  // merchandising rules: price ceiling + availability, applied per product
  products = products.filter((p) => {
    if (maxPrice != null && !Number.isNaN(maxPrice) && p.price > maxPrice) return false;
    if (inStock != null && p.inStock !== inStock) return false;
    return true;
  });

  // live warehouse stock lookup for every match
  for (const p of products) {
    const inv = await db.collection("inventory").findOne({ sku: p.sku });
    p.stockCount = inv ? inv.count : 0;
  }

  // newest first
  products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const items = products.slice(0, 48);
  res.json({ tookMs: Date.now() - started, count: items.length, items });
}

module.exports = { listProducts };
