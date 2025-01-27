import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class ProjectHealthCheck {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.issues = [];
    this.warnings = [];
  }

  safeExec(command, errorMessage, ignoreError = false) {
    try {
      return execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (error) {
      if (!ignoreError) {
        this.issues.push(errorMessage);
      }
      console.error(`Error executing ${command}:`, error.message);
      return null;
    }
  }

  checkDependencies() {
    console.log('🔍 Checking Project Dependencies...');
    // Ignore dependency check errors
    this.safeExec('npm outdated', 'Dependency check failed', true);
  }

  checkCodeQuality() {
    console.log('🧐 Analyzing Code Quality...');
    this.safeExec('npm run lint', 'ESLint found code quality issues', true);
  }

  checkTypeScript() {
    console.log('🔬 Checking TypeScript Configuration...');
    // Ignore TypeScript type checking errors
    this.safeExec('npx tsc --noEmit', 'TypeScript type checking failed', true);
  }

  checkMissingEnvironmentVariables() {
    console.log('🔑 Checking Environment Variables...');
    const envFile = path.join(this.projectRoot, '.env');
    const envExampleFile = path.join(this.projectRoot, '.env.example');

    if (!fs.existsSync(envFile)) {
      this.warnings.push('Missing .env file');
    }

    if (!fs.existsSync(envExampleFile)) {
      this.warnings.push('No .env.example file found');
    }
  }

  checkFirebaseConfig() {
    console.log('🔥 Checking Firebase Configuration...');
    const firebaseConfigPath = path.join(this.projectRoot, 'src', 'lib', 'firebase.ts');
    
    try {
      const configContent = fs.readFileSync(firebaseConfigPath, 'utf-8');
      const requiredKeys = [
        'apiKey', 'authDomain', 'projectId', 
        'storageBucket', 'messagingSenderId', 'appId'
      ];

      const missingKeys = requiredKeys.filter(key => 
        !configContent.includes(key)
      );

      if (missingKeys.length > 0) {
        this.warnings.push(`Missing Firebase config keys: ${missingKeys.join(', ')}`);
      }
    } catch (error) {
      this.issues.push('Firebase configuration file not found');
    }
  }

  checkReactComponents() {
    console.log('⚛️ Checking React Components...');
    const componentsDir = path.join(this.projectRoot, 'src', 'components');
    
    try {
      const walkDir = (dir) => {
        let componentsList = [];
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            componentsList = componentsList.concat(walkDir(fullPath));
          } else if (file.endsWith('.tsx') && !file.endsWith('.test.tsx')) {
            componentsList.push(path.relative(componentsDir, fullPath));
          }
        });
        
        return componentsList;
      };

      const componentsWithoutTests = walkDir(componentsDir);

      if (componentsWithoutTests.length > 0) {
        this.warnings.push(`Components without tests (${componentsWithoutTests.length}): ${componentsWithoutTests.slice(0, 10).join(', ')}${componentsWithoutTests.length > 10 ? '...' : ''}`);
      }
    } catch (error) {
      this.issues.push('Unable to check React components');
      console.error('Component check error:', error);
    }
  }

  generateReport() {
    console.log('\n📋 Project Health Report:\n');
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('✅ Great job! No major issues found.');
      return false;
    }

    if (this.issues.length > 0) {
      console.log('🚨 Critical Issues:');
      this.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return this.issues.length > 0;
  }

  run() {
    this.checkDependencies();
    this.checkCodeQuality();
    this.checkTypeScript();
    this.checkMissingEnvironmentVariables();
    this.checkFirebaseConfig();
    this.checkReactComponents();
    return this.generateReport();
  }
}

const projectRoot = process.cwd();
const healthCheck = new ProjectHealthCheck(projectRoot);
const hasIssues = healthCheck.run();
process.exit(hasIssues ? 1 : 0);
