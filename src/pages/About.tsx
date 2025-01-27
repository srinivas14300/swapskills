import React from 'react';
import { IconType } from 'react-icons';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';

import pattiSrinivas from '../assets/images/developers/Patti Srinivas.jpg';
import rohithKumar from '../assets/images/developers/Gunaganti Rohith Kumar.jpg';
import dharshanojThrishal from '../assets/images/developers/Dharshanoj Thrishal.jpg';
import kushalReddy from '../assets/images/developers/Kushal Reddy.jpg';

export default React.memo(function About() {
  const developers = [
    {
      name: 'Patti Srinivas',
      role: 'Founder & Lead Developer',
      github: 'https://github.com/pattisrinivas',
      linkedin: 'https://linkedin.com/in/preetham',
      twitter: 'https://twitter.com/preetham',
      email: 'preetham@swapskills.com',
      photo: pattiSrinivas,
    },
    {
      name: 'Gunaganti Rohith Kumar',
      role: 'Co-Founder & UI/UX Designer',
      github: 'https://github.com/rohith',
      linkedin: 'https://linkedin.com/in/rohith',
      twitter: 'https://twitter.com/rohith',
      email: 'rohith@swapskills.com',
      photo: rohithKumar,
    },
    {
      name: 'Dharshanoj Thrishal',
      role: 'Backend Developer & Mern Stack Expert',
      github: 'https://github.com/dharshanoj',
      linkedin: 'https://linkedin.com/in/dharshanoj',
      twitter: 'https://twitter.com/dharshanoj',
      email: 'dharshanoj@swapskills.com',
      photo: dharshanojThrishal,
    },
    {
      name: 'Kushal Reddy',
      role: 'Full Stack Developer & UI/UX Designer',
      github: 'https://github.com/kushal',
      linkedin: 'https://linkedin.com/in/kushal',
      twitter: 'https://twitter.com/kushal',
      email: 'kushal@swapskills.com',
      photo: kushalReddy,
    },
  ];

  const socialLinks: Array<{name: string, icon: IconType, url: string}> = [
    {
      name: 'GitHub',
      icon: FaGithub,
      url: 'https://github.com/swapskills',
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: 'https://linkedin.com/company/swapskills',
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: 'https://twitter.com/swapskills',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://instagram.com/swapskills',
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      url: 'mailto:contact@swapskills.com',
    },
  ];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500">
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1
          style={{
            textAlign: 'center',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'white',
          }}
        >
          About Swap Skills
        </h1>

        <p
          style={{
            fontSize: '1rem',
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'white',
          }}
        >
          Welcome to Swap Skills! We're here to help you connect, learn, and grow by exchanging
          knowledge and expertise in various tech fields.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            padding: '1rem',
            alignItems: 'start',
            justifyItems: 'center',
          }}
        >
          {[
            {
              title: 'What is Swap Skills?',
              content: `Swap Skills is an innovative platform where individuals can exchange their skills with others.`,
            },
            {
              title: 'Our Mission',
              content: `Improve, and build a community of lifelong learners.`,
            },
            {
              title: 'How It Works',
              content: `Users can post skills they want to learn, and others can offer their expertise in exchange.`,
            },
            {
              title: 'Our Values',
              content: `
                <ul style="padding-left: 1.5rem;">
                  <li>Collaboration: We believe in the power of collaboration and mutual growth.</li>
                  <li>Community: Building a community of lifelong learners is at the core of our platform.</li>
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
                maxWidth: '450px',
                width: '100%',
                height: '100%', // Ensure equal height
                margin: '1rem',
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
                  }}
                />
              ) : (
                <p style={{ color: '#4b5563' }}>{item.content}</p>
              )}
            </div>
          ))}
        </div>

        {/* Connect Us Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Connect With Us</h2>

          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mb-8">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-3xl text-blue-500 hover:text-blue-700 transition duration-300"
                >
                  <IconComponent />
                </a>
              );
            })}
          </div>

          {/* Developers Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg p-4 text-center flex flex-col justify-between h-full"
              >
                {dev.photo && (
                  <img
                    src={dev.photo}
                    alt={dev.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-blue-600">{dev.name}</h3>
                  <p className="text-gray-600 mb-4">{dev.role}</p>
                </div>
                <div className="flex justify-center space-x-3 mt-auto">
                  {[
                    { Icon: FaGithub, url: dev.github },
                    { Icon: FaLinkedin, url: dev.linkedin },
                    { Icon: FaTwitter, url: dev.twitter },
                    { Icon: FaEnvelope, url: `mailto:${dev.email}` },
                  ].map(({ Icon, url }, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
