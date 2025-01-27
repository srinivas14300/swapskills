import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Edit2, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// Skill interface
interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

export const MySkills = memo(function MySkills() {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'Beginner' as Skill['level'],
    category: '',
  });

  // Predefined skill categories
  const skillCategories = [
    'Web Development',
    'Data Science',
    'Mobile Development',
    'Cloud & DevOps',
    'AI & Machine Learning',
    'Cybersecurity',
    'UI/UX Design',
    'Other',
  ];

  useEffect(() => {
    console.log('MySkills Component - User:', currentUser);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">Please log in to view your skills</div>
      </div>
    );
  }

  const handleAddSkill = async () => {
    if (!newSkill.name || !newSkill.category) {
      toast.error('Please fill in all skill details');
      return;
    }

    try {
      // TODO: Implement skill addition to Firestore
      const skillToAdd = {
        id: Date.now().toString(), // Temporary ID
        ...newSkill,
      };

      setSkills([...skills, skillToAdd]);
      setNewSkill({ name: '', level: 'Beginner', category: '' });
      toast.success('Skill added successfully!');
    } catch (error) {
      toast.error('Failed to add skill');
      console.error(error);
    }
  };

  const handleDeleteSkill = (skillId: string) => {
    try {
      // TODO: Implement skill deletion in Firestore
      setSkills(skills.filter((skill) => skill.id !== skillId));
      toast.success('Skill removed successfully');
    } catch (error) {
      toast.error('Failed to remove skill');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Skills</h1>

      {/* Skill Addition Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Skill</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Skill Name"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            className="input border rounded p-2"
          />
          <select
            value={newSkill.level}
            onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as Skill['level'] })}
            className="input border rounded p-2"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
          <select
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            className="input border rounded p-2"
          >
            <option value="">Select Category</option>
            {skillCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleAddSkill} className="mt-4 flex items-center">
          <Plus className="mr-2" /> Add Skill
        </Button>
      </div>

      {/* Skills List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Skills</h2>
        {skills.length === 0 ? (
          <p className="text-gray-500">No skills added yet. Start by adding your first skill!</p>
        ) : (
          <div className="grid gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">{skill.name}</h3>
                  <p className="text-sm text-gray-600">
                    {skill.level} | {skill.category}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-blue-500 hover:bg-blue-50">
                    <Edit2 size={16} className="mr-2" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteSkill(skill.id)}
                  >
                    <Trash2 size={16} className="mr-2" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
