import React, { useState, Suspense } from 'react';
import { Button } from '@components/ui/Button';
import { Bot, Brain, Code, Globe, MessageCircle, Star } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { addSkill } from '@lib/firebase';
import toast from 'react-hot-toast';
import AIChatbot from '@components/AIChatbot';
import LoadingSpinner from '@components/ui/LoadingSpinner';

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error in AIAssistant:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center h-screen bg-red-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-red-500">Please try refreshing the page or contact support.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AIAssistant() {
  const { currentUser } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const aiSkills = [
    {
      name: 'Code Generation',
      category: 'Programming Languages',
      description:
        'Advanced AI-powered code generation across multiple programming languages and frameworks',
      icon: <Code className="text-blue-500" size={32} />,
      proficiencyLevel: 'Expert',
    },
    {
      name: 'Technical Problem Solving',
      category: 'DevOps',
      description:
        'Debugging, architecture design, and providing comprehensive technical solutions',
      icon: <Brain className="text-purple-500" size={32} />,
      proficiencyLevel: 'Expert',
    },
    {
      name: 'AI Mentorship',
      category: 'Machine Learning',
      description:
        'Guiding users through AI and machine learning concepts, best practices, and implementation strategies',
      icon: <MessageCircle className="text-green-500" size={32} />,
      proficiencyLevel: 'Expert',
    },
    {
      name: 'Multi-language Communication',
      category: 'Language Translation',
      description:
        'Fluent communication and translation across multiple programming and human languages',
      icon: <Globe className="text-red-500" size={32} />,
      proficiencyLevel: 'Expert',
    },
  ];

  const handleSkillSelect = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((skill) => skill !== skillName) : [...prev, skillName]
    );
  };

  const addAISkillToProfile = async () => {
    if (!currentUser) {
      toast.error('Please log in to add AI skills');
      return;
    }

    try {
      const addPromises = selectedSkills.map((skillName) => {
        const skill = aiSkills.find((s) => s.name === skillName);
        if (!skill) return null;

        return addSkill({
          skillName: skill.name,
          category: skill.category,
          description: skill.description,
          userId: currentUser.uid,
          userEmail: currentUser.email || 'ai.assistant@skillswap.com',
          type: 'offer',
          proficiencyLevel: skill.proficiencyLevel,
          isAvailable: true,
        });
      });

      await Promise.all(addPromises.filter((p) => p !== null));

      toast.success(`Added ${selectedSkills.length} AI skills to your profile!`);
      setSelectedSkills([]);
    } catch (error) {
      console.error('Error adding AI skills:', error);
      toast.error('Failed to add AI skills');
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="container mx-auto px-4">
        <ErrorBoundary>
          <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-6">
            <Suspense fallback={<LoadingSpinner />}>
              <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <div className="flex items-center space-x-4">
                    <Bot size={48} className="text-yellow-300" />
                    <div>
                      <h1 className="text-3xl font-bold">Cascade AI Assistant</h1>
                      <p className="text-white/80">Your Intelligent Skill Exchange Companion</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <Star className="mr-2 text-yellow-500" /> AI Skills Catalog
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {aiSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className={`
                          border rounded-lg p-4 cursor-pointer transition-all duration-300
                          ${
                            selectedSkills.includes(skill.name)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300'
                          }
                        `}
                        onClick={() => handleSkillSelect(skill.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {skill.icon}
                            <h3 className="font-semibold text-gray-800">{skill.name}</h3>
                          </div>
                          <span className="text-sm text-gray-500">{skill.proficiencyLevel}</span>
                        </div>
                        <p className="text-sm text-gray-600">{skill.description}</p>
                        <div className="mt-2 text-sm text-gray-500">Category: {skill.category}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end space-x-4">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedSkills([])}
                      disabled={selectedSkills.length === 0}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant="primary"
                      onClick={addAISkillToProfile}
                      disabled={selectedSkills.length === 0}
                    >
                      Add Selected Skills
                    </Button>
                  </div>
                </div>
              </div>
              
              <AIChatbot />
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
