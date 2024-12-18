import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Lock, User, Mail, Bell, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AccountSettings: React.FC = () => {
  const { currentUser, loading, updateUserProfile, updateUserPassword } = useAuth();

  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    skillRecommendations: true,
    connectionRequests: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showSkillsToConnections: true,
    allowRecommendations: true,
  });

  // Memoized loading state to prevent flickering
  const isLoading = useMemo(() => {
    console.log('Loading state:', loading);
    return loading;
  }, [loading]);

  useEffect(() => {
    console.log('AccountSettings Component - User:', currentUser);
    console.log('AccountSettings Component - Loading:', isLoading);
  }, [currentUser, isLoading]);

  // Comprehensive loading and authentication check
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
          <p className="text-xl text-gray-700">Loading your account settings...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-xl text-gray-700">Please log in to access account settings</p>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="mt-4 bg-blue-500 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        displayName: profileData.displayName,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Add password validation
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Add complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error('Password must include uppercase, lowercase, number, and special character');
      return;
    }

    try {
      // TODO: Implement actual password update logic with re-authentication
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password updated successfully!');
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      toast.error('Failed to update password');
      console.error(error);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // TODO: Implement actual notification preference update in backend
  };

  const handlePrivacySettingToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof privacySettings],
    }));
    // TODO: Implement actual privacy setting update in backend
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      {/* Profile Information Section */}
      <section className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <User className="mr-2" /> Profile Information
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block mb-2">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <Button type="submit">Update Profile</Button>
        </form>
      </section>

      {/* Email Update Section */}
      <section className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Mail className="mr-2" /> Email Settings
        </h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          {/* TODO: Implement email update logic */}
        </form>
      </section>

      {/* Password Update Section */}
      <section className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lock className="mr-2" /> Change Password
        </h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
              }
              className="w-full border rounded p-2"
            />
          </div>
          <Button type="submit">Update Password</Button>
        </form>
      </section>

      {/* Notification Preferences */}
      <section className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Bell className="mr-2" /> Notification Preferences
        </h2>
        <div className="space-y-4">
          {Object.entries(notificationPreferences).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    handleNotificationToggle(key as keyof typeof notificationPreferences)
                  }
                />
                <span className="slider round"></span>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2" /> Privacy Settings
        </h2>
        <div className="space-y-4">
          {Object.entries(privacySettings).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handlePrivacySettingToggle(key as keyof typeof privacySettings)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AccountSettings;
