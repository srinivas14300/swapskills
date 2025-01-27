import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(process.cwd());

// Function to update import statements
function updateImportStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add .tsx/.ts extensions to imports
    content = content.replace(/from\s+['"](\.[^'"]+)['"](?!\.)/g, (match, p1) => {
      if (p1.endsWith('.tsx') || p1.endsWith('.ts')) return match;
      return `from '${p1}.tsx'`;
    });

    // Import type fixes
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];/g, (match, imports, source) => {
      const fixedImports = imports.split(',').map(imp => {
        const trimmedImp = imp.trim();
        return trimmedImp.startsWith('type ') ? trimmedImp : trimmedImp;
      }).join(', ');
      return `import { ${fixedImports} } from '${source}';`;
    });

    // Add missing imports
    const missingImports = [
      "import { User } from 'firebase/auth';",
      "import { Timestamp } from 'firebase/firestore';",
      "import { UserProfile, Skill } from '../types';"
    ];

    missingImports.forEach(imp => {
      if (!content.includes(imp)) {
        content = imp + '\n' + content;
      }
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Function to update type annotations
function updateTypeAnnotations(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace any with more specific types
    content = content.replace(/:\s*any/g, ': unknown');
    
    // Add explicit type annotations
    content = content.replace(/const\s+(\w+)\s*=\s*useState\(/g, (match, varName) => {
      return `const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState<any>(`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated type annotations in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Recursively find and process TypeScript files
function processTypeScriptFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        processTypeScriptFiles(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateImportStatements(fullPath);
      updateTypeAnnotations(fullPath);
    }
  });
}

// Main execution
function main() {
  console.log('Starting type error fixes...');
  processTypeScriptFiles(path.join(projectRoot, 'src'));
  console.log('Type error fixes completed!');
}

main();
