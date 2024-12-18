import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';

interface UserProfileData {
  skills?: string[];
  interests?: string[];
  bio?: string;
}

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        console.log('No authenticated user');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile for user:', currentUser.uid);

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserProfileData;
          console.log('Fetched Profile Data:', data);

          setProfileData({
            skills: Array.isArray(data.skills) ? data.skills : [],
            interests: Array.isArray(data.interests) ? data.interests : [],
            bio: data.bio || '',
          });
        } else {
          console.log('No profile document found');
          setProfileData(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profileData) {
    return <div>No profile data available. Complete your profile!</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div>
        <h3>Skills</h3>
        <ul>{profileData.skills?.map((skill, index) => <li key={index}>{skill}</li>)}</ul>
      </div>
      <div>
        <h3>Interests</h3>
        <ul>{profileData.interests?.map((interest, index) => <li key={index}>{interest}</li>)}</ul>
      </div>
      {profileData.bio && (
        <div>
          <h3>Bio</h3>
          <p>{profileData.bio}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
