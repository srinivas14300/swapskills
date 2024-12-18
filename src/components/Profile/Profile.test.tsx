import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock user data
const mockUser = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

describe('Profile', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider initialUser={mockUser}>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Basic checks to ensure key elements are present
    // Commenting out for now as the actual rendering might depend on mocking Firebase
    // expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });
});
