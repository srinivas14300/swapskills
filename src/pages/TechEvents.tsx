import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect, memo } from 'react';

export default memo(function TechEvents() {
  const [hackathonIndex, setHackathonIndex] = useState(0);
  const [workshopIndex, setWorkshopIndex] = useState(0);

  const hackathons = Array.from({ length: 22 }, (_, index) => ({
    title: `Hackathon ${index + 1}`,
    domain: [
      'AI',
      'Blockchain',
      'Cybersecurity',
      'Cloud Computing',
      'Data Science',
      'Web Development',
      'IoT',
    ][index % 7],
    date: `2024-0${(index % 12) + 1}-15`,
    location: 'Hyderabad',
    featured: index % 5 === 0,
  }));

  const workshops = [
    {
      title: 'Web Development Bootcamp',
      domain: 'Web Development',
      date: '2023-11-15',
      location: 'Hyderabad',
    },
    {
      title: 'Data Science with Python',
      domain: 'Data Science',
      date: '2023-12-10',
      location: 'Hyderabad',
    },
    {
      title: 'Blockchain Essentials',
      domain: 'Blockchain',
      date: '2024-01-20',
      location: 'Hyderabad',
    },
    {
      title: 'Machine Learning for Beginners',
      domain: 'AI',
      date: '2024-02-05',
      location: 'Hyderabad',
    },
    {
      title: 'Cybersecurity Fundamentals',
      domain: 'Cybersecurity',
      date: '2024-03-10',
      location: 'Hyderabad',
    },
  ];

  const _handleSlide = (_direction: 'prev' | 'next', _type: 'hackathon' | 'workshop') => {
    // Placeholder for potential future implementation
  };

  const renderEventCard = (event: unknown, isFeatured: boolean = false) => (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
        transition: 'transform 0.3s ease-in-out',
        marginBottom: '2rem',
      }}
    >
      {isFeatured && (
        <span
          style={{
            position: 'absolute',
            top: '-10px',
            left: '10px',
            backgroundColor: '#f39c12',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          FEATURED
        </span>
      )}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{event.title}</h3>
      <p style={{ fontSize: '1rem', color: '#555' }}> {event.date}</p>
      <p style={{ fontSize: '1rem', color: '#555' }}> {event.location}</p>
      <p style={{ fontSize: '1rem', color: '#555', fontStyle: 'italic' }}>Domain: {event.domain}</p>
      <button
        style={{
          backgroundColor: '#3498db',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          padding: '0.5rem 1rem',
          marginTop: '1rem',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
        onClick={() => alert(`Registered for ${event.title}`)}
      >
        Register Now
      </button>
    </div>
  );

  useEffect(() => {
    const hackathonInterval = setInterval(() => {
      setHackathonIndex((prevIndex) => (prevIndex + 1) % hackathons.length);
    }, 5000);

    const workshopInterval = setInterval(() => {
      setWorkshopIndex((prevIndex) => (prevIndex + 1) % workshops.length);
    }, 5000);

    return () => {
      clearInterval(hackathonInterval);
      clearInterval(workshopInterval);
    };
  }, [hackathons.length, workshops.length]);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            color: 'white',
          }}
        >
          Tech Events & Opportunities
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            padding: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: 'white',
              }}
            >
              Upcoming Hackathons
            </h2>
            {hackathons
              .slice(0, 5)
              .map((hackathon, index) => renderEventCard(hackathon, hackathon.featured))}
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: 'white',
              }}
            >
              Workshops
            </h2>
            {workshops.map((workshop, index) => renderEventCard(workshop))}
          </div>
        </div>
      </div>
    </div>
  );
});
