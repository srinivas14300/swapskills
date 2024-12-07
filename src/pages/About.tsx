import React from 'react';

export default function About() {
  return (
    <div
      style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        minHeight: '100vh',  // Full height of the viewport
        display: 'flex',
        justifyContent: 'center',  // Centers content horizontally
        alignItems: 'center',  // Centers content vertically
        flexDirection: 'column',  // Stack content vertically
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          color: '#1d4ed8',
        }}
      >
        About Swap Skills
      </h1>

      {/* Dynamic Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
          padding: '1rem',
          alignItems: 'start', // Align content to the top
          justifyItems: 'center', // Center grid items horizontally
          maxWidth: '1200px', // Limit the width of the grid container
          width: '100%',
        }}
      >
        {/* Grid Items */}
        {[
          {
            title: 'What is Swap Skills?',
            content: `Swap Skills is an innovative platform where individuals can exchange their skills with others. 
                      Whether you want to learn a new programming language or improve your cooking skills, Swap Skills 
                      connects people who are eager to share knowledge and grow together.`,
          },
          {
            title: 'Our Mission',
            content: `Our mission is to create a collaborative space for learners and educators to share skills, 
                      improve, and build a community of lifelong learners. We believe in the power of knowledge 
                      sharing and mutual growth.`,
          },
          {
            title: 'How It Works',
            content: `Users can post skills they want to learn, and others can offer their expertise in exchange. 
                      It’s an easy way to learn new skills while teaching others what you know.`,
          },
          {
            title: 'Our Values',
            content: `
              <ul style="padding-left: 1.5rem;">
                <li>Collaboration: We believe in the power of collaboration and mutual growth.</li>
                <li>Community: Building a community of lifelong learners is at the core of our platform.</li>
                <li>Equality: We strive to make learning accessible to everyone, regardless of their background.</li>
              </ul>
            `,
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              transition: 'transform 0.3s ease-in-out',
              maxWidth: '450px', // Limit max width for readability
              width: '100%',
              margin: '1rem', // Add spacing between grid items
            }}
          >
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#1d4ed8',
                marginBottom: '1rem',
              }}
            >
              {item.title}
            </h2>
            {item.title === 'Our Values' ? (
              <div
                dangerouslySetInnerHTML={{ __html: item.content }}
                style={{
                  color: '#4b5563',
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                }}
              />
            ) : (
              <p
                style={{
                  color: '#4b5563',
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                  marginBottom: '1rem',
                }}
              >
                {item.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}