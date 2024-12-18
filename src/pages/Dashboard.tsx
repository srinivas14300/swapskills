import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { AISkillMatcher } from '../components/ai/AISkillMatcher.tsx';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button.tsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Activity, Zap, TrendingUp, Star, Clock, RefreshCw, MessageCircle, Users, Award, Sparkles, Loader2 } from 'lucide-react';
import { getFirestore, query, collection, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';

const DashboardAIRecommendations: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [aiRecommendations, setAIRecommendations] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      try {
        // Simulate AI recommendations if no real service is available
        const mockRecommendations: Skill[] = [
          {
            name: 'React Advanced Techniques',
            description: 'Deep dive into advanced React patterns and performance optimization',
            category: 'Web Development'
          },
          {
            name: 'Machine Learning Fundamentals',
            description: 'Introduction to core machine learning concepts and algorithms',
            category: 'Data Science'
          },
          {
            name: 'Cloud Infrastructure',
            description: 'Learn about cloud computing and infrastructure management',
            category: 'DevOps'
          }
        ];

        // Only show recommendations if user has some skills or interests
        if (user.skills && user.skills.length > 0) {
          setAIRecommendations(mockRecommendations);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch AI recommendations:', error);
        toast.error('Failed to fetch AI recommendations');
        setIsLoading(false);
      }
    };

    fetchAIRecommendations();
  }, [user]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center mb-4">
        <Sparkles className="mr-2 text-yellow-500" />
        <h2 className="text-xl font-semibold">AI Recommendations</h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {aiRecommendations.length > 0 ? (
            aiRecommendations.map((skill, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center border-b pb-2 last:border-b-0"
              >
                <div>
                  <h3 className="font-medium">{skill.name}</h3>
                  <p className="text-sm text-gray-500">{skill.description}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Add skill to user's learning path
                    toast.success(`Added ${skill.name} to your learning path`);
                  }}
                >
                  Add to Learning Path
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              No AI recommendations available. Complete your profile for better suggestions!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentUser, loading, networkError } = useAuth();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [userMetrics, setUserMetrics] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Detailed authentication logging
        console.group('Dashboard Initialization');
        console.log('Current User:', currentUser);
        console.log('Auth Context:', {
          loading,
          networkError,
          currentUser: currentUser ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            isProfileComplete: currentUser.isProfileComplete
          } : null
        });

        // Ensure user is authenticated
        if (!currentUser) {
          console.error('No current user found in Dashboard');
          toast.error('Please log in to view your dashboard', { 
            duration: 4000 
          });
          navigate('/login');
          console.groupEnd();
          return;
        }

        // Check profile completeness
        if (!currentUser.isProfileComplete) {
          console.warn('User profile is incomplete');
          toast('Please complete your profile', {
            icon: '👤',
            duration: 4000
          });
          navigate('/complete-profile');
          console.groupEnd();
          return;
        }

        // Reset states before fetching
        setRecentActivity([]);
        setUserMetrics(null);

        // Fetch dashboard data
        await fetchDashboardData();
        
        console.groupEnd();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        toast.error(`Failed to initialize dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          duration: 4000
        });
        console.groupEnd();
      }
    };

    initializeDashboard();
  }, [currentUser, loading, networkError, navigate]);

  const fetchDashboardData = async () => {
    try {
      const fetchRecentActivity = async () => {
        try {
          const db = getFirestore();
          const user = auth.currentUser;
          
          console.group('Dashboard Data Fetch');
          console.log('Current Authentication State:', {
            user: user ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            } : 'No user',
            authObject: auth
          });

          if (!user) {
            console.error('No authenticated user found');
            console.groupEnd();
            return [];
          }

          // Fetch recent skill posts with comprehensive logging
          let skillsSnapshot;
          try {
            const skillsQuery = query(
              collection(db, 'skills'), 
              where('userId', '==', user.uid)
            );
            console.log('Skills Query:', {
              collection: 'skills',
              userId: user.uid
            });

            skillsSnapshot = await getDocs(skillsQuery);
            console.log('Skills Query Results:', {
              docsCount: skillsSnapshot.docs.length,
              docs: skillsSnapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
              }))
            });
          } catch (error) {
            console.error('Error fetching skills:', error);
            skillsSnapshot = { docs: [] };
          }
          
          // Fetch recent skill swaps with comprehensive logging
          let swapsSnapshot;
          try {
            const swapsQuery = query(
              collection(db, 'skillSwaps'), 
              where('userId', '==', user.uid)
            );
            console.log('Skill Swaps Query:', {
              collection: 'skillSwaps',
              userId: user.uid
            });

            swapsSnapshot = await getDocs(swapsQuery);
            console.log('Skill Swaps Query Results:', {
              docsCount: swapsSnapshot.docs.length,
              docs: swapsSnapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
              }))
            });
          } catch (error) {
            console.error('Error fetching skill swaps:', error);
            swapsSnapshot = { docs: [] };
          }

          console.groupEnd();

          const activities = [
            ...skillsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                type: 'skill_posted',
                description: `You posted a skill: ${data.skillName || 'Unknown Skill'}`,
                timestamp: Date.now()
              };
            }),
            ...swapsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                type: 'skill_swap',
                description: `You swapped skills with ${data.partnerName || 'a user'}`,
                timestamp: Date.now()
              };
            })
          ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

          return activities;
        } catch (error) {
          console.error('Detailed Error in fetchRecentActivity:', error);
          toast.error(`Failed to load recent activities: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            duration: 4000
          });
          return [];
        }
      };

      const recentActivityData = await fetchRecentActivity();
      setRecentActivity(recentActivityData);

      const fetchUserMetrics = () => {
        const recentActivity = recentActivityData || [];
        return {
          totalSkillsPosted: recentActivity.filter(a => a.type === 'skill_posted').length,
          totalSkillSwaps: recentActivity.filter(a => a.type === 'skill_swap').length,
          activeSkillRequests: 0,
          skillMatchPercentage: 0
        };
      };

      const metricsData = fetchUserMetrics();
      setUserMetrics(metricsData);
    } catch (error) {
      console.error('Detailed Error in fetchDashboardData:', error);
      toast.error(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 4000
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (!currentUser || networkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="text-center bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {networkError ? 'Network Error' : 'Access Denied'}
          </h2>
          <p className="mb-4 text-gray-600">
            {networkError 
              ? 'Unable to connect. Please check your internet connection.' 
              : 'Please log in to view your dashboard'}
          </p>
          <Button 
            onClick={() => navigate(networkError ? '/retry' : '/login')} 
            className="w-full"
          >
            {networkError ? 'Retry' : 'Go to Login'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {currentUser.displayName || 'User'}
            </h1>
            {currentUser.photoURL && (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-center mb-4">
                <TrendingUp className="mr-2 text-blue-500" />
                <h2 className="text-xl font-semibold">Your Performance</h2>
              </div>
              {userMetrics ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Skills Learned</span>
                    <span className="font-bold">{userMetrics.totalSkillsPosted}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Community Interactions</span>
                    <span className="font-bold">{userMetrics.totalSkillSwaps}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Active Skill Requests</span>
                    <span className="font-bold">{userMetrics.activeSkillRequests}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Skill Match Rate</span>
                    <span className="font-bold">{userMetrics.skillMatchPercentage}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading metrics...</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-center mb-4">
                <Activity className="mr-2 text-green-500" />
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>
              {recentActivity.length > 0 ? (
                <ul className="space-y-2">
                  {recentActivity.map((activity, index) => (
                    <li key={index} className="flex items-center">
                      {activity.type === 'skill_swap' && <RefreshCw className="mr-2 text-green-500" />}
                      {activity.type === 'skill_posted' && <Zap className="mr-2 text-yellow-500" />}
                      {activity.type === 'skill_request' && <Users className="mr-2 text-purple-500" />}
                      <span>{activity.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent activity</p>
              )}
            </div>

            {/* AI Recommendations */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-center mb-4">
                <Sparkles className="mr-2 text-yellow-500" />
                <h2 className="text-xl font-semibold">AI Recommendations</h2>
              </div>
              {currentUser && <DashboardAIRecommendations user={currentUser} />}
            </div>
          </div>

          {/* AI Skill Matcher */}
          <div className="mt-8">
            <AISkillMatcher userId={currentUser.uid} />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Button onClick={() => navigate('/post-skill')} className="w-full">
              Post a Skill
            </Button>
            <Button onClick={() => navigate('/need-skill')} className="w-full">
              Find a Skill
            </Button>
            <Button onClick={() => navigate('/skills')} className="w-full">
              Browse Skills
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
