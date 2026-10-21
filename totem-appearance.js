const fs = require("node:fs");
const path = require("node:path");

const MAX_BYTES = 10 * 1024 * 1024;

const createTotemAppearance = (app, nativeImage) => {
  const configPath = () => path.join(app.getPath("userData"), "totem-appearance.json");

  let cached;

  const read = () => {
    if (cached) return cached;
    try {
      if (fs.statSync(configPath()).size > MAX_BYTES * 1.5) throw new Error("Configuración demasiado grande");
      const saved = JSON.parse(fs.readFileSync(configPath(), "utf8"));
      const imageUrl = typeof saved.imageUrl === "string" && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(saved.imageUrl) ? saved.imageUrl : "";
      cached = { mode: saved.mode === "image" && imageUrl ? "image" : "theme", imageUrl };
    } catch {
      cached = { mode: "theme", imageUrl: "" };
    }
    return cached;
  };

  const getBackground = () => {
    const saved = read();
    return { mode: saved.mode, imageUrl: saved.mode === "image" ? saved.imageUrl : "", hasImage: Boolean(saved.imageUrl) };
  };

  const save = (settings) => {
    const target = configPath();
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(`${target}.tmp`, JSON.stringify(settings), { encoding: "utf8", mode: 0o600 });
    fs.renameSync(`${target}.tmp`, target);
    cached = settings;
    return getBackground();
  };

  const setMode = (mode) => {
    if (!["theme", "image"].includes(mode)) throw new Error("Fondo inválido");
    const saved = read();
    if (mode === "image" && !saved.imageUrl) throw new Error("Cargá una imagen primero");
    return save({ ...saved, mode });
  };

  const importImage = (filePath) => {
    if (!/\.(png|jpe?g)$/i.test(filePath)) throw new Error("Seleccioná una imagen PNG o JPG");
    const info = fs.statSync(filePath);
    if (!info.isFile() || info.size > MAX_BYTES) throw new Error("La imagen debe pesar como máximo 10 MB");
    let image = nativeImage.createFromPath(filePath);
    if (image.isEmpty()) throw new Error("No se pudo leer la imagen seleccionada");
    const { width, height } = image.getSize();
    if (!width || !height || width > 8192 || height > 8192 || width * height > 32000000) {
      throw new Error("La imagen es demasiado grande. Usá una imagen de hasta 8192 px por lado y 32 megapíxeles");
    }
    const scale = Math.min(1, 3840 / width, 2160 / height);
    if (scale < 1) image = image.resize({ width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), quality: "best" });
    const png = image.toPNG();
    if (!png.length || png.length > MAX_BYTES) throw new Error("La imagen procesada supera los 10 MB. Probá una imagen más pequeña");
    return save({ mode: "image", imageUrl: `data:image/png;base64,${png.toString("base64")}` });
  };

  return { getBackground, setMode, importImage };
};

module.exports = { createTotemAppearance };
