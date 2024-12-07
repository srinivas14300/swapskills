import React from 'react';

const Features = () => {
  const features = [
    { title: 'User Skill Profiles', description: 'List skills to teach and learn with descriptions.' },
    { title: 'Skill Matching', description: 'Match users by skills and preferences.' },
    { title: 'Session Scheduling', description: 'Schedule sessions with calendar tools.' },
    { title: 'Search Functionality', description: 'Search users by skills or categories.' },
    { title: 'Real-Time Communication', description: 'Chat and coordinate sessions easily.' },
    { title: 'User Ratings and Reviews', description: 'Rate sessions and provide feedback.' },
    { title: 'Resource Sharing', description: 'Share learning materials securely.' },
  ];

  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Essential Features of Swap Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-item bg-white text-gray-900 p-6 rounded-lg shadow-md flex flex-col justify-between">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
