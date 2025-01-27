import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect, memo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.tsx';
import { getAllAvailableSkills } from '../lib/firebase.ts';
import { FaFilter, FaSearch, FaBookOpen, FaChalkboardTeacher, FaGraduationCap, FaTag, FaEnvelope } from 'react-icons/fa';
import { FaPaperPlane } from 'react-icons/fa';
import { sendSkillMessage } from '../services/messagingService';

// Category Icon Mapping
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Programming Languages': <i className="devicon-python-plain" />,
    'Web Development': <i className="devicon-react-original" />,
    'Mobile Development': <i className="devicon-android-plain" />,
    'Cloud Computing': <i className="devicon-amazonwebservices-original" />,
    'DevOps': <i className="devicon-docker-plain" />,
    'Data Science': <i className="devicon-jupyter-plain" />,
    'AI/Machine Learning': <i className="devicon-tensorflow-original" />,
    'Cybersecurity': <i className="devicon-linux-plain" />,
    'Design': <i className="devicon-photoshop-plain" />,
    'UI/UX Design': <i className="devicon-figma-plain" />,
    'Other': <i className="devicon-devicon-plain" />
  };
  return iconMap[category] || <i className="devicon-devicon-plain" />;
};

// Category Color Mapping
const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    'Programming Languages': 'bg-blue-100 text-blue-800',
    'Web Development': 'bg-green-100 text-green-800',
    'Mobile Development': 'bg-purple-100 text-purple-800',
    'Cloud Computing': 'bg-indigo-100 text-indigo-800',
    'DevOps': 'bg-yellow-100 text-yellow-800',
    'Data Science': 'bg-red-100 text-red-800',
    'AI/Machine Learning': 'bg-pink-100 text-pink-800',
    'Cybersecurity': 'bg-gray-100 text-gray-800',
    'Design': 'bg-orange-100 text-orange-800',
    'UI/UX Design': 'bg-teal-100 text-teal-800',
    'Other': 'bg-blue-50 text-blue-700'
  };
  return colorMap[category] || 'bg-blue-50 text-blue-700';
};

interface Skill {
  id: string;
  skillName: string;
  category: string;
  description: string;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
  userEmail: string;
  preferredTeachingMethod?: string;
  skillType: 'offer' | 'request';
  type: 'offer' | 'request';
  createdAt: Date | string;
}

