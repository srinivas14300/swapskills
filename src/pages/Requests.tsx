import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect, memo } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Button } from '../components/ui/Button.tsx';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.tsx';

interface SkillRequest {
  id: string;
  skillName: string;
  description: string;
  userEmail: string;
  createdAt: { seconds: number; nanoseconds: number };
  targetProficiencyLevel: string;
}

export const Requests: React.FC = memo(() => {
  const [requests, setRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSkillRequests = async () => {
      try {
        const db = getFirestore();
        const requestsRef = collection(db, 'skills');
        const q = query(requestsRef, where('type', '==', 'request'));

        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as SkillRequest
        );

        setRequests(fetchedRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching skill requests:', error);
        toast.error('Failed to load skill requests. Please try again.');
        setLoading(false);
      }
    };

    fetchSkillRequests();
  }, []);

  const handleRequestSkill = async (request: SkillRequest) => {
    if (!user) {
      toast.error('Please log in to connect with skill requesters');
      return;
    }

    try {
      const db = getFirestore();
      const connectionsRef = collection(db, 'connections');
      await addDoc(connectionsRef, {
        skillRequestId: request.id,
        requesterEmail: request.userEmail,
        helperEmail: user.email,
        timestamp: new Date(),
      });
      toast.success(`You've expressed interest in helping with ${request.skillName}`);
    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error('Failed to connect with the requester');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-10">Skill Exchange Requests</h1>

        {loading ? (
          <div className="text-center text-white py-8">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-white py-8">
            No skill requests at the moment. Be the first to post a request!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-blue-600 mb-3">{request.skillName}</h2>
                  <p className="text-gray-600 mb-4">{request.description}</p>
                  <span className="text-sm text-gray-500">
                    Posted on: {new Date(request.createdAt.seconds * 1000).toLocaleDateString()}
                  </span>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      Proficiency Level: {request.targetProficiencyLevel}
                    </span>
                    <Button onClick={() => handleRequestSkill(request)} className="ml-2">
                      Help Out
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default Requests;
