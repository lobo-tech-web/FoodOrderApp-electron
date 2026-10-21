const assert = require("node:assert/strict");
const { test } = require("node:test");
const { buildSync } = require("esbuild");
const path = require("node:path");

const load = (file) => {
  const result = buildSync({
    entryPoints: [path.join(__dirname, "../src/components/TotemDevicesPanel/TotemCatalog/totemCatalogUtils", file)],
    bundle: true, write: false, platform: "node", format: "cjs", packages: "external",
  });
  const module = { exports: {} };
  new Function("module", "exports", "require", result.outputFiles[0].text)(module, module.exports, require);
  return module.exports;
};

test("catalog sorts Spanish names, prices and points without mutating the menu or mixing currencies", () => {
  const { sortTotemProducts } = load("totemProductSort.js");
  const products = [
    { name: "Torta", displayPrice: 300 },
    { name: "Café", displayPrice: 100 },
    { name: "Árabe", displayPrice: 200 },
    { name: "Premio grande", displayPrice: 0, redeemPoints: 1000 },
    { name: "Premio chico", displayPrice: 0, redeemPoints: 200 },
  ];
  const names = (order) => sortTotemProducts(products, order).map((item) => item.name);
  assert.deepEqual(names("name_asc"), ["Árabe", "Café", "Premio chico", "Premio grande", "Torta"]);
  assert.deepEqual(names("name_desc"), ["Torta", "Premio grande", "Premio chico", "Café", "Árabe"]);
  assert.deepEqual(names("price_asc").slice(0, 3), ["Café", "Árabe", "Torta"]);
  assert.deepEqual(names("price_desc").slice(0, 3), ["Torta", "Árabe", "Café"]);
  assert.deepEqual(names("points_asc").slice(0, 2), ["Premio chico", "Premio grande"]);
  assert.deepEqual(names("points_desc").slice(0, 2), ["Premio grande", "Premio chico"]);
  assert.equal(products[0].name, "Torta");
});

test("category icons support accent-insensitive keywords, defaults and explicit overrides", () => {
  const { getTotemCategoryIcon, CATEGORY_ICON_RULES, CATEGORY_ICON_OVERRIDES } = load("totemCategoryIcons.jsx");
  assert.equal(getTotemCategoryIcon({ name: "CAFETERÍA" }), CATEGORY_ICON_RULES[1].icon);
  assert.equal(getTotemCategoryIcon({ name: "Cositas dulces" }), CATEGORY_ICON_RULES[4].icon);
  assert.equal(getTotemCategoryIcon({ name: "Canjeá tus puntos" }), CATEGORY_ICON_RULES[0].icon);
  const fallback = getTotemCategoryIcon({ name: "Varios" });
  assert.equal(getTotemCategoryIcon({}), fallback);
  CATEGORY_ICON_OVERRIDES.custom = CATEGORY_ICON_RULES[2].icon;
  assert.equal(getTotemCategoryIcon({ id: "custom", name: "Cafetería" }), CATEGORY_ICON_RULES[2].icon);
});
