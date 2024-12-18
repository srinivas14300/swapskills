import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast'; // Corrected import statement
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectPath = '/login',
}) => {
  const { currentUser, loading, networkError } = useAuth();
  const location = useLocation();

  // Enhanced logging for debugging
  useEffect(() => {
    console.group('🔒 ProtectedRoute Debug');
    console.log('Current Path:', location.pathname);
    console.log('Current User:', currentUser);
    console.log('Loading State:', loading);
    console.log('Network Error:', networkError);
    console.groupEnd();
  }, [currentUser, loading, location, networkError]);

  // Comprehensive loading state handling
  if (loading) {
    return <LoadingSpinner />;
  }

  // Network error handling
  if (networkError) {
    toast.error('Network error. Please check your connection.', {
      duration: 5000,
      position: 'top-center',
      icon: '🌐'
    });
  }

  // Explicit user authentication check
  if (!currentUser) {
    toast.error('Please log in to access this page', {
      position: 'top-right',
      duration: 3000,
    });
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Profile completeness check with detailed logging
  const isProfileIncomplete = 
    !currentUser?.isProfileComplete || 
    !currentUser?.displayName || 
    !currentUser?.email;

  console.log('🔍 Profile Completeness Check', {
    isProfileComplete: currentUser?.isProfileComplete,
    hasDisplayName: !!currentUser?.displayName,
    hasEmail: !!currentUser?.email,
    currentPath: location.pathname,
    isProfileIncomplete
  });

  if (isProfileIncomplete && location.pathname !== '/complete-profile') {
    console.log('Profile Incomplete Redirect', {
      isProfileComplete: currentUser?.isProfileComplete,
      displayName: !!currentUser?.displayName,
      email: !!currentUser?.email
    });
    
    toast('Please complete your profile', {
      position: 'top-right',
      duration: 3000,
      icon: '👤'
    });
    
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // Render children or Outlet based on usage
  return <>{children}</>;
};

export default ProtectedRoute;
