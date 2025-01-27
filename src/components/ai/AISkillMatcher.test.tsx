import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AISkillMatcher } from './AISkillMatcher';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock user data
const mockUser = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

describe('AISkillMatcher', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider initialUser={mockUser}>
          <AISkillMatcher />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Basic checks to ensure key elements are present
    expect(screen.getByText(/AI Skill Matcher/i)).toBeInTheDocument();
  });
});
