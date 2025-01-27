import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { useAuth } from '../contexts/AuthContext';

export default function CompleteProfile() {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { 
    updateUserProfile, 
    currentUser, 
    loading: authLoading, 
    networkError 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize profile completion check
  const isProfileIncomplete = useMemo(() => {
    console.log('Profile Completeness Check:', {
      currentUser,
      displayName: currentUser?.displayName,
      isProfileComplete: currentUser?.isProfileComplete
    });
    
    return (
      !currentUser?.isProfileComplete || 
      !currentUser?.displayName
    );
  }, [currentUser]);

  // Prevent infinite loops with useCallback and useEffect
  const handleProfileCompletion = useCallback(async () => {
    // Defensive checks
    if (!currentUser) {
      toast.error('No user found. Please log in again.');
      navigate('/login');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Display name is required', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    console.log('Complete Profile User Details:', {
      currentUser: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        isProfileComplete: currentUser.isProfileComplete
      }
    });

    setLoading(true);
    try {
      console.log('Attempting to update profile with:', { 
        displayName, 
        isProfileComplete: true,
        currentUser: currentUser.uid 
      });

      await updateUserProfile({ 
        displayName, 
        isProfileComplete: true 
      });

      console.log('Profile update successful');

      toast.success('Profile updated successfully!', {
        duration: 3000,
        position: 'bottom-right'
      });

      // Explicit navigation with state
      navigate('/dashboard', { 
        replace: true,
        state: { from: location.pathname }
      });
    } catch (error) {
      console.error('Profile Update Error:', error);
      toast.error('Failed to update profile. Please try again.', {
        duration: 5000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  }, [displayName, updateUserProfile, navigate, location, currentUser]);

  // Comprehensive navigation and authentication check
  useEffect(() => {
    console.group('CompleteProfile Debug');
    console.log('Current User:', currentUser);
    console.log('Auth Loading:', authLoading);
    console.log('Location State:', location.state);
    console.log('Is Profile Incomplete:', isProfileIncomplete);

    // Prevent unnecessary redirects
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    // Redirect if no user
    if (!currentUser) {
      console.log('No current user, redirecting to login');
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
      return;
    }

    // Redirect if profile is already complete
    if (!isProfileIncomplete) {
      console.log('Profile already complete, redirecting to dashboard');
      navigate('/dashboard', { 
        replace: true,
        state: { from: location.pathname }
      });
      return;
    }

    // Pre-fill display name if available
    if (currentUser.displayName && !displayName) {
      setDisplayName(currentUser.displayName);
    }

    console.groupEnd();
  }, [
    currentUser, 
    authLoading, 
    navigate, 
    location, 
    displayName, 
    isProfileIncomplete
  ]);

  // Network error handling
  useEffect(() => {
    if (networkError) {
      toast.error(networkError, {
        duration: 5000,
        position: 'top-center',
        icon: '🌐'
      });
    }
  }, [networkError]);

  // Prevent render if loading or no user
  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Prevent rendering if profile is complete
  if (!isProfileIncomplete) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Just one more step to get started!
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={(e) => {
            e.preventDefault();
            handleProfileCompletion();
          }}
        >
          <div className="space-y-4">
            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="How would you like to be called?"
              autoComplete="name"
            />
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={loading}
            >
              Complete Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
