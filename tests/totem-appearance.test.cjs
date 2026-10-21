const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { createTotemAppearance } = require("../totem-appearance.js");

test("background is saved locally, survives restart and can switch back to theme without losing the image", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "totem-background-"));
  t.after(() => {
    for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));
    fs.rmdirSync(directory);
  });
  const source = path.join(directory, "source.jpg");
  fs.writeFileSync(source, "test-image");
  let resized;
  const image = { isEmpty: () => false, getSize: () => ({ width: 7680, height: 4000 }), toPNG: () => Buffer.from("normalized-png"), resize: (size) => { resized = size; return image; } };
  const app = { getPath: () => directory };
  const nativeImage = { createFromPath: () => image };
  const appearance = createTotemAppearance(app, nativeImage);
  assert.equal(appearance.getBackground().mode, "theme");
  assert.throws(() => appearance.setMode("image"), /Cargá/);
  const selected = appearance.importImage(source);
  assert.equal(selected.mode, "image");
  assert.equal(resized.width, 3840);
  fs.unlinkSync(source);
  const restarted = createTotemAppearance(app, nativeImage);
  assert.equal(restarted.getBackground().imageUrl, selected.imageUrl);
  assert.equal(restarted.setMode("theme").imageUrl, "");
  assert.equal(restarted.getBackground().hasImage, true);
  assert.equal(restarted.setMode("image").imageUrl, selected.imageUrl);
  assert.throws(() => restarted.importImage("not-an-image.svg"), /PNG o JPG/);
  const invalid = path.join(directory, "invalid.png");
  fs.writeFileSync(invalid, "invalid");
  const invalidImages = createTotemAppearance(app, { createFromPath: () => ({ isEmpty: () => true }) });
  assert.throws(() => invalidImages.importImage(invalid), /No se pudo leer/);
  assert.equal(invalidImages.getBackground().imageUrl, selected.imageUrl);
});
