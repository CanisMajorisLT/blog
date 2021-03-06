/**
 * Watches for changes in generator and reruns app.js, which compiles generator and runs it on generator target files
 */
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const debounce = require('lodash/debounce');
const initServerOnDist = require('./browserSync');

const app = path.join(__dirname, './generatorRunnerProxy.js');
const generatorFilesToWatch = [
  path.join(__dirname, './lib'),
  path.join(__dirname, './lib/generator'),
  path.join(__dirname, './templates'),
  path.join(__dirname, './templates/comments'),
  path.join(__dirname, './server'),
];
const generatorTargetFilesToWatch = [
  path.join(__dirname, './articles'),
  path.join(__dirname, './styles'),
  path.join(__dirname, './client'),
  path.join(__dirname, './client/sw'),
];

const server = initServerOnDist();
let currentChildProcess;

function spawnProcess() {
  process.env.LISTEN_MESSAGE = true;
  currentChildProcess = childProcess.fork(`${app}`);

  currentChildProcess.on('message', m => {
    if (m === 'generated') {
      server.reload();
    }
  });

  currentChildProcess.on('exit', () => {
    console.info('Killing app');
  });
}

function rerunApp() {
  currentChildProcess.kill();
  spawnProcess();
}

function triggerGenerator() {
  currentChildProcess.send('trigger');
}

const debouncedRerunApp = debounce(rerunApp, 100);
const debouncedTriggerGenerator = debounce(triggerGenerator, 100);

generatorFilesToWatch.forEach(f =>
  fs.watch(f, eventType => {
    if (eventType === 'change') {
      debouncedRerunApp();
    }
  }),
);

generatorTargetFilesToWatch.forEach(f =>
  fs.watch(f, eventType => {
    if (eventType === 'change') {
      debouncedTriggerGenerator();
    }
  }),
);

spawnProcess();
