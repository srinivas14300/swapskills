import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';

interface Skill {
  id: string;
  name: string;
  category: string;
}

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchSkills = async () => {
      if (!currentUser) {
        console.log('No authenticated user, skipping skill fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting to fetch skills for user:', currentUser.uid);

        const skillsRef = collection(db, 'skills');
        const skillsQuery = query(
          skillsRef,
          limit(50) // Limit to prevent large data fetches
        );

        const querySnapshot = await getDocs(skillsQuery);

        const fetchedSkills: Skill[] = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Skill
        );

        console.log('Fetched Skills:', fetchedSkills);

        setSkills(fetchedSkills);
        setLoading(false);
      } catch (err) {
        console.error('Comprehensive Skill Fetch Error:', err);
        toast.error('Failed to load skills. Check console for details.');

        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchSkills();
  }, [currentUser]);

  return { skills, loading, error };
};
