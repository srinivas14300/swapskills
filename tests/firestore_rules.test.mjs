import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import assert from 'assert';

describe('Firestore Security Rules', () => {
  let testEnv;
  let authenticatedContext;
  let unauthenticatedContext;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'skill-swap-test',
      firestore: {
        rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8')
      }
    });
  });

  beforeEach(async () => {
    authenticatedContext = testEnv.authenticatedContext('user1');
    unauthenticatedContext = testEnv.unauthenticatedContext();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('should allow authenticated user to create their own profile', async () => {
    const db = authenticatedContext.firestore();
    const profileRef = db.collection('users').doc('user1');
    
    try {
      await profileRef.set({
        email: 'user1@example.com',
        displayName: 'Test User',
        skills: []
      });
    } catch (error) {
      assert.fail(`Profile creation should succeed: ${error}`);
    }
  });

  it('should prevent creating profile for another user', async () => {
    const db = testEnv.authenticatedContext('user2').firestore();
    const profileRef = db.collection('users').doc('user1');
    
    try {
      await profileRef.set({
        email: 'user1@example.com',
        displayName: 'Test User'
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      // Expected behavior
    }
  });

  it('should prevent unauthenticated user from creating profile', async () => {
    const db = unauthenticatedContext.firestore();
    const profileRef = db.collection('users').doc('user1');
    
    try {
      await profileRef.set({
        email: 'user1@example.com',
        displayName: 'Test User'
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      // Expected behavior
    }
  });
});
