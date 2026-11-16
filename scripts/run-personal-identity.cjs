const path = require('node:path');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'test-results', 'personal-identity'), { recursive: true });
const bootstrap = path.join(__dirname, 'node-userinfo.cjs').replace(/\\/g, '/');
const result = spawnSync(process.execPath,
    ['--require', bootstrap, path.join(root, 'node_modules/@cucumber/cucumber/bin/cucumber.js'),
        '--config', 'cucumber.personal-identity.cjs', ...process.argv.slice(2)],
    { cwd: root, stdio: 'inherit', env: { ...process.env, HEADLESS: process.env.HEADLESS || 'true',
        NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require "${bootstrap}"` } });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
