import { expect } from 'chai';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Security Rules', () => {
  let testEnv;
  let db;
  let authenticatedContext;
  let unauthenticatedContext;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'skill-swap-test',
      firestore: {
        rules: fs.readFileSync(path.resolve(process.cwd(), '../firestore.rules'), 'utf8')
      }
    });
  });

  beforeEach(async () => {
    // Authenticated user context
    authenticatedContext = testEnv.authenticatedContext('user1');
    db = authenticatedContext.firestore();

    // Unauthenticated user context
    unauthenticatedContext = testEnv.unauthenticatedContext();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  after(async () => {
    await testEnv.cleanup();
  });

  describe('User Profile Rules', () => {
    it('should allow authenticated user to create their own profile', async () => {
      const profileRef = db.collection('users').doc('user1');
      await assertSucceeds(profileRef.set({
        email: 'user1@example.com',
        displayName: 'Test User',
        skills: []
      }));
    });

    it('should prevent creating profile for another user', async () => {
      const profileRef = testEnv.authenticatedContext('user2').firestore()
        .collection('users').doc('user1');
      
      await assertFails(profileRef.set({
        email: 'user1@example.com',
        displayName: 'Test User'
      }));
    });

    it('should prevent unauthenticated user from creating profile', async () => {
      const profileRef = unauthenticatedContext.firestore()
        .collection('users').doc('user1');
      
      await assertFails(profileRef.set({
        email: 'user1@example.com',
        displayName: 'Test User'
      }));
    });
  });

  describe('Skills Collection Rules', () => {
    it('should allow authenticated user to create a skill', async () => {
      const skillRef = db.collection('skills').doc();
      await assertSucceeds(skillRef.set({
        name: 'Web Development',
        category: 'Technology',
        description: 'Full stack web development skills',
        creatorId: 'user1'
      }));
    });

    it('should prevent unauthenticated user from creating a skill', async () => {
      const skillRef = unauthenticatedContext.firestore()
        .collection('skills').doc();
      
      await assertFails(skillRef.set({
        name: 'Web Development',
        category: 'Technology',
        description: 'Full stack web development skills'
      }));
    });
  });

  describe('Skill Exchanges Rules', () => {
    it('should allow participants to read their skill exchange', async () => {
      const exchangeRef = db.collection('skillExchanges').doc('exchange1');
      await assertSucceeds(exchangeRef.set({
        requesterId: 'user1',
        responderId: 'user2',
        status: 'pending'
      }));

      const readExchange = await assertSucceeds(exchangeRef.get());
      expect(readExchange.data().requesterId).to.equal('user1');
    });

    it('should prevent non-participants from reading skill exchange', async () => {
      const exchangeRef = testEnv.authenticatedContext('user3').firestore()
        .collection('skillExchanges').doc('exchange1');
      
      await assertFails(exchangeRef.get());
    });
  });

  describe('Messages Collection Rules', () => {
    it('should allow sender and receiver to read messages', async () => {
      const messageRef = db.collection('messages').doc('message1');
      await assertSucceeds(messageRef.set({
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Test message'
      }));

      const readMessage = await assertSucceeds(messageRef.get());
      expect(readMessage.data().senderId).to.equal('user1');
    });

    it('should prevent message modifications', async () => {
      const messageRef = db.collection('messages').doc('message1');
      await messageRef.set({
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Original message'
      });

      await assertFails(messageRef.update({
        content: 'Modified message'
      }));
    });
  });

  describe('Global Security', () => {
    it('should deny access to undefined collections', async () => {
      const unknownRef = db.collection('unknownCollection').doc('doc1');
      await assertFails(unknownRef.set({ data: 'test' }));
    });
  });
});
