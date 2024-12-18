const fs = require('fs');
const path = require('path');

console.log('🔍 SwapSkills Diagnostic Tool');

// Check Environment Variables
function checkEnvVariables() {
  console.log('\n📋 Environment Variables Check:');
  const envPath = path.join(__dirname, '.env');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
    ];

    requiredVars.forEach((varName) => {
      if (envContent.includes(varName)) {
        console.log(`✅ ${varName}: Configured`);
      } else {
        console.log(`❌ ${varName}: Missing`);
      }
    });
  } catch (error) {
    console.error('❌ Error reading .env file:', error);
  }
}

// Check Package Dependencies
function checkDependencies() {
  console.log('\n📦 Dependency Check:');
  const packageJson = require('./package.json');
  const criticalDeps = ['react', 'firebase', 'vite', 'react-router-dom', 'typescript'];

  criticalDeps.forEach((dep) => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}: Installed`);
    } else {
      console.log(`❌ ${dep}: Not Found`);
    }
  });
}

// Check TypeScript Configuration
function checkTypescriptConfig() {
  console.log('\n⚙️ TypeScript Configuration:');
  try {
    const tsConfig = require('./tsconfig.json');
    console.log('✅ TypeScript configuration loaded');
    console.log('Compiler Options:', Object.keys(tsConfig.compilerOptions || {}));
  } catch (error) {
    console.error('❌ Error reading tsconfig.json:', error);
  }
}

// Run Diagnostics
function runDiagnostics() {
  console.log('🚀 Starting SwapSkills Diagnostic Process');
  checkEnvVariables();
  checkDependencies();
  checkTypescriptConfig();
  console.log('\n🏁 Diagnostic Complete');
}

runDiagnostics();
