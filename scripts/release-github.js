const { Arch, Platform, build } = require('electron-builder');

const repository = process.env.UPDATE_REPOSITORY || process.env.GITHUB_REPOSITORY;
const token = process.env.GH_TOKEN;

if (!repository || !repository.includes('/')) {
  throw new Error(
    'Define UPDATE_REPOSITORY or GITHUB_REPOSITORY as owner/repository.'
  );
}

if (!token) {
  throw new Error('GH_TOKEN is required to publish a GitHub Release.');
}

const [owner, repo] = repository.split('/');

build({
  targets: Platform.WINDOWS.createTarget(['nsis'], Arch.x64),
  publish: 'always',
  config: {
    publish: [
      {
        provider: 'github',
        owner,
        repo,
        releaseType: 'release',
      },
    ],
  },
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
