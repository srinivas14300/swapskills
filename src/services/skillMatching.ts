import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Skill {
  id?: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface UserProfile {
  uid: string;
  skills: Skill[];
  interests: string[];
  location?: string;
}

export class SkillMatchingService {
  // Find potential skill exchange partners
  static async findMatchingUsers(currentUser: UserProfile): Promise<UserProfile[]> {
    try {
      // Query users with complementary skills
      const usersRef = collection(db, 'users');
      const matchingUsersQuery = query(
        usersRef,
        where('skills', 'array-contains-any', currentUser.interests || [])
      );

      const matchingUsersSnapshot = await getDocs(matchingUsersQuery);

      return matchingUsersSnapshot.docs
        .map(
          (doc) =>
            ({
              uid: doc.id,
              ...doc.data(),
            }) as UserProfile
        )
        .filter((user) => user.uid !== currentUser.uid);
    } catch (error) {
      console.error('Error finding matching users:', error);
      return [];
    }
  }

  // Calculate skill compatibility score
  static calculateCompatibilityScore(user1: UserProfile, user2: UserProfile): number {
    const commonInterests = user1.interests.filter((interest) => 
      user2.interests.includes(interest)
    );

    const commonSkills = user1.skills.filter((skill) => 
      user2.skills.some((userSkill) => userSkill.name === skill.name)
    );

    // Weighted scoring
    const interestWeight = 0.4;
    const skillWeight = 0.6;

    return (
      (commonInterests.length / Math.max(user1.interests.length, user2.interests.length) * interestWeight) +
      (commonSkills.length / Math.max(user1.skills.length, user2.skills.length) * skillWeight)
    );
  }

  // Recommend skill exchange opportunities
  static recommendSkillExchanges(user: UserProfile, matchingUsers: UserProfile[]): UserProfile[] {
    return matchingUsers
      .filter((matchUser) => this.calculateCompatibilityScore(user, matchUser) > 0.5)
      .sort((a, b) => this.calculateCompatibilityScore(user, b) - this.calculateCompatibilityScore(user, a))
      .slice(0, 5); // Top 5 recommendations
  }

  // Create a skill exchange match
  static async createSkillMatch(user1: UserProfile, user2: UserProfile): Promise<string | null> {
    try {
      const matchRef = await addDoc(collection(db, 'matches'), {
        participants: [user1.uid, user2.uid],
        skills: {
          [user1.uid]: user1.skills,
          [user2.uid]: user2.skills,
        },
        status: 'pending',
        createdAt: new Date(),
        compatibility: this.calculateCompatibilityScore(user1, user2),
      });

      return matchRef.id;
    } catch (error) {
      console.error('Error creating skill match:', error);
      return null;
    }
  }

  // Get user's current matches
  static async getUserMatches(userId: string) {
    try {
      const matchesRef = collection(db, 'matches');
      const userMatchesQuery = query(matchesRef, where('participants', 'array-contains', userId));

      const matchesSnapshot = await getDocs(userMatchesQuery);

      return matchesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching user matches:', error);
      return [];
    }
  }
}

// Export for use in components
export default SkillMatchingService;
