import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import Login from '../pages/Login';

// Mock Firebase Authentication
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

describe('Authentication Flow', () => {
  const renderWithContext = (Component: React.ComponentType) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Component />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('Registration with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = renderWithContext(Register);
    
    fireEvent.change(getByPlaceholderText('Display Name'), { 
      target: { value: 'Test User' } 
    });
    fireEvent.change(getByPlaceholderText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(getByPlaceholderText('Password'), { 
      target: { value: 'StrongPassword123!' } 
    });
    fireEvent.change(getByPlaceholderText('Confirm Password'), { 
      target: { value: 'StrongPassword123!' } 
    });

    fireEvent.click(getByText('Create Account'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), 
        'test@example.com', 
        'StrongPassword123!'
      );
    });
  });

  test('Login with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = renderWithContext(Login);
    
    fireEvent.change(getByPlaceholderText('Email'), { 
      target: { value: 'existing@example.com' } 
    });
    fireEvent.change(getByPlaceholderText('Password'), { 
      target: { value: 'ValidPassword123!' } 
    });

    fireEvent.click(getByText('Sign In'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), 
        'existing@example.com', 
        'ValidPassword123!'
      );
    });
  });

  test('Registration fails with mismatched passwords', async () => {
    const { getByPlaceholderText, getByText } = renderWithContext(Register);
    
    fireEvent.change(getByPlaceholderText('Display Name'), { 
      target: { value: 'Test User' } 
    });
    fireEvent.change(getByPlaceholderText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(getByPlaceholderText('Password'), { 
      target: { value: 'StrongPassword123!' } 
    });
    fireEvent.change(getByPlaceholderText('Confirm Password'), { 
      target: { value: 'DifferentPassword' } 
    });

    fireEvent.click(getByText('Create Account'));

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});
