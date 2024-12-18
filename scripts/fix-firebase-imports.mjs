import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');

function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace .tsx imports with .ts
    const updatedContent = content.replace(
      /from\s+['"](.*)firebase\.tsx['"]/g, 
      "from '$1firebase.ts'"
    );

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated imports in ${path.relative(projectRoot, filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      updateImports(fullPath);
    }
  });
}

walkDirectory(srcDir);
