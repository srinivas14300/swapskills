import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React from 'react';

// Sample data for skills
const skills = [
  {
    id: 1,
    name: 'React',
    category: 'Frontend Development',
    description: 'JavaScript library for building user interfaces',
  },
  {
    id: 2,
    name: 'Python',
    category: 'Backend Development',
    description: 'High-level programming language for versatile applications',
  },
  {
    id: 3,
    name: 'Machine Learning',
    category: 'Data Science',
    description: 'Advanced algorithms for intelligent data analysis',
  },
];

const SkillsList = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {skills.length > 0 ? (
        skills.map((skill) => (
          <div key={skill.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">{skill.name}</h3>
            <p className="text-sm text-gray-600">{skill.category}</p>
            <p className="text-sm mt-2">{skill.description}</p>
          </div>
        ))
      ) : (
        <p>No skills available</p>
      )}
    </div>
  );
};

export default SkillsList;
