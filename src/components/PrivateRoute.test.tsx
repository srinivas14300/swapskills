import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { AuthProvider } from '../contexts/AuthContext';

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

describe('PrivateRoute', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider initialUser={mockUser}>
          <PrivateRoute>
            <div>Test Child Component</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );
  });
});
