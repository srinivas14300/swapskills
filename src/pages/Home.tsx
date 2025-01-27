import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import NavbarModern from '../components/layout/NavbarModern';
import { Search, Plus, Loader2, UserPlus, Share2, Handshake, Users, UserCheck, BookOpen, BookmarkPlus, Bot, User, Settings, Edit2, LayoutGrid, Repeat } from 'lucide-react';
import { getFirestore, collection, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.tsx';
import { getAllAvailableSkills, requestSkill } from '../lib/firebase.ts';

interface Skill {
  id: string;
  skillName: string;
  category: string;
  description: string;
  proficiencyLevel?: string;
  type: 'offer' | 'request';
  userEmail: string;
  userId?: string;
  isAvailable?: boolean;
  hasActiveRequest?: boolean;
  createdAt: Date;
}

const Home = React.memo(function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Current User:', currentUser);
    console.log('Is Logged In:', !!currentUser);
  }, [currentUser]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        const profileDocRef = doc(getFirestore(), 'profiles', currentUser.uid);
        const profileDoc = await getDoc(profileDocRef);

        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        toast.error('Failed to load profile');
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const categories = [
    'Programming Languages',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'DevOps',
    'Data Science',
    'Machine Learning',
    'Cybersecurity',
    'Graphic Design',
    'UI/UX Design',
    'Testing',
    'Networking',
    'Video Editing',
    'Language Translation',
  ];

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Programming Languages': <i className="devicon-python-plain" />,
      'Web Development': <i className="devicon-react-original" />,
      'Mobile Development': <i className="devicon-android-plain" />,
      'Cloud Computing': <i className="devicon-amazonwebservices-original" />,
      DevOps: <i className="devicon-docker-plain" />,
      'Data Science': <i className="devicon-jupyter-plain" />,
      'Machine Learning': <i className="devicon-tensorflow-original" />,
      Cybersecurity: <i className="devicon-linux-plain" />,
      'Graphic Design': <i className="devicon-photoshop-plain" />,
      'UI/UX Design': <i className="devicon-figma-plain" />,
      Testing: <i className="devicon-selenium-original" />,
      Networking: <i className="devicon-cisco-plain" />,
      'Video Editing': <i className="devicon-premierepro-plain" />,
      'Language Translation': <i className="devicon-google-plain" />,
    };
    return iconMap[category] || <i className="devicon-devicon-plain" />;
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const fetchedSkills = await getAllAvailableSkills();
        setSkills(fetchedSkills);
        setError(null);
      } catch (err) {
        console.error('🚨 Skill Fetch Error:', err);
        setError('Failed to load skills. Please try again.');
        toast.error('Unable to fetch skills');
      }
    };

    fetchSkills();
  }, []);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRequestSkill = async (skillId: string) => {
    if (!currentUser) {
      toast.error('Please log in to request a skill');
      navigate('/login');
      return;
    }

    try {
      const success = await requestSkill(skillId, currentUser.uid);
      if (success) {
        const updatedSkills = skills.map((skill) =>
          skill.id === skillId ? { ...skill, hasActiveRequest: true } : skill
        );
        setSkills(updatedSkills);
        toast.success('Skill request sent successfully!');
      }
    } catch (error) {
      console.error('Skill request error:', error);
      toast.error('Failed to send skill request');
    }
  };

  const renderAuthButtons = () => {
    console.log('Render Auth Buttons - Current User:', currentUser);
    
    if (currentUser) {
      console.log('Returning null for auth buttons');
      return null;
    }

    return (
      <div className="mt-6 space-x-4">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate('/register')}
        >
          Sign Up
        </Button>
      </div>
    );
  };

  const renderHeroSection = () => {
    if (currentUser) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            <img 
              src={currentUser.photoURL || '/assets/default-avatar.png'} 
              alt="User Profile" 
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {currentUser.displayName || 'User'}!
              </h2>
              <p className="text-gray-600">Ready to swap skills and grow together?</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/need-skill')}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Find Skills
            </Button>
          </div>
        </div>
      );
    }

    // Default hero section for non-logged in users
    return (
      <div>
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Swap Skills,
          <br />
          <span className="text-yellow-300">Grow Together</span>
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Connect with professionals, learn new skills, and share your expertise.
        </p>
        {renderAuthButtons()}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something Went Wrong</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <NavbarModern />
        {currentUser && (
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-4">
                <img 
                  src={currentUser.photoURL || '/assets/default-avatar.png'} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold">
                    {currentUser.displayName || 'Welcome User'}
                  </h3>
                  <p className="text-gray-600">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/complete-profile')}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
            
            {/* Profile Details */}
            {userProfile && (
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold">{userProfile.location || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Skills</p>
                    <p className="font-semibold">
                      {userProfile.skills?.length || 0} Skills
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Interests</p>
                    <p className="font-semibold">
                      {userProfile.interests?.length || 0} Interests
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Profile Completion</p>
                    <p className="font-semibold">
                      {Math.round((userProfile.firstName ? 25 : 0) + 
                                  (userProfile.lastName ? 25 : 0) + 
                                  (userProfile.skills?.length ? 25 : 0) + 
                                  (userProfile.interests?.length ? 25 : 0))}%
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Profile Navigation Bar */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-4">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/profile')}
              >
                <User className="w-6 h-6" />
                <span className="text-xs">Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/complete-profile')}
              >
                <Edit2 className="w-6 h-6" />
                <span className="text-xs">Complete Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/account-settings')}
              >
                <Settings className="w-6 h-6" />
                <span className="text-xs">Account Settings</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/skills/post')}
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs">Post Skill</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-xs">Dashboard</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/search')}
              >
                <Search className="w-6 h-6" />
                <span className="text-xs">Search</span>
              </Button>
            </div>
          </div>
        )}
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            {renderHeroSection()}
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <img
                src="/skill-swap-hero.svg"
                alt="Skill Swap Illustration"
                className="w-full max-w-md animate-float"
              />
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center mb-8">Explore Skill Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, index) => {
              const gradientBackgrounds = [
                'from-blue-400 to-blue-600',
                'from-green-400 to-green-600',
                'from-purple-400 to-purple-600',
                'from-red-400 to-red-600',
                'from-yellow-400 to-yellow-600',
                'from-indigo-400 to-indigo-600',
                'from-pink-400 to-pink-600',
                'from-teal-400 to-teal-600',
                'from-orange-400 to-orange-600',
                'from-cyan-400 to-cyan-600',
              ];

              const selectedGradient = gradientBackgrounds[index % gradientBackgrounds.length];

              return (
                <div
                  key={index}
                  className={`
                    group relative overflow-hidden rounded-lg p-4 text-center 
                    transition duration-300 transform hover:-translate-y-2 
                    cursor-pointer shadow-lg
                    bg-gradient-to-r ${selectedGradient}
                    hover:scale-105
                  `}
                  onClick={() => {
                    setSelectedCategory(category);
                    navigate('/skills', { state: { category } });
                  }}
                >
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="text-3xl mb-2 text-white opacity-80">
                      {getCategoryIcon(category)}
                    </div>
                    <p className="text-sm font-medium text-white">{category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center mb-12">How Skill Swap Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <UserPlus className="text-yellow-400" size={48} />,
                title: 'Create Profile',
                description: 'Set up your profile and showcase your skills.',
              },
              {
                icon: <Share2 className="text-green-400" size={48} />,
                title: 'Post Skills',
                description: 'Share skills you can teach or want to learn.',
              },
              {
                icon: <Handshake className="text-blue-400" size={48} />,
                title: 'Connect & Learn',
                description: 'Match with professionals and start learning.',
              },
            ].map((step, index) => (
              <div
                key={index}
                className="
                  bg-gray-50 rounded-lg p-6 text-center 
                  hover:bg-gray-100 transition duration-300
                "
              >
                <div className="mb-4 flex justify-center">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Community Stats</h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            {[
              {
                icon: <Users className="mx-auto mb-2" size={36} />,
                number: skills.length,
                label: 'Total Skills',
              },
              {
                icon: <UserCheck className="mx-auto mb-2" size={36} />,
                number: new Set(skills.map((s) => s.userEmail)).size,
                label: 'Active Users',
              },
              {
                icon: <BookOpen className="mx-auto mb-2" size={36} />,
                number: skills.filter((s) => s.type === 'offer').length,
                label: 'Skills to Teach',
              },
              {
                icon: <BookmarkPlus className="mx-auto mb-2" size={36} />,
                number: skills.filter((s) => s.type === 'request').length,
                label: 'Skills to Learn',
              },
            ].map((stat, index) => (
              <div key={index} className="text-gray-600">
                {stat.icon}
                <div className="text-3xl font-bold">{stat.number}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials or CTA Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Skill Swap and unlock a world of knowledge sharing.
          </p>
          {renderAuthButtons()}
        </div>

        {/* Profile Management Section */}
        {currentUser && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Profile Management</h3>
            
            {/* Profile Completion Warning */}
            {currentUser && (!currentUser.displayName || !currentUser.photoURL) && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex items-center">
                  <div className="mr-4">
                    <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-yellow-700 font-bold">
                      Complete Your Profile
                    </p>
                    <p className="text-yellow-600 text-sm">
                      Your profile is incomplete. Add more details to connect better!
                    </p>
                  </div>
                  <Button 
                    variant="primary" 
                    className="ml-auto"
                    onClick={() => navigate('/complete-profile')}
                  >
                    Complete Profile
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-2" /> View Profile
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => navigate('/complete-profile')}
              >
                <Edit2 className="mr-2" /> Complete Profile
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => navigate('/account-settings')}
              >
                <Settings className="mr-2" /> Account Settings
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => navigate('/skills/post')}
              >
                <Plus className="mr-2" /> Post a Skill
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutGrid className="mr-2" /> Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2"
                onClick={() => navigate('/search')}
              >
                <Search className="mr-2" /> Search
              </Button>
            </div>
          </div>
        )}

        {/* Available Skills Section */}
        <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Available Skills</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/available-skills')}
              className="flex items-center space-x-2"
            >
              <Repeat className="w-4 h-4" />
              <span>View All Skills</span>
            </Button>
          </div>
          
          {filteredSkills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No skills available at the moment.</p>
              {currentUser && (
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/skills/post')} 
                  className="mt-4"
                >
                  <Plus className="mr-2" /> Post a Skill
                </Button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.slice(0, 6).map((skill) => (
                <div 
                  key={skill.id} 
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{skill.skillName}</h3>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs uppercase ${
                        skill.type === 'offer' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {skill.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {skill.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {skill.category}
                    </span>
                    {currentUser && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRequestSkill(skill.id)}
                        disabled={skill.hasActiveRequest}
                      >
                        {skill.hasActiveRequest ? 'Requested' : 'Request'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredSkills.length > 6 && (
            <div className="text-center mt-6">
              <Button 
                variant="outline"
                onClick={() => navigate('/available-skills')}
              >
                See More Skills
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

export default Home;
