const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const viteBin = path.resolve(root, 'node_modules', 'vite', 'bin', 'vite.js');
const electronBin = path.resolve(
  root,
  'node_modules',
  'electron',
  'cli.js'
);
const devHost = process.env.ELECTRON_DEV_HOST || 'localhost';
const devPort = process.env.ELECTRON_DEV_PORT || '5173';
const devServerUrl = `http://${devHost}:${devPort}`;

const children = [];

const spawnChild = (command, args, extraEnv = {}) => {
  const child = spawn(command, args, {
    cwd: root,
    env: {
      ...process.env,
      ...extraEnv,
    },
    shell: false,
    stdio: 'inherit',
  });

  children.push(child);
  child.on('exit', (code) => {
    if (code && code !== 0) process.exitCode = code;
    stopChildren(child.pid);
  });

  return child;
};

const stopChildren = (exceptPid) => {
  for (const child of children) {
    if (child.pid !== exceptPid && !child.killed) child.kill();
  }
};

const waitForServer = (url, retries = 80) =>
  new Promise((resolve, reject) => {
    const check = (attempt) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on('error', () => {
        if (attempt >= retries) {
          reject(new Error(`Vite dev server did not start at ${url}`));
          return;
        }
        setTimeout(() => check(attempt + 1), 250);
      });

      request.setTimeout(1000, () => {
        request.destroy();
      });
    };

    check(0);
  });

process.on('SIGINT', () => {
  stopChildren();
  process.exit();
});

spawnChild(process.execPath, [
  viteBin,
  '--host',
  devHost,
  '--port',
  devPort,
  '--strictPort',
]);

waitForServer(devServerUrl)
  .then(() => {
    spawnChild(process.execPath, [electronBin, '.'], {
      ELECTRON_RENDERER_URL: devServerUrl,
    });
  })
  .catch((error) => {
    console.error(
      `${error.message}\n` +
        `Check whether port ${devPort} is already in use or set ` +
        'ELECTRON_DEV_PORT to another API-allowed port.'
    );
    stopChildren();
    process.exit(1);
  });
