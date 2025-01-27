import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState } from 'react';
import { aiService, AIMatchResponse } from '../../services/aiService.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { Button } from '../ui/Button.tsx';
import { Sparkles, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const AISkillMatcher: React.FC = () => {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<AIMatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const findAIMatches = async () => {
    if (!currentUser) {
      toast.error('Please log in to use AI Matching');
      return;
    }

    // Check if user has skills
    if (!currentUser.skills || currentUser.skills.length === 0) {
      toast.error('Add some skills first to find matches', {
        icon: <PlusCircle className="text-blue-500" />,
      });
      navigate('/profile');
      return;
    }

    setIsLoading(true);
    try {
      const matchRequest = {
        userId: currentUser.uid,
        skills: currentUser.skills || [],
        interests: currentUser.interests || [],
      };

      const aiMatches = await aiService.findSkillMatches(matchRequest);
      setMatches(aiMatches);

      if (aiMatches.matchedUsers.length === 0) {
        toast.info('No matches found. Try expanding your skills!', {
          icon: <Sparkles className="text-purple-500" />,
        });
      } else {
        toast.success('AI Matches Generated Successfully!');
      }
    } catch (error) {
      console.error('AI Matching Failed:', error);
      toast.error('Failed to generate AI matches');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-skill-matcher p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Sparkles className="mr-2 text-yellow-300" />
          AI Skill Matcher
        </h2>
        <Button
          onClick={findAIMatches}
          disabled={isLoading || !currentUser}
          className="bg-white text-purple-600 hover:bg-purple-100"
        >
          {isLoading ? 'Matching...' : 'Find Matches'}
        </Button>
      </div>

      {!matches && (
        <div className="bg-white/20 text-white p-4 rounded-lg text-center">
          <p>Click "Find Matches" to discover potential skill connections!</p>
          <p className="text-sm mt-2 opacity-75">
            We'll help you find users with complementary skills.
          </p>
        </div>
      )}

      {matches && matches.matchedUsers.length === 0 && (
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-purple-700 font-semibold">No matches found at the moment</p>
          <p className="text-gray-600 mt-2">Try adding more skills or broadening your interests</p>
          <Button
            onClick={() => navigate('/profile')}
            className="mt-4 bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Edit Profile
          </Button>
        </div>
      )}

      {matches && matches.matchedUsers.length > 0 && (
        <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-xl font-semibold mb-3 text-purple-700">Your Skill Matches</h3>
          {matches.matchedUsers.map((match, index) => (
            <div
              key={match.userId}
              className="mb-2 p-2 bg-purple-50 rounded flex justify-between items-center hover:bg-purple-100 transition"
            >
              <div>
                <span className="font-medium text-purple-800">Match {index + 1}</span>
                <span className="ml-2 text-purple-600 font-semibold">
                  Match Score: {(match.matchScore * 100).toFixed(2)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Common Skills: {match.commonSkills.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
