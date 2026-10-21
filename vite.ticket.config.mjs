import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));

export default {
  resolve: { alias: { "@": path.join(root, "vendor/client-src") } },
  build: {
    outDir: "dist-main",
    lib: {
      entry: "vendor/client-src/utils/printTemplates/orderTicketTemplate.js",
      formats: ["cjs"],
      fileName: () => "totem-ticket.cjs",
    },
  },
};
