import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: jest.fn()
}));

// Import the mocked hook
import { useAuth } from '../hooks/useAuth';

// Mock Page Components
const HomePage = () => <div data-testid="home-page">Home Page</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;
const ProfilePage = () => <div data-testid="profile-page">Profile Page</div>;
const DashboardPage = () => <div data-testid="dashboard-page">Dashboard Page</div>;

// Mock Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <LoginPage />;
};

describe('Routing Configuration', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    (useAuth as jest.Mock).mockReset();
  });

  test('Renders Home Page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('Renders Login Page', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('Protected Route Redirects Unauthenticated Users', () => {
    // Mock unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login page when not authenticated
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('Authenticated Users Can Access Protected Routes', () => {
    // Mock authenticated state
    const mockUser = { 
      uid: 'test-user-id', 
      email: 'test@example.com' 
    };

    (useAuth as jest.Mock).mockReturnValue({
      currentUser: mockUser,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider>
          <Routes>
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });
});