export default memo(function AvailableSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filter, setFilter] = useState({
    category: '',
    skillType: '' as 'offer' | 'request' | '',
    searchTerm: '',
  });
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    recipientEmail?: string;
    recipientName?: string;
    message: string;
  }>({
    isOpen: false,
    message: '',
  });

  const { user } = useAuth();

  const categories = [
    'Web Development',
    'Mobile Development',
    'Programming Languages',
    'Design',
    'Data Science',
    'Cloud Computing',
    'Cybersecurity',
    'AI/Machine Learning',
    'Other',
  ];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const availableSkills = await getAllAvailableSkills();
        setSkills(availableSkills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast.error('Failed to load skills');
      }
    };

    fetchSkills();
  }, []);

  const getProficiencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-600';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const matchCategory = !filter.category || skill.category === filter.category;
    const matchSkillType = !filter.skillType || skill.skillType === filter.skillType;
    const matchSearch =
      !filter.searchTerm ||
      skill.skillName.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(filter.searchTerm.toLowerCase());

    return matchCategory && matchSkillType && matchSearch;
  });

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Please log in to send a message');
      return;
    }

    try {
      await sendSkillMessage({
        senderId: user.uid,
        senderEmail: user.email || '',
        recipientEmail: messageModal.recipientEmail || '',
        message: messageModal.message,
        skillId: '', // You might want to add this from the current skill context
      });

      toast.success('Message sent successfully!');
      setMessageModal(prev => ({ ...prev, isOpen: false, message: '' }));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleContactClick = (skill: Skill) => {
    if (!user) {
      // Redirect to login or show login modal
      toast.error('Please log in to send a message', {
        icon: '🔒',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    // Open message modal if user is logged in
    setMessageModal({
      isOpen: true,
      recipientEmail: skill.userEmail,
      recipientName: skill.skillName,
      message: '',
    });
  };

  const renderMessageModal = () => {
    if (!messageModal.isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-600">
              Send Message to {messageModal.recipientName}
            </h2>
            <button 
              onClick={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <textarea 
            value={messageModal.message}
            onChange={(e) => setMessageModal(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Type your message here..."
            className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button 
              onClick={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaPaperPlane className="mr-2" /> Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 sm:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-4 md:mb-0 flex items-center">
                <FaChalkboardTeacher className="mr-3 text-blue-500" />
                Skills Marketplace
              </h1>

              {/* Filters */}
              <div className="flex space-x-4">
                {/* Category Filter */}
                <select
                  value={filter.category}
                  onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Skill Type Filter */}
                <select
                  value={filter.skillType}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    skillType: e.target.value as 'offer' | 'request' | '' 
                  }))}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="offer">Skills to Teach</option>
                  <option value="request">Skills to Learn</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search skills..."
                value={filter.searchTerm}
                onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Skills Grid */}
            {filteredSkills.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-xl text-gray-600">No skills found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                {filteredSkills.map((skill) => {
                  // Refined color palette with more professional and subtle gradients
                  const categoryColors = {
                    'Programming': 'from-sky-100 to-sky-200 text-sky-800',
                    'Design': 'from-emerald-100 to-emerald-200 text-emerald-800',
                    'Marketing': 'from-rose-100 to-rose-200 text-rose-800',
                    'Business': 'from-amber-100 to-amber-200 text-amber-800',
                    'Language': 'from-indigo-100 to-indigo-200 text-indigo-800',
                    'Music': 'from-fuchsia-100 to-fuchsia-200 text-fuchsia-800',
                    'Art': 'from-violet-100 to-violet-200 text-violet-800',
                    'Photography': 'from-cyan-100 to-cyan-200 text-cyan-800',
                    'Writing': 'from-lime-100 to-lime-200 text-lime-800',
                    'default': 'from-gray-100 to-gray-200 text-gray-800'
                  };

                  const gradientColor = categoryColors[skill.category] || categoryColors['default'];
                  
                  return (
                    <div
                      key={skill.id}
                      className="relative group transform transition-all duration-300 hover:scale-105 hover:z-10"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-20 group-hover:opacity-40 rounded-2xl transition-opacity duration-300`}></div>
                      
                      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
                        {/* Category Header */}
                        <div 
                          className={`p-4 flex items-center justify-between bg-gradient-to-r ${gradientColor} relative`}
                        >
                          <div className="flex items-center space-x-3 z-10">
                            <span className="text-3xl opacity-80">{getCategoryIcon(skill.category)}</span>
                            <h3 className="text-xl font-bold truncate max-w-[180px]">{skill.skillName}</h3>
                          </div>
                          <span 
                            className={`px-3 py-1 rounded-full text-sm font-semibold z-10 ${
                              skill.skillType === 'offer' 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {skill.skillType === 'offer' ? 'Teach' : 'Learn'}
                          </span>
                        </div>

                        {/* Skill Details */}
                        <div className="p-5 flex flex-col flex-grow space-y-4">
                          {/* Category */}
                          <div className="flex items-center">
                            <FaTag className="mr-2 text-gray-400" />
                            <p className="text-sm text-gray-600 font-medium">
                              {skill.category}
                            </p>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-700 flex-grow line-clamp-3 min-h-[4.5rem]">
                            {skill.description}
                          </p>

                          {/* Experience and Teaching Method */}
                          {skill.skillType === 'offer' && (
                            <div className="space-y-2">
                              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                <FaGraduationCap className="mr-2 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {skill.yearsOfExperience} years experience
                                </span>
                              </div>
                              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                <FaBookOpen className="mr-2 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {skill.preferredTeachingMethod}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Contact Information */}
                          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                            <FaEnvelope 
                              className="text-gray-500 cursor-pointer hover:text-blue-600" 
                              onClick={() => handleContactClick(skill)}
                            />
                            <span 
                              className="cursor-pointer hover:text-blue-600"
                              onClick={() => handleContactClick(skill)}
                            >
                              {skill.userEmail}
                            </span>
                          </div>

                          {/* Action Button */}
                          {user && user.email !== skill.userEmail && (
                            <button
                              className={`
                                w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center mt-4
                                transform hover:scale-105 hover:shadow-lg
                                ${
                                  skill.skillType === 'offer'
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                              onClick={() => handleContactClick(skill)}
                            >
                              {skill.skillType === 'offer' ? 'Request to Learn' : 'Offer to Teach'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {renderMessageModal()}
    </div>
  );
});
