import React from 'react';

// Sample data for IT-related events
const events = [
    { title: 'React Conference', date: '2023-11-01', location: 'San Francisco, CA', description: 'A conference about all things React.' },
    { title: 'JavaScript Summit', date: '2023-11-15', location: 'New York, NY', description: 'The latest trends in JavaScript development.' },
    // Add more events here
];

const EventsGrid = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {events.map((event, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.date}</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                    <p className="text-sm mt-2">{event.description}</p>
                </div>
            ))}
        </div>
    );
};

export default EventsGrid;
