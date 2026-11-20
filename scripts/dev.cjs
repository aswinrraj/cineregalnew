const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const node = process.execPath;
const tasks = [
  { name: 'frontend', cwd: path.join(root, 'frontend'), entry: 'node_modules/vite/bin/vite.js' },
  { name: 'backend', cwd: path.join(root, 'backend'), entry: 'node_modules/nodemon/bin/nodemon.js', args: ['server.js'] },
];

let shuttingDown = false;
let children = [];

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  process.exitCode = code;
}

children = tasks.map(({ name, cwd, entry, args = [] }) => {
  const child = spawn(node, [entry, ...args], { cwd, stdio: 'inherit', env: process.env });
  child.on('error', (error) => {
    console.error(`[${name}] Could not start: ${error.message}`);
    shutdown(1);
  });
  child.on('exit', (code) => {
    if (!shuttingDown && code !== 0) shutdown(code || 1);
  });
  return child;
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
