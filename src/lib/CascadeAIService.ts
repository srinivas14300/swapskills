import { getAuth } from 'firebase/auth';
import { doc, getFirestore, getDoc } from 'firebase/firestore';

export interface AIMessage {
  role: 'user' | 'ai';
  content: string;
}

export class CascadeAIService {
  private static instance: CascadeAIService;
  private firestore = getFirestore();

  private constructor() {}

  public static getInstance(): CascadeAIService {
    if (!this.instance) {
      this.instance = new CascadeAIService();
    }
    return this.instance;
  }

  public async generateChatResponse(messages: AIMessage[]): Promise<string> {
    try {
      // First, check user's AI interaction permissions
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Optional: Check user's AI interaction settings
      const userDocRef = doc(this.firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      const userData = userDoc.data();
      const aiInteractionEnabled = userData?.aiInteractionEnabled ?? true;

      if (!aiInteractionEnabled) {
        return "AI interactions are currently disabled for your account.";
      }

      // Fallback local AI response generation
      const lastUserMessage = messages[messages.length - 1].content;
      return this.generateLocalResponse(lastUserMessage);

    } catch (error) {
      console.error('AI Response Generation Error:', error);
      return this.handleErrorResponse(error);
    }
  }

  private generateLocalResponse(userMessage: string): string {
    const lowercaseMessage = userMessage.toLowerCase();
    const responseMap: { [key: string]: string } = {
      'hello': "Hi there! I'm your SkillSwap AI Assistant. How can I help you develop your skills today?",
      'skills': "SkillSwap is all about helping you discover, learn, and exchange skills. What specific skills are you interested in?",
      'programming': "Programming is a fantastic skill to develop! Would you like recommendations on learning languages or frameworks?",
      'mentor': "Finding a mentor can accelerate your skill development. SkillSwap can help connect you with experienced professionals.",
      'network': "Professional networking is crucial for skill growth. I can provide tips on effective networking strategies.",
    };

    // Find a matching response or provide a generic one
    const matchedResponse = Object.entries(responseMap).find(([keyword]) => 
      lowercaseMessage.includes(keyword)
    );

    return matchedResponse 
      ? matchedResponse[1] 
      : "Interesting query! While I don't have a specific response, I'm here to support your skill development journey.";
  }

  private handleErrorResponse(error: unknown): string {
    const errorResponses = [
      "I'm experiencing some technical difficulties. Would you like to try a different approach?",
      "Apologies, but I'm unable to generate a response right now. Let's try again later.",
      "It seems our AI is taking a short break. Feel free to ask your question again."
    ];

    console.error('Detailed AI Service Error:', error);
    return errorResponses[Math.floor(Math.random() * errorResponses.length)];
  }

  // Predefined skill-related prompts
  public getSkillSwapPrompts(): string[] {
    return [
      "What are the most in-demand tech skills?",
      "How can I learn a new programming language?",
      "Tips for finding a professional mentor",
      "Strategies for continuous skill development",
      "How to network effectively in my industry"
    ];
  }
}
