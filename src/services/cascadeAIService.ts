import { OpenAI } from 'openai';
import { UserProfile, Skill, AIMatchingProfile } from '../types';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export class CascadeAIService {
  // Local AI Response Database
  private static LOCAL_RESPONSES = {
    greeting: [
      "Hello! I'm here to help you with skill-related questions.",
      "Welcome! How can I assist you in your skill development journey today?",
      "Hi there! Ready to explore new skills and opportunities?"
    ],
    skillAdvice: [
      "Developing new skills is key to personal and professional growth.",
      "Continuous learning is the best way to stay competitive in today's job market.",
      "Every skill you learn opens up new opportunities and perspectives."
    ],
    learningTips: [
      "Break down complex skills into smaller, manageable learning chunks.",
      "Practice consistently and seek feedback to improve faster.",
      "Combine online resources, courses, and hands-on practice for effective learning."
    ],
    networkingTips: [
      "Networking is about building genuine, mutually beneficial relationships.",
      "Don't just collect contacts, focus on creating meaningful connections.",
      "Attend industry events, join professional groups, and engage actively online."
    ],
    careerGrowth: [
      "Identify your strengths and areas for improvement to guide your career development.",
      "Set clear, achievable goals and create a roadmap to reach them.",
      "Be open to feedback and view challenges as opportunities for growth."
    ]
  };

  // Method to generate a contextual local response
  private static generateLocalResponse(context?: keyof typeof this.LOCAL_RESPONSES): string {
    const responses = context ? this.LOCAL_RESPONSES[context] : 
      Object.values(this.LOCAL_RESPONSES).flat();
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Existing OpenAI configuration
  private static openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Advanced Skill Recommendation Engine
  static async generatePersonalizedSkillRecommendations(
    userProfile: UserProfile
  ): Promise<Skill[]> {
    try {
      // Check if we have cached recommendations
      const cachedRecommendations = await this.getCachedSkillRecommendations(userProfile.uid);
      if (cachedRecommendations.length > 0) {
        return cachedRecommendations;
      }

      const recommendations = await this.generateOpenAIRecommendations(userProfile);

      // Save recommendations to user's profile
      await this.saveSkillRecommendations(userProfile.uid, recommendations);

      return recommendations;
    } catch (error: any) {
      console.error('AI Skill Recommendation Error:', error);
      return [];
    }
  }

  private static async generateOpenAIRecommendations(
    userProfile: UserProfile
  ): Promise<Skill[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a career development AI that generates personalized skill recommendations based on a user's profile."
          },
          {
            role: "user",
            content: `Generate 5 skill recommendations for a professional with the following profile:
              - Name: ${userProfile.displayName}
              - Email: ${userProfile.email}
              
              Provide recommendations in this JSON format:
              [
                {
                  "title": "Skill Title",
                  "name": "Skill Name",
                  "description": "Skill description",
                  "category": "Skill Category",
                  "proficiencyLevel": "Beginner/Intermediate/Expert"
                }
              ]`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300
      });

      const recommendationsText = response.choices[0].message.content;
      const recommendations: Skill[] = JSON.parse(recommendationsText).map(skill => ({
        ...skill,
        userId: userProfile.uid
      }));

      return recommendations;
    } catch (error) {
      console.error('OpenAI Rate Limit Exceeded. Falling back to default recommendations.', error);
      return this.getDefaultSkillRecommendations(userProfile);
    }
  }

  // Fallback method to get cached or default recommendations
  private static async getCachedSkillRecommendations(
    userId: string
  ): Promise<Skill[]> {
    try {
      const recommendationsRef = collection(db, 'skill_recommendations');
      const recentRecsQuery = query(
        recommendationsRef, 
        where('userId', '==', userId)
      );
      const recentRecs = await getDocs(recentRecsQuery);

      // Return cached recommendations if they exist and are less than 7 days old
      if (!recentRecs.empty) {
        const latestRec = recentRecs.docs[0];
        const data = latestRec.data();
        const generatedAt = data.generatedAt.toDate();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (generatedAt > sevenDaysAgo) {
          return data.recommendations;
        }
      }

      return [];
    } catch (error) {
      console.error('Error retrieving cached recommendations:', error);
      return [];
    }
  }

  // Provide default skill recommendations when AI service is unavailable
  private static getDefaultSkillRecommendations(
    userProfile: UserProfile
  ): Skill[] {
    const defaultSkills: Skill[] = [
      {
        title: "Communication Skills",
        name: "Communication Skills",
        category: "Soft Skills",
        proficiencyLevel: "Beginner",
        description: "Essential for professional growth across all domains",
        userId: userProfile.uid
      },
      {
        title: "Digital Marketing",
        name: "Digital Marketing",
        category: "Business",
        proficiencyLevel: "Beginner",
        description: "Valuable skill for understanding online business strategies",
        userId: userProfile.uid
      },
      {
        title: "Data Analysis",
        name: "Data Analysis",
        category: "Technical",
        proficiencyLevel: "Beginner",
        description: "Crucial for making data-driven decisions in any field",
        userId: userProfile.uid
      },
      {
        title: "Project Management",
        name: "Project Management",
        category: "Professional Skills",
        proficiencyLevel: "Intermediate",
        description: "Helps in organizing and leading complex projects",
        userId: userProfile.uid
      },
      {
        title: "Emotional Intelligence",
        name: "Emotional Intelligence",
        category: "Soft Skills",
        proficiencyLevel: "Beginner",
        description: "Improves interpersonal relationships and leadership",
        userId: userProfile.uid
      }
    ];

    // Save default recommendations
    this.saveSkillRecommendations(userProfile.uid, defaultSkills);

    return defaultSkills;
  }

  // Save AI-generated skill recommendations
  private static async saveSkillRecommendations(
    userId: string, 
    recommendations: Skill[]
  ): Promise<void> {
    try {
      const recommendationsRef = collection(db, 'skill_recommendations');
      
      // Remove any existing recommendations for this user
      const existingRecsQuery = query(
        recommendationsRef, 
        where('userId', '==', userId)
      );
      const existingRecs = await getDocs(existingRecsQuery);
      existingRecs.forEach(async (doc) => {
        await doc.ref.delete();
      });

      // Add new recommendations
      await addDoc(recommendationsRef, {
        userId,
        recommendations,
        generatedAt: new Date(),
        status: 'active'
      });
    } catch (error) {
      console.error('Error saving skill recommendations:', error);
    }
  }

  // AI-Powered Skill Matching
  static async findOptimalSkillExchangePartners(
    userProfile: UserProfile
  ): Promise<UserProfile[]> {
    try {
      const prompt = `
        Analyze the following user profile and find optimal skill exchange partners:
        - User Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'None'}
        - User Interests: ${userProfile.interests?.join(', ') || 'None'}
        - Learning Goals: ${userProfile.learningGoals?.join(', ') || 'None'}

        Criteria for matching:
        1. Complementary skill sets
        2. Mutual learning potential
        3. Similar communication preferences
        4. Geographical proximity (if available)

        Return top 5 potential skill exchange partners as a JSON array with match scores.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: prompt }]
      });

      const matchedProfiles = JSON.parse(
        response.choices[0].message.content || '[]'
      ) as AIMatchingProfile[];

      // Convert AI recommendations to actual user profiles
      const partnerProfiles = await this.convertMatchesToUserProfiles(matchedProfiles);

      return partnerProfiles;
    } catch (error) {
      console.error('AI Skill Exchange Matching Error:', error);
      return [];
    }
  }

  // Convert AI Matching Profiles to User Profiles
  private static async convertMatchesToUserProfiles(
    matches: AIMatchingProfile[]
  ): Promise<UserProfile[]> {
    const profiles: UserProfile[] = [];

    for (const match of matches) {
      const matchQuery = query(
        collection(db, 'users'),
        where('skills', 'array-contains-any', match.skills || [])
      );

      const matchSnapshot = await getDocs(matchQuery);
      
      matchSnapshot.forEach(doc => {
        profiles.push({
          uid: doc.id,
          ...doc.data()
        } as UserProfile);
      });
    }

    return profiles;
  }

  static async generateChatResponse(
    user: any, 
    userMessage: string
  ): Promise<string> {
    try {
      // Validate API key
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        console.error('OpenAI API Key is missing');
        return this.generateLocalResponse();
      }

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant for SkillSwap, providing professional and concise advice.`
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
          top_p: 0.9
        });

        return response.choices[0]?.message?.content?.trim() || 
          this.generateLocalResponse();
      } catch (apiError: any) {
        console.error('OpenAI API Error:', apiError);
        
        // Specific error handling
        if (apiError.response?.status === 429 || apiError.response?.status === 500) {
          console.warn('API Quota or Server Error. Switching to local responses.');
          return this.generateLocalResponse();
        }

        throw apiError;
      }
    } catch (error: any) {
      console.error('Unexpected Error in Chat Response:', error);
      return this.generateLocalResponse();
    }
  }

  // Expanded skill-related and general prompts
  static getSkillSwapPrompts(): string[] {
    return [
      // Skill Development
      "What are the most in-demand tech skills?",
      "How can I learn a new programming language?",
      "Career transition strategies",
      
      // Networking
      "Tips for professional networking",
      "How to find a mentor in my industry",
      
      // Personal Development
      "Strategies for continuous learning",
      "How to improve my soft skills",
      
      // Technology Trends
      "Latest trends in artificial intelligence",
      "Future of remote work",
      
      // General Knowledge
      "Explain quantum computing",
      "Impact of blockchain technology",
      "Career advice for young professionals"
    ];
  }

  // Optional: Generate contextual follow-up questions
  static generateFollowUpQuestions(originalQuery: string): string[] {
    const topics = [
      "skill development",
      "career growth", 
      "professional networking",
      "technology trends",
      "learning strategies"
    ];

    return topics
      .filter(() => Math.random() > 0.5) // Randomly select some topics
      .map(topic => `Want to dive deeper into ${topic}?`);
  }

  // Other existing methods remain the same...
}

export default CascadeAIService;
