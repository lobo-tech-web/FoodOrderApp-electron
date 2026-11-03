const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..', 'vendor/client-src');
const cache = new Map();
function load(file) {
  const filename = path.resolve(root, file);
  if (cache.has(filename)) return cache.get(filename);
  const module = { exports: {} };
  cache.set(filename, module.exports);
  const code = esbuild.transformSync(fs.readFileSync(filename, 'utf8'), { format: 'cjs', loader: 'js' }).code;
  new Function('require', 'module', 'exports', code)(id => id.startsWith('.')
    ? load(path.resolve(path.dirname(filename), id)) : require(id), module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}
const { buildCartProductForEditing, findCartProduct, replaceCustomizedCartItem } = load('utils/cartProductEditing.js');
const { getCustomizationsFromSelectedItems, getProductOptionsForUI, getSelectedOptionItems } = load('utils/migrateCustomOptions.js');
const { calculateProductTotals } = load('utils/orderCalculations.js');
const option = { id: 'extras', name: 'Agregados', type: 'extra', items: [
  { id: 'cheese', name: 'Queso', extraCost: 200, status: true },
  { id: 'bacon', name: 'Bacon', extraCost: 300, status: true },
] };
const product = { id: 'burger', name: 'Hamburguesa', price: '1000.00', allowComment: true, rewardPoints: 10,
  productCustomOptions: [{ ...option, ProductCustomOption: { maxSelected: 10 } }] };
const line = { productId: 'burger', name: product.name, price: 1400, quantity: 3, productComment: 'Sin cebolla',
  customOptions: [{ optionId: 'extras', optionName: 'Agregados', itemId: 'cheese', name: 'Queso', extraCost: 200, quantity: 2 }] };

test('reabrir restaura opciones, cantidades y comentario usando el precio base del catálogo', () => {
  const editable = buildCartProductForEditing(product, line);
  assert.equal(editable.price, 1000);
  assert.equal(editable.quantity, 3);
  assert.equal(editable.productComment, 'Sin cebolla');
  const options = getProductOptionsForUI(editable);
  assert.deepEqual(getCustomizationsFromSelectedItems(options, editable.customOptions), { extras: { cheese: 2, bacon: 0 } });
});

test('editar solo reemplaza la línea indicada y conserva su cantidad; extras no se duplican', () => {
  const other = { ...line, productComment: 'Otra preparación', quantity: 1 };
  const current = [line, other];
  const editable = buildCartProductForEditing(product, line);
  const updated = replaceCustomizedCartItem(current, 0, { ...editable, quantity: 1, productComment: 'Bien cocida' });
  assert.equal(updated.length, 2);
  assert.equal(updated[0].price, 1400);
  assert.equal(updated[0].quantity, 3);
  assert.equal(updated[0].productComment, 'Bien cocida');
  assert.equal(updated[1], other);
  assert.equal(current[0], line);
  assert.equal(line.productComment, 'Sin cebolla');
  const reopened = buildCartProductForEditing(product, updated[0]);
  const savedAgain = replaceCustomizedCartItem(updated, 0, reopened);
  assert.equal(savedAgain[0].price, 1400);
  assert.equal(calculateProductTotals(savedAgain).subtotalProducts, 5600);
  assert.equal(Object.hasOwn(savedAgain[0], 'customizationOptions'), false);
  assert.equal(Object.hasOwn(savedAgain[0], 'productCustomOptions'), false);
});

test('permite cambiar o quitar extras y borrar el comentario sin dejar importes anteriores', () => {
  const editable = buildCartProductForEditing(product, line);
  const customOptions = getSelectedOptionItems(getProductOptionsForUI(editable), { extras: { cheese: 0, bacon: 1 } });
  let result = replaceCustomizedCartItem([line], 0, { ...editable, customOptions, productComment: '' });
  assert.equal(result[0].price, 1300);
  assert.equal(result[0].quantity, 3);
  assert.equal(result[0].productComment, '');
  result = replaceCustomizedCartItem(result, 0, { ...editable, customOptions: [], productComment: '' });
  assert.equal(result[0].price, 1000);
});

test('las opciones legacy conservan sus definiciones y reconocen snapshots con IDs nulos', () => {
  const legacy = { ...product, productCustomOptions: [], customOptions: [option] };
  const snapshot = { ...line, customOptions: [{ optionId: null, itemId: null, name: 'Queso', extraCost: 200, quantity: 2 }] };
  const editable = buildCartProductForEditing(legacy, snapshot);
  const options = getProductOptionsForUI(editable);
  assert.equal(options[0].items.length, 2);
  assert.equal(getCustomizationsFromSelectedItems(options, editable.customOptions).extras.cheese, 2);
  assert.equal(replaceCustomizedCartItem([snapshot], 0, editable)[0].price, 1400);
});

test('descartar la edición no muta la línea ni las definiciones originales', () => {
  const original = structuredClone(product);
  const snapshot = structuredClone(line);
  const editable = buildCartProductForEditing(original, snapshot);
  editable.customOptions[0].quantity = 9;
  editable.customizationOptions[0].items[0].name = 'Cambio temporal';
  editable.productComment = 'Descartado';
  assert.equal(snapshot.customOptions[0].quantity, 2);
  assert.equal(snapshot.productComment, 'Sin cebolla');
  assert.equal(original.productCustomOptions[0].items[0].name, 'Queso');
});

test('se aplica el descuento una sola vez y se conserva cantidad y puntos', () => {
  const discounted = { ...product, price: 2000, discount: 25 };
  const editable = buildCartProductForEditing(discounted, line);
  assert.equal(editable.price, 1500);
  const saved = replaceCustomizedCartItem([line], 0, editable);
  assert.equal(saved[0].price, 1900);
  assert.equal(calculateProductTotals(saved).totalRewardPoints, 30);
});

test('la búsqueda usa identidad del producto y no confunde productos con el mismo nombre', () => {
  assert.equal(findCartProduct([{ ...product, id: 'other' }], line), undefined);
  assert.equal(findCartProduct([product], line), product);
  assert.equal(replaceCustomizedCartItem([line], 5, product)[0], line);
});
