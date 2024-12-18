import { UserProfile, Skill } from '../types';

export interface AIMatchResponse {
  matchedUsers: {
    userId: string;
    matchedSkills: string[];
    confidence: number;
  }[];
  matchedSkills: string[];
  confidence: number;
}

export const aiService = {
  findSkillMatches: async (request: {
    userId: string;
    skills: string[];
    interests: string[];
  }): Promise<AIMatchResponse> => {
    // Simulate AI matching logic
    console.log('AI Matching Request:', request);

    // Mock implementation with some basic logic
    const allPossibleMatches = [
      {
        userId: 'user123',
        matchedSkills: ['React', 'Web Development'],
        confidence: 0.85
      },
      {
        userId: 'user456',
        matchedSkills: ['Machine Learning', 'Python'],
        confidence: 0.75
      }
    ];

    // Filter matches based on user's skills and interests
    const matchedUsers = allPossibleMatches.filter(match => 
      match.matchedSkills.some(skill => 
        request.skills.includes(skill) || request.interests.includes(skill)
      )
    );

    return {
      matchedUsers,
      matchedSkills: matchedUsers.flatMap(match => match.matchedSkills),
      confidence: matchedUsers.reduce((acc, match) => acc + match.confidence, 0) / matchedUsers.length || 0
    };
  },

  generatePersonalizedSkillRecommendations: async (user: UserProfile): Promise<Skill[]> => {
    // Simulate personalized skill recommendations
    const allRecommendations: Skill[] = [
      {
        name: 'React Advanced Techniques',
        description: 'Deep dive into advanced React patterns and performance optimization',
        category: 'Web Development'
      },
      {
        name: 'Machine Learning Fundamentals',
        description: 'Introduction to core machine learning concepts and algorithms',
        category: 'Data Science'
      },
      {
        name: 'Cloud Infrastructure',
        description: 'Learn about cloud computing and infrastructure management',
        category: 'DevOps'
      },
      {
        name: 'TypeScript Mastery',
        description: 'Advanced TypeScript techniques for robust type-safe applications',
        category: 'Web Development'
      },
      {
        name: 'Data Visualization',
        description: 'Create compelling data visualizations using D3.js and React',
        category: 'Data Science'
      }
    ];

    // Filter recommendations based on user's existing skills and interests
    return allRecommendations.filter(rec => 
      !user.skills?.includes(rec.name) && 
      !user.interests?.includes(rec.category)
    ).slice(0, 3);  // Limit to 3 recommendations
  }
};
