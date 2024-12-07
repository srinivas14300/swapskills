import React from 'react';

// Sample data for skills
const skills = [];

const SkillsList = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {skills.map((skill, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-2">{skill.name}</h3>
                    <p className="text-sm text-gray-600">{skill.category}</p>
                    <p className="text-sm mt-2">{skill.description}</p>
                </div>
            ))}
        </div>
    );
};

export default SkillsList;
