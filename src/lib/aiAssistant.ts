import OpenAI from 'openai';

// Ensure you have the OPENAI_API_KEY in your .env file
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Predefined context and system prompt
const SYSTEM_PROMPT = `
You are SkillSwap's AI Assistant, an expert in professional skill development and networking. 
Your primary goal is to help users discover, learn, and exchange skills effectively. 
Provide concise, actionable, and encouraging advice.

Key Responsibilities:
- Offer guidance on skill learning strategies
- Suggest relevant learning resources
- Provide insights into professional development
- Help users identify and bridge skill gaps
- Encourage continuous learning and networking

Communication Style:
- Be friendly and supportive
- Use clear, jargon-free language
- Provide specific, practical advice
- Maintain a positive and motivational tone
`;

export async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content || "I'm having trouble generating a response. Could you rephrase your question?";
  } catch (error) {
    console.error('AI Response Generation Error:', error);
    
    // Fallback responses for different error scenarios
    const fallbackResponses = [
      "I'm experiencing some technical difficulties. Let me provide a general skill advice instead.",
      "While I can't generate a specific response right now, I'm always here to help you explore skill learning opportunities.",
      "Apologies for the interruption. Would you like to try a different approach to your skill development question?"
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

// Predefined skill-related prompts for quick suggestions
export const SKILL_SWAP_PROMPTS = [
  "What are the most in-demand tech skills for 2024?",
  "How can I effectively learn a new programming language?",
  "Tips for networking and finding a mentor in my field",
  "Best strategies for skill exchange and continuous learning",
  "How do I identify and develop my professional skills?"
];
