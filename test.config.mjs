import { register } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Resolve the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure TypeScript loader
register('ts-node/esm', import.meta.url);

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-node/esm'
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
