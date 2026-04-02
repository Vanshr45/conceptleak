#!/usr/bin/env node

/**
 * Auto-open browser utility for Expo web development
 * Monitors for Expo startup and automatically opens http://localhost:8081
 */

const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

const WEB_URL = 'http://localhost:8081';
const MAX_WAIT_TIME = 20000; // 20 seconds max wait
const CHECK_INTERVAL = 1500; // Check every 1.5 seconds

let hasOpened = false;
let startTime = Date.now();

console.log('🚀 Starting Expo web server...\n');

// Start Expo web server using npx
const expo = spawn('npx', ['expo', 'start', '--web', '--localhost'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
});

// Function to open browser based on OS
function openBrowser(url) {
  const platform = os.platform();
  let command;

  switch (platform) {
    case 'darwin':
      command = `open "${url}"`;
      break;
    case 'win32':
      command = `start ${url}`;
      break;
    default:
      command = `xdg-open "${url}"`;
  }

  require('child_process').exec(command, (err) => {
    if (err) {
      console.log(`\n📱 Please manually open in your browser: ${url}\n`);
    }
  });
}

// Poll for server availability
const checker = setInterval(async () => {
  if (hasOpened) {
    clearInterval(checker);
    return;
  }

  const elapsed = Date.now() - startTime;
  if (elapsed > MAX_WAIT_TIME) {
    clearInterval(checker);
    console.log(`\n📱 Server started! Visit: ${WEB_URL}\n`);
    return;
  }

  try {
    const request = http.get(WEB_URL, { timeout: 2000 }, (res) => {
      if (!hasOpened && res.statusCode) {
        hasOpened = true;
        clearInterval(checker);
        console.log(`\n✅ Server ready! Opening browser...\n`);
        setTimeout(() => {
          openBrowser(WEB_URL);
        }, 500);
      }
      request.destroy();
    });

    request.on('error', () => {
      request.destroy();
    });

    request.on('timeout', () => {
      request.destroy();
    });
  } catch (err) {
    // Server not ready yet
  }
}, CHECK_INTERVAL);

// Cleanup on exit
process.on('SIGINT', () => {
  clearInterval(checker);
  expo.kill();
  process.exit(0);
});

