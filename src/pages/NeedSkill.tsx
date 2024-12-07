import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { skills } from '../data/skills';

const proficiencyLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

export default function NeedSkill() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skillName: '',
    category: '',
    targetProficiencyLevel: '',
    description: '',
    currentKnowledgeLevel: '',
    timeCommitment: '',
    preferredLearningMethod: '',
    skillsToOffer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error('Please login to post a skill request');
        navigate('/login');
        return;
      }

      const db = getFirestore();
      await addDoc(collection(db, 'skills'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        type: 'request'
      });

      toast.success('Skill request posted successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Error posting skill request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-500', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Request a Skill</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Skill You Want to Learn</label>
            <select
              name="skillName"
              value={formData.skillName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a skill</option>
              {skills.map((skill, index) => (
                <option key={index} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Proficiency Level</label>
            <select
              name="targetProficiencyLevel"
              value={formData.targetProficiencyLevel}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select target level</option>
              {proficiencyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Knowledge Level</label>
            <select
              name="currentKnowledgeLevel"
              value={formData.currentKnowledgeLevel}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select current level</option>
              {proficiencyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Describe what specific aspects of this skill you want to learn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time Commitment</label>
            <input
              type="text"
              name="timeCommitment"
              value={formData.timeCommitment}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="e.g., 5 hours per week"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Learning Method</label>
            <input
              type="text"
              name="preferredLearningMethod"
              value={formData.preferredLearningMethod}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="e.g., Online, In-person, Hybrid..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills You Can Offer in Exchange</label>
            <textarea
              name="skillsToOffer"
              value={formData.skillsToOffer}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="List the skills you can teach in exchange..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Posting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
