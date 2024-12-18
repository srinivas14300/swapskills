import React from 'react';
import { render } from '@testing-library/react';
import AIMatchmaker from './AIMatchmaker';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('AIMatchmaker', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AIMatchmaker />
        </AuthProvider>
      </BrowserRouter>
    );
    // Add more specific tests based on component functionality
  });
});
