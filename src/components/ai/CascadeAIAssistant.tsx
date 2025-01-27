import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, User, Bot as Robot, Wand2 as Magic, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CascadeAIService from '../../services/cascadeAIService';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import Navbar from '../layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const CascadeAIAssistant: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message from AI
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I'm Cascade, your versatile AI assistant. I can help with skill development, career advice, technology insights, and much more. What would you like to explore today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Populate suggested prompts using the static method
    setSuggestedPrompts(CascadeAIService.getSkillSwapPrompts());
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponseText = await CascadeAIService.generateChatResponse(currentUser, inputMessage);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Optional: Generate follow-up questions
      const followUpQuestions = CascadeAIService.generateFollowUpQuestions(inputMessage);
      if (followUpQuestions.length > 0) {
        const followUpMessage: ChatMessage = {
          id: `follow-up-${Date.now()}`,
          sender: 'ai',
          text: `Would you like to explore more? ${followUpQuestions.join(' ')}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, followUpMessage]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: "I apologize, but I'm experiencing some technical difficulties. Would you like to try a different question?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    // Optional: Automatically send the prompt
    // handleSendMessage();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.sender === 'ai' 
                  ? 'justify-start' 
                  : 'justify-end'
              }`}
            >
              <div 
                className={`
                  max-w-[70%] p-3 rounded-lg shadow-md 
                  ${message.sender === 'ai' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'}
                `}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-2">
          <RefreshCw className="animate-spin text-blue-500" />
        </div>
      )}

      <div className="p-4 bg-white shadow-lg">
        <div className="mb-2 overflow-x-auto whitespace-nowrap space-x-2">
          {suggestedPrompts.slice(0, 5).map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about skills, careers, or technology..."
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CascadeAIAssistant;
