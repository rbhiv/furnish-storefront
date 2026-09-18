const path = require("path");
const express = require("express");
const { listProducts } = require("./src/routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.get("/api/products", listProducts);

app.listen(PORT, () => {
  console.log(`Furnish storefront listening on http://localhost:${PORT}`);
});
