import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React from 'react';

// Sample data for IT-related events
const events = [
  {
    id: 1,
    title: 'React Conference',
    date: '2023-11-01',
    location: 'San Francisco, CA',
    description: 'A conference about all things React.',
  },
  {
    id: 2,
    title: 'JavaScript Summit',
    date: '2023-11-15',
    location: 'New York, NY',
    description: 'The latest trends in JavaScript development.',
  },
  {
    id: 3,
    title: 'Machine Learning Workshop',
    date: '2023-12-05',
    location: 'Online',
    description: 'Hands-on workshop for ML enthusiasts.',
  },
];

const EventsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600">{event.date}</p>
            <p className="text-sm text-gray-600">{event.location}</p>
            <p className="text-sm mt-2">{event.description}</p>
          </div>
        ))
      ) : (
        <p>No events available</p>
      )}
    </div>
  );
};

export default EventsGrid;
