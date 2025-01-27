import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useMemo } from 'react';
import { FaSearch, FaCode, FaPaintBrush, FaDatabase, FaNetworkWired, FaRobot,  } from 'react-icons/fa';
import { debounce } from '../lib/performanceOptimizer.tsx';

interface Skill {
  id: string;
  name: string;
  category: string;
}

// Mapping categories to icons
const categoryIcons = {
  'Web Development': FaCode,
  Programming: FaCode,
  'UI/UX': FaPaintBrush,
  Design: FaPaintBrush,
  'Backend Development': FaNetworkWired,
  'Data Science': FaDatabase,
  'Machine Learning': FaRobot,
};

const SkillMatcher: React.FC = () => {
  const [skills] = useState<Skill[]>([
    { id: '1', name: 'React', category: 'Web Development' },
    { id: '2', name: 'Python', category: 'Programming' },
    { id: '3', name: 'Design', category: 'UI/UX' },
    { id: '4', name: 'Node.js', category: 'Backend Development' },
    { id: '5', name: 'Machine Learning', category: 'Data Science' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Memoized filtering to prevent unnecessary re-renders
  const filteredSkills = useMemo(() => {
    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skills, searchTerm]);

  // Debounced search handler
  const handleSearchChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, 300);

  return (
    <div className="skill-matcher bg-white shadow-lg rounded-2xl p-6 m-4">
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search skills..."
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => {
            const IconComponent =
              categoryIcons[skill.category as keyof typeof categoryIcons] || FaCode;
            return (
              <div
                key={skill.id}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="flex items-center mb-3">
                  <IconComponent className="text-blue-600 mr-3 text-2xl group-hover:text-blue-800 transition duration-300" />
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-900 transition duration-300">
                    {skill.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 italic group-hover:text-gray-800 transition duration-300">
                  {skill.category}
                </p>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8 bg-gray-50 rounded-2xl">
            No skills found matching your search
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillMatcher;
