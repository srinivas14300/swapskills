import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  Search 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import CascadeAIService from '../services/cascadeAIService';
import { Sparkles, TrendingUp } from 'lucide-react';

interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  userId: string;
  createdAt: Date;
  type: string;
  userEmail: string;
  skillName: string;
  isAvailable: boolean;
  certifications: string;
  yearsOfExperience: string;
  preferredTeachingMethod: string;
}

interface UserProfile {
  uid: string;
  // Add other user profile properties as needed
}

// AI-Powered Skill Recommendation Component
const AISkillRecommendations: React.FC<{ 
  user: UserProfile, 
  addSkill: (newSkill: Omit<Skill, 'id'>) => Promise<void> 
}> = ({ user, addSkill }) => {
  const [aiRecommendations, setAIRecommendations] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const recommendations = await CascadeAIService.generatePersonalizedSkillRecommendations(user);
        setAIRecommendations(recommendations);
      } catch (error) {
        console.error('Failed to fetch AI recommendations:', error);
        setError('Unable to fetch AI recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAIRecommendations();
    }
  }, [user]);

  const handleAddRecommendedSkill = async (skill: Skill) => {
    try {
      await addSkill({
        title: skill.name || skill.title,
        description: skill.description || 'AI Recommended Skill',
        category: skill.category || 'General',
        proficiencyLevel: 'Beginner',
        userId: user.uid
      });
      toast.success(`Added ${skill.name || skill.title} to your skills`);
    } catch (error) {
      console.error('Error adding recommended skill:', error);
      toast.error('Failed to add recommended skill');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center text-purple-800">
          <Sparkles className="mr-2 text-purple-600" />
          Cascade AI Skill Recommendations
        </h2>
        <TrendingUp className="text-blue-600" />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-gray-500 py-4">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {aiRecommendations.length > 0 ? (
            aiRecommendations.map((skill, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{skill.name || skill.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {skill.description || 'Recommended skill based on your profile'}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {skill.category || 'Suggested'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => handleAddRecommendedSkill(skill)}
                >
                  <Plus className="mr-2 w-4 h-4" /> Add Skill
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p>No AI recommendations available. Complete your profile for personalized suggestions!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Skills: React.FC = () => {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillModalType, setSkillModalType] = useState<'offer' | 'request'>('offer');
  const [newSkillForm, setNewSkillForm] = useState({
    title: '',
    description: '',
    category: '',
    proficiencyLevel: 'Beginner',
    type: 'offer' as 'offer' | 'request',
    targetProficiencyLevel: '',
    currentKnowledgeLevel: '',
    timeCommitment: '',
    preferredLearningMethod: '',
    skillsToOffer: '',
  });

  const skillCategories = [
    'Web Development', 
    'Mobile Development', 
    'Data Science', 
    'Design', 
    'Marketing', 
    'Business', 
    'Other'
  ];

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleNewSkillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSkillForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openSkillModal = (type: 'offer' | 'request') => {
    setSkillModalType(type);
    setNewSkillForm(prev => ({
      ...prev,
      type,
      targetProficiencyLevel: type === 'request' ? '' : prev.targetProficiencyLevel,
      currentKnowledgeLevel: type === 'request' ? '' : prev.currentKnowledgeLevel,
      timeCommitment: type === 'request' ? '' : prev.timeCommitment,
      preferredLearningMethod: type === 'request' ? '' : prev.preferredLearningMethod,
      skillsToOffer: type === 'request' ? '' : prev.skillsToOffer,
    }));
    setIsSkillModalOpen(true);
  };

  const handleAddSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSkill({
        ...newSkillForm,
        userId: currentUser?.uid || ''
      });
      setIsSkillModalOpen(false);
      setNewSkillForm({
        title: '',
        description: '',
        category: '',
        proficiencyLevel: 'Beginner',
        type: 'offer',
        targetProficiencyLevel: '',
        currentKnowledgeLevel: '',
        timeCommitment: '',
        preferredLearningMethod: '',
        skillsToOffer: '',
      });
    } catch (error) {
      console.error('Failed to add skill', error);
      toast.error('Failed to add skill');
    }
  };

  const renderSkillModal = () => (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none ${
        isSkillModalOpen ? 'visible' : 'invisible'
      }`}
      onClick={(e) => {
        // Prevent modal from closing when clicking inside the modal content
        if (e.target === e.currentTarget) {
          setIsSkillModalOpen(false);
        }
      }}
    >
      <div 
        className={`relative w-full max-w-2xl mx-auto my-6 transition-all duration-300 ease-in-out transform ${
          isSkillModalOpen 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent click from propagating to parent
      >
        <div className="relative flex flex-col w-full max-h-[90vh] bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-2xl font-semibold">
              {skillModalType === 'offer' ? 'Offer a Skill' : 'Request a Skill'}
            </h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-50 focus:outline-none hover:opacity-75"
              onClick={() => setIsSkillModalOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto max-h-[70vh] p-6">
            <form onSubmit={handleAddSkillSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block mb-2 text-sm font-bold text-gray-700">
                  {skillModalType === 'offer' ? 'Skill Title' : 'Skill You Want to Learn'}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newSkillForm.title}
                  onChange={handleNewSkillChange}
                  required
                  className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  placeholder={skillModalType === 'offer' 
                    ? "Enter skill name" 
                    : "What skill do you want to learn?"
                  }
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-bold text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newSkillForm.description}
                  onChange={handleNewSkillChange}
                  required
                  className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  placeholder={skillModalType === 'offer' 
                    ? "Describe your skill" 
                    : "Describe what specific aspects of this skill you want to learn"
                  }
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="category" className="block mb-2 text-sm font-bold text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newSkillForm.category}
                  onChange={handleNewSkillChange}
                  required
                  className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select a category</option>
                  {skillCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {skillModalType === 'offer' ? (
                <div>
                  <label htmlFor="proficiencyLevel" className="block mb-2 text-sm font-bold text-gray-700">
                    Proficiency Level
                  </label>
                  <select
                    id="proficiencyLevel"
                    name="proficiencyLevel"
                    value={newSkillForm.proficiencyLevel}
                    onChange={handleNewSkillChange}
                    required
                    className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  >
                    {proficiencyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="currentKnowledgeLevel" className="block mb-2 text-sm font-bold text-gray-700">
                      Current Knowledge Level
                    </label>
                    <select
                      id="currentKnowledgeLevel"
                      name="currentKnowledgeLevel"
                      value={newSkillForm.currentKnowledgeLevel}
                      onChange={handleNewSkillChange}
                      required
                      className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select current level</option>
                      {proficiencyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="targetProficiencyLevel" className="block mb-2 text-sm font-bold text-gray-700">
                      Target Proficiency Level
                    </label>
                    <select
                      id="targetProficiencyLevel"
                      name="targetProficiencyLevel"
                      value={newSkillForm.targetProficiencyLevel}
                      onChange={handleNewSkillChange}
                      required
                      className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select target level</option>
                      {proficiencyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeCommitment" className="block mb-2 text-sm font-bold text-gray-700">
                      Time Commitment
                    </label>
                    <input
                      type="text"
                      id="timeCommitment"
                      name="timeCommitment"
                      value={newSkillForm.timeCommitment}
                      onChange={handleNewSkillChange}
                      required
                      className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                      placeholder="e.g., 5 hours per week"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferredLearningMethod" className="block mb-2 text-sm font-bold text-gray-700">
                      Preferred Learning Method
                    </label>
                    <select
                      id="preferredLearningMethod"
                      name="preferredLearningMethod"
                      value={newSkillForm.preferredLearningMethod}
                      onChange={handleNewSkillChange}
                      required
                      className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select learning method</option>
                      <option value="online">Online</option>
                      <option value="inPerson">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="skillsToOffer" className="block mb-2 text-sm font-bold text-gray-700">
                      Skills You Can Offer in Exchange
                    </label>
                    <textarea
                      id="skillsToOffer"
                      name="skillsToOffer"
                      value={newSkillForm.skillsToOffer}
                      onChange={handleNewSkillChange}
                      className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                      placeholder="List skills you can teach in exchange"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end pt-4 border-t border-solid rounded-b border-blueGray-200">
                <button
                  type="button"
                  className="px-6 py-2 mb-1 mr-4 text-sm font-bold text-gray-600 uppercase transition-all duration-150 ease-linear bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setIsSkillModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 mb-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {skillModalType === 'offer' ? 'Add Skill' : 'Request Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isSkillModalOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black opacity-25" 
          onClick={() => setIsSkillModalOpen(false)}
        />
      )}
    </div>
  );

  useEffect(() => {
    if (currentUser) {
      fetchSkills();
    }
  }, [currentUser]);

  const fetchSkills = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const skillsRef = collection(firestore, 'skills');
      const q = query(skillsRef, where('userId', '==', currentUser.uid));
      
      const querySnapshot = await getDocs(q);
      const fetchedSkills: Skill[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Skill));

      setSkills(fetchedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (newSkill: Omit<Skill, 'id'>) => {
    try {
      const skillRef = await addDoc(collection(firestore, 'skills'), {
        ...newSkill,
        createdAt: serverTimestamp(),
        userEmail: currentUser?.email || '',
        skillName: newSkill.title,
        isAvailable: true,
        certifications: '',
        yearsOfExperience: '',
        preferredTeachingMethod: 'online'
      });

      const addedSkill: Skill = {
        id: skillRef.id,
        ...newSkill,
        createdAt: new Date(),
        userEmail: currentUser?.email || '',
        skillName: newSkill.title,
        isAvailable: true,
        certifications: '',
        yearsOfExperience: '',
        preferredTeachingMethod: 'online'
      };

      setSkills(prevSkills => [...prevSkills, addedSkill]);
      toast.success(`Added ${newSkill.title} to your skills`);
      return skillRef;
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error(`Failed to add skill: ${(error as Error).message}`);
      throw error;
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      const skillRef = doc(firestore, 'skills', skillId);
      await deleteDoc(skillRef);

      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      toast.success('Skill deleted successfully');
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const filteredSkills = skills.filter(skill => 
    (filter === 'all' || skill.proficiencyLevel === filter) &&
    (searchQuery ? skill.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
  );

  const renderSkillCard = (skill: Skill) => (
    <div 
      key={skill.id} 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{skill.title}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => {/* Open edit modal */}}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => deleteSkill(skill.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-gray-600 mb-2">{skill.description}</p>
      <div className="flex justify-between items-center">
        <span 
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            skill.proficiencyLevel === 'Beginner' 
              ? 'bg-green-100 text-green-800'
              : skill.proficiencyLevel === 'Intermediate'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {skill.proficiencyLevel}
        </span>
        <span className="text-sm text-gray-500">{skill.category}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="container mx-auto px-4">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <Briefcase className="mr-3 text-blue-600" /> My Skills
            </h1>
            <div className="flex space-x-2">
              <Button 
                onClick={() => openSkillModal('offer')}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Plus className="w-5 h-5" />
                <span>Offer Skill</span>
              </Button>
              <Button 
                onClick={() => openSkillModal('request')}
                className="flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Request Skill</span>
              </Button>
            </div>
          </div>

          {renderSkillModal()}

          {/* Filters and Search */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-2">
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-3 py-2 rounded-full text-sm ${
                    filter === level 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {level === 'all' ? 'All Skills' : level}
                </button>
              ))}
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="Search skills..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Skills Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No skills found. Add your first skill!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map(renderSkillCard)}
            </div>
          )}
          
          {/* AI Skill Recommendations Section */}
          <div className="mt-8">
            {currentUser && <AISkillRecommendations user={currentUser} addSkill={addSkill} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
