#!/usr/bin/env node

/**
 * ConceptLeak Pre-Launch Verification Script
 * Ensures the app is ready to run
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function check(name, condition, errorMsg = '') {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${name}`);
    checks.passed++;
  } else {
    console.log(`${RED}✗${RESET} ${name}`);
    if (errorMsg) console.log(`  ${YELLOW}→${RESET} ${errorMsg}`);
    checks.failed++;
  }
}

function warn(name, condition, warningMsg = '') {
  if (condition) {
    console.log(`${YELLOW}⚠${RESET} ${name}`);
    if (warningMsg) console.log(`  ${YELLOW}→${RESET} ${warningMsg}`);
    checks.warnings++;
  }
}

console.log(`
${GREEN}╔═══════════════════════════════════════╗
║  ConceptLeak Pre-Launch Verification    ║
║  Version 1.0.0                          ║
╚═══════════════════════════════════════╝${RESET}
`);

// Check required files
console.log('📁 Checking Required Files...');
check('package.json exists', fs.existsSync('package.json'));
check('App.tsx exists', fs.existsSync('App.tsx'));
check('app.json exists', fs.existsSync('app.json'));
check('tsconfig.json exists', fs.existsSync('tsconfig.json'));

// Check directories
console.log('\n📂 Checking Directories...');
check('screens/ exists', fs.existsSync('screens'));
check('navigation/ exists', fs.existsSync('navigation'));
check('services/ exists', fs.existsSync('services'));
check('theme/ exists', fs.existsSync('theme'));
check('components/ exists', fs.existsSync('components'));
check('types/ exists', fs.existsSync('types'));

// Check screen files
console.log('\n📱 Checking Screens...');
check('HomeScreen.tsx exists', fs.existsSync('screens/HomeScreen.tsx'));
check('ChatScreen.tsx exists', fs.existsSync('screens/ChatScreen.tsx'));
check('InsightsScreen.tsx exists', fs.existsSync('screens/InsightsScreen.tsx'));
check('DatasetsScreen.tsx exists', fs.existsSync('screens/DatasetsScreen.tsx'));
check('ProfileScreen.tsx exists', fs.existsSync('screens/ProfileScreen.tsx'));

// Check critical files
console.log('\n🔑 Checking Critical Files...');
check('RootNavigator.tsx exists', fs.existsSync('navigation/RootNavigator.tsx'));
check('api.ts exists', fs.existsSync('services/api.ts'));
check('colors.ts exists', fs.existsSync('theme/colors.ts'));

// Check components
console.log('\n🧩 Checking Components...');
check('CustomButton.tsx exists', fs.existsSync('components/CustomButton.tsx'));
check('CustomCard.tsx exists', fs.existsSync('components/CustomCard.tsx'));
check('LoadingSpinner.tsx exists', fs.existsSync('components/LoadingSpinner.tsx'));
check('ErrorMessage.tsx exists', fs.existsSync('components/ErrorMessage.tsx'));
check('components/index.ts exists', fs.existsSync('components/index.ts'));

// Check node_modules
console.log('\n📦 Checking Dependencies...');
check('node_modules/ exists', fs.existsSync('node_modules'), 'Run "npm install" first');

// Check package.json configuration
console.log('\n⚙️  Checking Configuration...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  check('package.json is valid JSON', true);
  check('Main entry is App.tsx', pkg.main === 'App.tsx', `Current: ${pkg.main}`);
  check('React Navigation installed', 
    pkg.dependencies['@react-navigation/native'] && 
    pkg.dependencies['@react-navigation/bottom-tabs'],
    'Navigation packages missing'
  );
  check('Axios installed', pkg.dependencies.axios, 'Run: npm install axios');
  check('TypeScript installed', pkg.devDependencies.typescript, 'Run: npm install --save-dev typescript');
} catch (e) {
  console.log(`${RED}✗${RESET} Failed to parse package.json`);
  checks.failed++;
}

// Check documentation
console.log('\n📚 Checking Documentation...');
check('README.md exists', fs.existsSync('README.md'));
check('CONCEPTLEAK_SETUP.md exists', fs.existsSync('CONCEPTLEAK_SETUP.md'));
check('PROJECT_SUMMARY.md exists', fs.existsSync('PROJECT_SUMMARY.md'));
check('QUICK_REFERENCE.md exists', fs.existsSync('QUICK_REFERENCE.md'));
check('MIGRATION_NOTES.md exists', fs.existsSync('MIGRATION_NOTES.md'));

// Warnings
console.log('\n⚠️  Warnings...');
warn(
  'API base URL for development',
  !fs.readFileSync('services/api.ts', 'utf-8').includes('localhost:3000'),
  'Update API_BASE_URL in services/api.ts for production API'
);
warn(
  '.env file not found',
  !fs.existsSync('.env'),
  'Copy .env.example to .env and fill in values'
);

// Summary
console.log(`
${'═'.repeat(40)}
${GREEN}✓ Passed: ${checks.passed}${RESET}
${RED}✗ Failed: ${checks.failed}${RESET}
${YELLOW}⚠ Warnings: ${checks.warnings}${RESET}
${'═'.repeat(40)}
`);

if (checks.failed === 0) {
  console.log(`${GREEN}
✅ All checks passed!
Your ConceptLeak app is ready to run.

Next steps:
  1. npm start
  2. Scan QR code with Expo Go
  3. Start building!
${RESET}`);
  process.exit(0);
} else {
  console.log(`${RED}
❌ Some checks failed.
Please fix the issues above before running npm start.
${RESET}`);
  process.exit(1);
}
