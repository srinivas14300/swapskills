import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src', 'components');

function createTestTemplate(componentPath) {
  const componentName = path.basename(componentPath, '.tsx');
  const importPath = path.relative(path.dirname(componentPath.replace('.tsx', '.test.tsx')), componentPath).replace('.tsx', '');
  
  return `import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${componentName} from '${importPath}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    // Adjust props as needed for your specific component
    render(<${componentName} />);
    // Add more specific tests based on component functionality
  });
});
`;
}

function walkDir(dir) {
  let componentsList = [];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      componentsList = componentsList.concat(walkDir(fullPath));
    } else if (file.endsWith('.tsx') && !file.endsWith('.test.tsx')) {
      componentsList.push(fullPath);
    }
  });
  
  return componentsList;
}

function addTests() {
  const componentsWithoutTests = walkDir(componentsDir);
  
  componentsWithoutTests.forEach(componentPath => {
    const testPath = componentPath.replace('.tsx', '.test.tsx');
    
    if (!fs.existsSync(testPath)) {
      try {
        fs.writeFileSync(testPath, createTestTemplate(componentPath));
        console.log(`Created test for ${path.basename(componentPath)}`);
      } catch (error) {
        console.error(`Failed to create test for ${path.basename(componentPath)}:`, error);
      }
    }
  });
}

addTests();
