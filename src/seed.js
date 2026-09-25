const { getDb } = require("./db");

const TOTAL = Number(process.env.SEED_TOTAL || 120000);
const BATCH = 5000;

const CATEGORIES = {
  sofa:  { min: 400, max: 4500, nouns: ["Sofa", "Loveseat", "Sectional", "Sleeper Sofa"] },
  chair: { min: 60, max: 900, nouns: ["Armchair", "Dining Chair", "Accent Chair", "Recliner"] },
  table: { min: 120, max: 2200, nouns: ["Coffee Table", "Dining Table", "Side Table", "Console Table"] },
  bed:   { min: 300, max: 3200, nouns: ["Bed Frame", "Platform Bed", "Upholstered Bed", "Bunk Bed"] },
  desk:  { min: 150, max: 1400, nouns: ["Writing Desk", "Standing Desk", "Corner Desk", "Secretary Desk"] },
  lamp:  { min: 30, max: 400, nouns: ["Floor Lamp", "Table Lamp", "Pendant Lamp", "Arc Lamp"] },
  rug:   { min: 50, max: 1200, nouns: ["Area Rug", "Runner Rug", "Wool Rug", "Jute Rug"] },
};

const ADJECTIVES = ["Harmony", "Willow", "Nordic", "Alden", "Juniper", "Marlowe", "Cedar", "Sage", "Otis", "Fern", "Beacon", "Lark", "Aspen", "Hollis", "Mercer", "Wren"];
const MATERIALS = ["Walnut", "Oak", "Linen", "Bouclé", "Teak", "Velvet", "Ash", "Rattan", "Leather", "Cotton Weave", "Maple", "Wool"];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeProduct(i) {
  const categories = Object.keys(CATEGORIES);
  const category = categories[i % categories.length];
  const spec = CATEGORIES[category];
  const name = `${pick(ADJECTIVES)} ${pick(MATERIALS)} ${pick(spec.nouns)}`;
  const price = Math.round(rand(spec.min, spec.max) * 100) / 100;
  const daysAgo = rand(1, 730);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    sku: `FUR-${category.toUpperCase().slice(0, 3)}-${String(100000 + i)}`,
    name,
    category,
    price,
    inStock: Math.random() < 0.85,
    createdAt,
    description: `${name} in ${pick(MATERIALS).toLowerCase()}. Crafted for everyday living with durable, responsibly sourced materials and a finish that suits any room.`,
  };
}

async function seed() {
  const db = await getDb();
  const products = db.collection("products");

  const existing = await products.countDocuments();
  if (existing > 0) {
    console.log(`products collection already has ${existing} documents, skipping seed.`);
    return;
  }

  process.stdout.write(`Seeding ${TOTAL} products…`);
  for (let from = 0; from < TOTAL; from += BATCH) {
    const docs = [];
    for (let i = from; i < Math.min(from + BATCH, TOTAL); i++) docs.push(makeProduct(i));
    await products.insertMany(docs, { ordered: false });
    process.stdout.write(` ${from + docs.length}`);
  }

  await products.createIndex({ category: 1, price: 1 });

  // Warehouse inventory: one stock record per product, maintained by the
  // warehouse management service (synced hourly).
  process.stdout.write("Seeding warehouse inventory…");
  const inventory = db.collection("inventory");
  const WAREHOUSES = ["Oakland", "Dallas", "Newark"];
  for (let from = 0; from < TOTAL; from += BATCH) {
    const docs = [];
    for (let i = from; i < Math.min(from + BATCH, TOTAL); i++) {
      docs.push({
        sku: `FUR-${Object.keys(CATEGORIES)[i % 7].toUpperCase().slice(0, 3)}-${String(100000 + i)}`,
        warehouse: pick(WAREHOUSES),
        count: Math.floor(rand(0, 250)),
      });
    }
    await inventory.insertMany(docs, { ordered: false });
  }
  await inventory.createIndex({ sku: 1 });
  console.log(` done (${await inventory.countDocuments()} records)`);

  const counts = await db.collection("products").aggregate([
    { $group: { _id: "$category", n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  console.log("\nSeeded:", counts.map((c) => `${c._id}=${c.n}`).join(" "));
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
