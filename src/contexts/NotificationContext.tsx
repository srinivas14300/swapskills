import { UserProfile, Skill } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from './AuthContext.tsx';

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Timestamp;
  read?: boolean;
}

// Context type
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: Notification['type']) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

// Separate constants and utility functions
const defaultNotificationState: NotificationContextType = {
  notifications: [],
  addNotification: () => Promise.resolve(),
  markNotificationAsRead: () => Promise.resolve(),
  clearNotifications: () => Promise.resolve(),
};

// Create a separate export for the context
export const NotificationContext = createContext<NotificationContextType>(defaultNotificationState);

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a new notification
  const addNotification = async (message: string, type: Notification['type'] = 'info') => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        message,
        type,
        timestamp: Timestamp.now(),
        read: false,
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    // Implement update logic
  };

  // Clear all notifications
  const clearNotifications = async () => {
    if (!currentUser) return;

    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));

      // In a real app, you'd use a batch write or cloud function
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Listen for notifications in real-time
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Notification
      );

      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const value = {
    notifications,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
