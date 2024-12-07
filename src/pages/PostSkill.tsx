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

export default function PostSkill() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skillName: '',
    category: '',
    proficiencyLevel: '',
    description: '',
    preferredTeachingMethod: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error('Please login to post a skill');
        navigate('/login');
        return;
      }

      const db = getFirestore();
      await addDoc(collection(db, 'skills'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        type: 'offer'
      });

      toast.success('Skill posted successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Error posting skill');
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Post Your Skill</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Skill Name</label>
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
          <label className="block text-sm font-medium mb-2">Proficiency Level</label>
          <select
            name="proficiencyLevel"
            value={formData.proficiencyLevel}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select proficiency level</option>
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
            placeholder="Describe your expertise and what you can teach others..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Years of Experience</label>
          <input
            type="number"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            required
            min="0"
            max="50"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Certifications (optional)</label>
          <input
            type="text"
            name="certifications"
            value={formData.certifications}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="List any relevant certifications..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Preferred Teaching Method</label>
          <input
            type="text"
            name="preferredTeachingMethod"
            value={formData.preferredTeachingMethod}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
            placeholder="e.g., Online, In-person, Hybrid..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Posting...' : 'Post Skill'}
        </button>
      </form>
    </div>
  );
}
