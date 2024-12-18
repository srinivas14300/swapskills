import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Import necessary components directly
import { AuthProvider } from './contexts/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import CompleteProfile from './pages/CompleteProfile.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';

// Performance-aware Lazy Loading Utility
const lazyWithPerf = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>, 
  componentName: string
) => {
  return lazy(() => {
    const start = performance.now();
    return importFn().then(module => {
      const end = performance.now();
      console.log(`${componentName} loaded in ${(end - start).toFixed(2)}ms`);
      return module;
    }).catch(error => {
      console.error(`Failed to load ${componentName}:`, error);
      throw error;
    });
  });
};

// Lazy load pages with performance tracking
const Home = lazyWithPerf(() => import('./pages/Home.tsx'), 'Home');
const PostSkill = lazyWithPerf(() => import('./pages/PostSkill.tsx'), 'PostSkill');
const NeedSkill = lazyWithPerf(() => import('./pages/NeedSkill.tsx'), 'NeedSkill');
const Features = lazyWithPerf(() => import('./pages/Features.tsx'), 'Features');
const Profile = lazyWithPerf(() => import('./pages/Profile.tsx'), 'Profile');
const MySkills = lazyWithPerf(() => import('./pages/MySkills.tsx'), 'MySkills');
const AccountSettings = lazyWithPerf(() => import('./pages/AccountSettings.tsx'), 'AccountSettings');
const AvailableSkills = lazyWithPerf(() => import('./pages/AvailableSkills.tsx'), 'AvailableSkills');
const TechEvents = lazyWithPerf(() => import('./pages/TechEvents.tsx'), 'TechEvents');
const About = lazyWithPerf(() => import('./pages/About'), 'About');
const Contact = lazyWithPerf(() => import('./pages/Contact.tsx'), 'Contact');
const Requests = lazyWithPerf(() => import('./pages/Requests.tsx'), 'Requests');
const Dashboard = lazyWithPerf(() => import('./pages/Dashboard.tsx'), 'Dashboard');
const SearchPage = lazyWithPerf(() => import('./pages/SearchPage.tsx'), 'SearchPage');

// Enhanced Loading Screen
const LoadingScreen = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-lg">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <span className="text-xl text-gray-600 font-semibold">
        Loading Application...
      </span>
    </div>
  </div>
);

// Enhanced Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean, error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something Went Wrong
            </h2>
            <p className="text-gray-700 mb-6">
              An unexpected error occurred in the application.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function LocationLogger() {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log('🔍 Current Location:', location.pathname);
    console.log('🔍 Location State:', location.state);
  }, [location]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <LocationLogger />
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={<LoadingScreen />}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <main className="relative">
                  {/* Background animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20 opacity-50 pointer-events-none"></div>

                  <div className="relative z-10">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/" element={<Home />} />

                      {/* Protected Routes */}
                      <Route 
                        element={
                          <ProtectedRoute>
                            <Outlet />
                          </ProtectedRoute>
                        }
                      >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/complete-profile" element={<CompleteProfile />} />
                        <Route path="/post-skill" element={<PostSkill />} />
                        <Route path="/need-skill" element={<NeedSkill />} />
                        <Route path="/my-skills" element={<MySkills />} />
                        <Route path="/available-skills" element={<AvailableSkills />} />
                        <Route path="/skills/available" element={<AvailableSkills />} />
                        <Route path="/tech-events" element={<TechEvents />} />
                        <Route path="/requests" element={<Requests />} />
                        <Route path="/account-settings" element={<AccountSettings />} />
                        <Route path="/search" element={<SearchPage />} />
                      </Route>

                      {/* Catch-all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    {console.log('🔍 Current Routes:', 
                      Array.from(document.querySelectorAll('Route')).map(route => route.getAttribute('path')).filter(Boolean)
                    )}
                  </div>
                </main>

                <Toaster
                  position="top-right"
                  toastOptions={{
                    success: { duration: 3000 },
                    error: { duration: 5000 },
                  }}
                />
              </div>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
