import React, { useState } from 'react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false); // Track submission status

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from refreshing the page
    setSubmitted(true); // Update state to show success modal
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>Contact Us</h1>
      
      <p style={{ fontSize: '1rem', textAlign: 'center', marginBottom: '2rem' }}>
        Welcome to Swap Skills! We're here to help you connect, learn, and grow by exchanging knowledge and expertise in various tech fields.
        If you have any questions or need assistance, please feel free to reach out to us using the form below. We would love to hear from you!
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label htmlFor="name" style={{ fontSize: '1rem' }}>Name:</label>
        <input
          type="text"
          id="name"
          placeholder="Enter your name"
          style={{
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
          }}
        />

        <label htmlFor="email" style={{ fontSize: '1rem' }}>Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          style={{
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
          }}
        />

        <label htmlFor="message" style={{ fontSize: '1rem' }}>Message:</label>
        <textarea
          id="message"
          placeholder="Enter your message"
          style={{
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            minHeight: '150px',
          }}
        />

        <button
          type="submit"
          style={{
            padding: '1rem',
            backgroundColor: '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Submit
        </button>
      </form>

      {/* Success Modal */}
      {submitted && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: '1000',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            width: '300px',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Submission Successful!</h2>
            <p style={{ marginBottom: '1rem' }}>Thank you for reaching out to us. We'll get back to you soon.</p>
            <button
              onClick={() => setSubmitted(false)} // Close modal
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;