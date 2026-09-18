const categoryEl = document.getElementById("category");
const maxPriceEl = document.getElementById("maxPrice");
const inStockEl = document.getElementById("inStock");
const sortEl = document.getElementById("sort");
const browseBtn = document.getElementById("browse");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

function formatPrice(p) {
  return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function card(p) {
  return `
    <article class="card">
      <div class="thumb" aria-hidden="true"></div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <div class="meta">
          <span class="price">${formatPrice(p.price)}</span>
          <span class="stock ${p.stockCount > 0 ? "in" : "out"}">
            ${p.stockCount > 0 ? `${p.stockCount} in stock` : "out of stock"}
          </span>
        </div>
        <div class="sub">Added ${formatDate(p.createdAt)}</div>
      </div>
    </article>`;
}

async function loadProducts() {
  const params = new URLSearchParams({
    category: categoryEl.value,
    maxPrice: maxPriceEl.value,
    inStock: inStockEl.checked ? "true" : "false",
  });

  browseBtn.disabled = true;
  browseBtn.textContent = "Loading…";
  statusEl.hidden = false;
  statusEl.textContent = "Loading products…";
  resultsEl.innerHTML = "";

  try {
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    statusEl.textContent = `${data.count} products · responded in ${data.tookMs} ms`;
    resultsEl.innerHTML = data.items.map(card).join("");
  } catch (err) {
    statusEl.textContent = "Something went wrong loading products. Please try again.";
  } finally {
    browseBtn.disabled = false;
    browseBtn.textContent = "Browse furniture";
  }
}

browseBtn.addEventListener("click", loadProducts);
document.addEventListener("DOMContentLoaded", loadProducts);
