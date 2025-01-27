import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { MemoryRouter } from 'react-router-dom';

// Mock the useAuth hook
jest.mock('../hooks/useAuth.tsx', () => ({
  useAuth: () => ({
    currentUser: null,
    loading: false
  })
}));

describe('ProtectedRoute', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    // Add more specific tests based on component functionality
  });
});
