import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
// src/components/Matchmaking/AIMatchmaker.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
// import type { User as FirebaseUser 
import { MatchProfile } from '../../types.tsx';
import aiMatchmaking from '../../services/aiMatching.tsx';
import aiSupport from '../../services/aiSupport.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { fetchAllUsers } from '../../lib/firebaseUtils.tsx';

// Styled components for better UI
const MatchmakerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #f4f4f4;
  border-radius: 8px;
`;

const MatchList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const MatchCard = styled.div<{ matchScore: number }>`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid
    ${(props) => (props.matchScore > 0.8 ? 'green' : props.matchScore > 0.6 ? 'orange' : 'red')};
`;

const SupportChatContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AIMatchmaker: React.FC = () => {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [supportChat, setSupportChat] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!currentUser) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const allUsers = await fetchAllUsers();

      const aiMatches = await aiMatchmaking.findBestMatches(currentUser, allUsers, {
        minMatchScore: 0.6,
        maxMatches: 10,
      });

      setMatches(aiMatches);
      setError(null);
    } catch (err) {
      console.error('Matchmaking Error:', err);
      setError('Failed to fetch matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleSupportChat = async (message: string) => {
    try {
      const response = await aiSupport.getChatbotResponse(message, currentUser, {
        currentSkills: currentUser?.skills,
        seekingSkills: currentUser?.learningGoals,
      });

      setSupportChat((prev) => [...prev, `You: ${message}`, `AI: ${response}`]);
    } catch (err) {
      console.error('Support Chat Error:', err);
      setSupportChat((prev) => [...prev, 'Error: Could not get AI response']);
    }
  };

  const renderMatchCard = (match: MatchProfile) => (
    <MatchCard key={match.user.uid} matchScore={match.matchScore}>
      <h3>{match.user.displayName}</h3>
      <p>Match Score: {(match.matchScore * 100).toFixed(2)}%</p>
      <h4>Recommended Projects:</h4>
      <ul>
        {match.recommendedProjects.map((project, idx) => (
          <li key={idx}>{project}</li>
        ))}
      </ul>
      <button>Request Collaboration</button>
    </MatchCard>
  );

  if (isLoading) return <div>Loading matches...</div>;
  if (error) return <div>{error}</div>;

  return (
    <MatchmakerContainer>
      <h2>AI-Powered Skill Matches</h2>

      {matches.length === 0 ? (
        <p>No matches found. Try expanding your skills or interests!</p>
      ) : (
        <MatchList>{matches.map(renderMatchCard)}</MatchList>
      )}

      <SupportChatContainer>
        <h3>AI Collaboration Assistant</h3>
        <div>
          {supportChat.map((message, idx) => (
            <p key={idx}>{message}</p>
          ))}
        </div>
        <input
          type="text"
          placeholder="Ask about collaboration or skills"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSupportChat((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      </SupportChatContainer>
    </MatchmakerContainer>
  );
};

export default AIMatchmaker;
