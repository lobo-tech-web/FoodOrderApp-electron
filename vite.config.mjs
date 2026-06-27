import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientSrc = path.resolve(__dirname, 'vendor/client-src');
const localNodeModules = path.resolve(__dirname, 'node_modules');
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
);
const buildOnlyPackages = new Set([
  '@vitejs/plugin-react',
  'electron',
  'electron-builder',
  'vite',
]);
const rendererPackages = Object.keys(packageJson.devDependencies || {}).filter(
  (packageName) =>
    !buildOnlyPackages.has(packageName) &&
    fs.existsSync(path.resolve(localNodeModules, packageName))
);
const packageAliases = Object.fromEntries(
  rendererPackages.map((packageName) => [
    packageName,
    path.resolve(localNodeModules, packageName),
  ])
);

const secureSessionPlugin = {
  name: 'electron-secure-session',
  transform(code, id) {
    const normalizedId = id.replaceAll('\\', '/');
    const handlesSession =
      normalizedId.endsWith('/context/Users.jsx') ||
      normalizedId.endsWith('/services/axiosConfig.js');

    if (!handlesSession) return null;

    return {
      code: code.replaceAll('window.localStorage', 'window.secureStorage'),
      map: null,
    };
  },
};

export default {
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
  },
  plugins: [secureSessionPlugin, react()],
  resolve: {
    alias: {
      '@': clientSrc,
      ...packageAliases,
    },
  },
  server: {
    fs: {
      allow: [__dirname],
    },
  },
};
