import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFirestoreRulesTest() {
  return new Promise((resolve, reject) => {
    const firebaseEmulator = spawn('firebase', ['emulators:start', '--only', 'firestore'], {
      stdio: 'inherit',
      shell: true
    });

    // Wait for emulator to start
    setTimeout(() => {
      const mochaTest = spawn('npm', ['run', 'test:firestore-rules'], {
        stdio: 'inherit',
        shell: true
      });

      mochaTest.on('close', (code) => {
        firebaseEmulator.kill();
        resolve(code);
      });

      mochaTest.on('error', (err) => {
        firebaseEmulator.kill();
        reject(err);
      });
    }, 5000);

    firebaseEmulator.on('error', reject);
  });
}

runFirestoreRulesTest()
  .then(code => {
    console.log(`Firestore Rules Test completed with code ${code}`);
    process.exit(code);
  })
  .catch(err => {
    console.error('Error running Firestore Rules Test:', err);
    process.exit(1);
  });
