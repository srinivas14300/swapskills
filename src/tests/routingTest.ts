import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';

// Mock Components
const HomePage = () => <div data-testid="home-page">Home Page</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;
const ProfilePage = () => <div data-testid="profile-page">Profile Page</div>;
const DashboardPage = () => <div data-testid="dashboard-page">Dashboard Page</div>;

describe('Routing Tests', () => {
  const routes = [
    { 
      path: '/', 
      element: <HomePage /> 
    },
    { 
      path: '/login', 
      element: <LoginPage /> 
    },
    { 
      path: '/profile', 
      element: (
        <AuthProvider>
          <ProfilePage />
        </AuthProvider>
      ) 
    },
    { 
      path: '/dashboard', 
      element: (
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      ) 
    }
  ];

  test('renders home page', () => {
    const router = createMemoryRouter(routes, { 
      initialEntries: ['/'],
      initialIndex: 0
    });

    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders login page', () => {
    const router = createMemoryRouter(routes, { 
      initialEntries: ['/login'],
      initialIndex: 0
    });

    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
