import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const criticalDeps = ['react', 'firebase', 'vite', 'react-router-dom', 'typescript'];

    criticalDeps.forEach((dep) => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`✅ ${dep}: Installed`);
      } else {
        console.log(`❌ ${dep}: Not Found`);
      }
    });
  } catch (error) {
    console.error('❌ Error reading package.json:', error);
  }
}

// Check TypeScript Configuration
function checkTypescriptConfig() {
  console.log('\n⚙️ TypeScript Configuration:');
  try {
    const tsconfigPath = path.join(__dirname, 'tsconfig.json');
    const tsConfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    console.log('✅ TypeScript configuration loaded');
    console.log('Compiler Options:', Object.keys(tsConfig.compilerOptions || {}));
  } catch (error) {
    console.error('❌ Error reading tsconfig.json:', error);
  }
}

// Check Vite Configuration
function checkViteConfig() {
  console.log('\n🚀 Vite Configuration:');
  try {
    const viteconfigPath = path.join(__dirname, 'vite.config.ts');
    const viteConfig = fs.readFileSync(viteconfigPath, 'utf8');
    console.log('✅ Vite configuration file found');

    // Basic checks
    const checks = [
      { name: 'React Plugin', check: viteConfig.includes('react()') },
      { name: 'TypeScript Support', check: viteConfig.includes('typescript()') },
    ];

    checks.forEach(({ name, check }) => {
      console.log(`${check ? '✅' : '❌'} ${name}`);
    });
  } catch (error) {
    console.error('❌ Error reading vite.config.ts:', error);
  }
}

// Run Diagnostics
function runDiagnostics() {
  console.log('🚀 Starting SwapSkills Diagnostic Process');
  checkEnvVariables();
  checkDependencies();
  checkTypescriptConfig();
  checkViteConfig();
  console.log('\n🏁 Diagnostic Complete');
}

runDiagnostics();
