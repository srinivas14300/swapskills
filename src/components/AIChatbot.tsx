import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Robot, Zap, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { generateAIResponse, SKILL_SWAP_PROMPTS } from '@lib/aiAssistant';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const AIChatbot: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hi there! I'm SkillSwap's AI Assistant. I'm here to help you discover, learn, and exchange skills. What can I help you with today?",
      sender: 'ai'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newUserMessage: Message = {
      id: messages.length,
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponseText = await generateAIResponse(input);
      
      const aiResponse: Message = {
        id: messages.length + 1,
        text: aiResponseText,
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Response Error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      const fallbackResponse: Message = {
        id: messages.length + 1,
        text: "I'm experiencing some technical difficulties. Would you like to try a different question?",
        sender: 'ai'
      };

      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white flex items-center">
        <Robot className="mr-3" />
        <h2 className="text-lg font-bold">SkillSwap AI Assistant</h2>
        <Sparkles className="ml-auto text-yellow-300" />
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map(message => (
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
                  max-w-[80%] p-3 rounded-lg 
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
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg flex items-center">
              <Zap className="mr-2 animate-pulse" size={16} />
              Typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 flex space-x-2">
        <div className="flex-grow relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about skill swapping..."
            className="w-full p-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button 
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>

      <div className="p-2 bg-gray-50 text-xs text-center">
        {SKILL_SWAP_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => setInput(prompt)}
            className="m-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-xs"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIChatbot;
