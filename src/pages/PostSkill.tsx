import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-hot-toast';
import { skills } from '../data/skills';
import { useAuth } from '../hooks/useAuth';
import { addSkill } from '../lib/firebase';
import { FaCode, FaLaptopCode, FaChalkboardTeacher, FaClipboardList, FaSave, FaTimes,  } from 'react-icons/fa';

const CATEGORIES = [
  { name: 'Web Development', icon: <FaCode /> },
  { name: 'Mobile Development', icon: <FaLaptopCode /> },
  { name: 'Programming Languages', icon: <FaCode /> },
  { name: 'Design', icon: <FaChalkboardTeacher /> },
  { name: 'Data Science', icon: <FaClipboardList /> },
  { name: 'Cloud Computing', icon: <FaLaptopCode /> },
  { name: 'Cybersecurity', icon: <FaCode /> },
  { name: 'AI/Machine Learning', icon: <FaClipboardList /> },
  { name: 'Other', icon: <FaChalkboardTeacher /> },
];

const PROFICIENCY_LEVELS = [
  { label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  { label: 'Expert', color: 'bg-red-100 text-red-800' },
];

export const PostSkill = memo(function PostSkill() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    skillName: '',
    category: '',
    proficiencyLevel: '',
    description: '',
    preferredTeachingMethod: '',
    yearsOfExperience: '',
    type: 'offer' as 'offer' | 'request',
    certifications: '',
  });

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!formData.skillName) errors.push('Please select a skill');
    if (!formData.category) errors.push('Please select a category');
    if (!formData.proficiencyLevel) errors.push('Please select your proficiency level');

    const descTrim = formData.description.trim();
    if (descTrim.length < 50) errors.push('Description must be at least 50 characters');
    if (descTrim.length > 500) errors.push('Description cannot exceed 500 characters');

    const yearsExp = parseInt(formData.yearsOfExperience, 10);
    if (isNaN(yearsExp) || yearsExp < 0 || yearsExp > 50) {
      errors.push('Years of experience must be between 0 and 50');
    }

    return errors;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors([]);

    try {
      if (!user) {
        toast.error('Please log in to post a skill');
        navigate('/login');
        return;
      }

      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setFormErrors(validationErrors);
        setLoading(false);
        return;
      }

      const skillData = {
        skillName: formData.skillName,
        category: formData.category,
        description: formData.description.trim(),
        userId: user.uid,
        userEmail: user.email || '',
        type: formData.type,
        isAvailable: true,
        proficiencyLevel: formData.proficiencyLevel,
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        certifications: formData.certifications,
        preferredTeachingMethod: formData.preferredTeachingMethod,
        createdAt: new Date(),
      };

      const result = await addSkill(skillData);

      if (result) {
        toast.success('Skill posted successfully!', {
          icon: '🚀',
          style: { background: '#4CAF50', color: 'white' },
        });
        navigate('/skills');
      }
    } catch (error) {
      console.error('Skill posting error:', error);
      toast.error('Failed to post skill. Please try again.', {
        style: { background: '#FF6B6B', color: 'white' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            <FaChalkboardTeacher className="mr-3" />
            Post Your Skill
          </h1>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
            >
              <FaTimes className="text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="font-bold text-red-700 mb-2">Please correct the following errors:</p>
              <ul className="list-disc list-inside text-red-600">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Type</label>
              <div className="flex space-x-4">
                {['offer', 'request'].map((type) => (
                  <label key={type} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 capitalize">
                      {type === 'offer' ? 'I can Teach' : 'I want to Learn'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
              <select
                name="skillName"
                value={formData.skillName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              >
                <option value="">Select a skill</option>
                {skills.map((skill, index) => (
                  <option key={index} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid md:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <label
                  key={category.name}
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer transition
                    ${
                      formData.category === category.name
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.name}
                    checked={formData.category === category.name}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="mr-2 text-xl text-blue-600">{category.icon}</span>
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proficiency Level
              </label>
              <div className="flex space-x-2">
                {PROFICIENCY_LEVELS.map((level) => (
                  <label
                    key={level.label}
                    className={`
                      flex-1 text-center py-2 rounded-lg cursor-pointer transition
                      ${
                        formData.proficiencyLevel === level.label
                          ? `${level.color} font-bold`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="proficiencyLevel"
                      value={level.label}
                      checked={formData.proficiencyLevel === level.label}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {level.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                min="0"
                max="50"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                placeholder="Years of experience"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              placeholder="Describe your skill, experience, and what you can teach or want to learn..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Teaching Method
              </label>
              <select
                name="preferredTeachingMethod"
                value={formData.preferredTeachingMethod}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              >
                <option value="">Select method</option>
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications (Optional)
              </label>
              <input
                type="text"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                placeholder="Any relevant certifications"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`
                px-6 py-2 rounded-lg text-white transition flex items-center
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {loading ? 'Posting...' : 'Post Skill'}
              <FaSave className="ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default PostSkill;
