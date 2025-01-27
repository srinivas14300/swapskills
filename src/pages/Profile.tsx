import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { Linkedin, Twitter, Github, TrendingUp, Plus } from 'lucide-react';

// Interfaces for type safety
interface Skill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Interest {
  name: string;
  category: string;
}

export default function Profile() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to view your profile</div>;
  }

  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [about, setAbout] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter: '',
    github: '',
  });
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({});
  const [newInterest, setNewInterest] = useState<Partial<Interest>>({});
  const [profilePic, setProfilePic] = useState('');
  const [profileCompletionScore, setProfileCompletionScore] = useState(0);
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);
  const [recommendedConnections, setRecommendedConnections] = useState([]);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        const profileDocRef = doc(db, 'profiles', currentUser.uid);
        const profileDoc = await getDoc(profileDocRef);

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setFirstName(profileData.firstName || '');
          setLastName(profileData.lastName || '');
          setAbout(profileData.about || '');
          setContact(profileData.contact || '');
          setLocation(profileData.location || '');
          setDob(profileData.dob || '');
          setSkills(profileData.skills?.map((name) => ({ name, proficiency: 'Beginner' })) || []);
          setInterests(profileData.interests?.map((name) => ({ name, category: 'General' })) || []);
          setSocialLinks(profileData.socialLinks || { linkedin: '', twitter: '', github: '' });
          setProfilePic(profileData.profilePic || '');
        } else {
          // If no profile document exists, create one with default values
          await setDoc(profileDocRef, {
            email: currentUser.email,
            firstName: '',
            lastName: '',
            skills: [],
            interests: [],
            contact: '',
            location: '',
            dob: '',
            about: '',
            socialLinks: {
              linkedin: '',
              twitter: '',
              github: '',
            },
            profilePic: '',
            createdAt: serverTimestamp(),
          });

          // Fetch the newly created document
          const newProfileDoc = await getDoc(profileDocRef);
          const profileData = newProfileDoc.data();

          if (profileData) {
            setFirstName(profileData.firstName || '');
            setLastName(profileData.lastName || '');
            setAbout(profileData.about || '');
            setContact(profileData.contact || '');
            setLocation(profileData.location || '');
            setDob(profileData.dob || '');
            setSkills(profileData.skills?.map((name) => ({ name, proficiency: 'Beginner' })) || []);
            setInterests(
              profileData.interests?.map((name) => ({ name, category: 'General' })) || []
            );
            setSocialLinks(profileData.socialLinks || { linkedin: '', twitter: '', github: '' });
            setProfilePic(profileData.profilePic || '');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  useEffect(() => {
    const fetchRecommendedSkills = async () => {
      if (!currentUser) return;

      try {
        // Hardcoded list of recommended skills
        const recommendedSkillsList = [
          'Machine Learning',
          'Web Development',
          'Cloud Computing',
          'Data Science',
          'Artificial Intelligence',
          'Blockchain',
          'Cybersecurity',
          'DevOps',
          'Mobile App Development',
          'UI/UX Design',
        ];

        // Filter out skills the user already has
        const filteredSkills = recommendedSkillsList.filter(
          (skill) => !skills.some((s) => s.name === skill)
        );

        setRecommendedSkills(filteredSkills);
      } catch (error) {
        console.error('Error fetching recommended skills:', error);
        toast.error('Failed to load skill requests');

        // Fallback to default skills in case of error
        const defaultSkills = ['Machine Learning', 'Web Development', 'Cloud Computing'];
        setRecommendedSkills(defaultSkills);
      }
    };

    fetchRecommendedSkills();
  }, [currentUser, skills]);

  const calculateProfileCompletion = () => {
    if (!currentUser) return 0;

    let completionScore = 0;
    completionScore += firstName && lastName ? 25 : 0;
    completionScore += about.length > 50 ? 25 : 0;
    completionScore += skills.length > 0 ? 25 : 0;
    completionScore += interests.length > 0 ? 25 : 0;
    completionScore += socialLinks.linkedin || socialLinks.twitter || socialLinks.github ? 25 : 0;
    completionScore += location ? 25 : 0;
    completionScore += contact ? 25 : 0;
    completionScore += dob ? 25 : 0;

    return Math.min(completionScore, 100);
  };

  const handleRecommendations = () => {
    // Basic recommendation logic
    return {
      skills: recommendedSkills,
      connections: [], // Placeholder
    };
  };

  useEffect(() => {
    const profileCompletion = calculateProfileCompletion();
    const recommendations = handleRecommendations();

    // Optional: You could trigger side effects based on profile completion
    if (profileCompletion < 50) {
      toast('Complete your profile to get better matches!', {
        icon: '📝',
        duration: 4000,
      });
    }
  }, [calculateProfileCompletion, handleRecommendations]);

  const addSkill = () => {
    if (newSkill.name && newSkill.proficiency) {
      const updatedSkills = [...skills, newSkill as Skill];
      setSkills(updatedSkills);
      updateDoc(doc(db, 'profiles', currentUser.uid), {
        skills: updatedSkills.map((s) => ({ name: s.name, proficiency: s.proficiency })),
      });
      setNewSkill({});
    }
  };

  const removeSkill = (skillToRemove: Skill) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);
    updateDoc(doc(db, 'profiles', currentUser.uid), {
      skills: updatedSkills.map((s) => ({ name: s.name, proficiency: s.proficiency })),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Validate required fields
      if (!firstName || !lastName || !about) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Prepare profile data
      const profileData = {
        email: currentUser.email,
        firstName,
        lastName,
        about,
        contact,
        location,
        dob,
        skills: skills.map((skill) => ({
          name: skill.name,
          proficiency: skill.proficiency,
        })),
        interests: interests.map((interest) => ({
          name: interest.name,
          category: interest.category,
        })),
        socialLinks: {
          linkedin: socialLinks.linkedin,
          twitter: socialLinks.twitter,
          github: socialLinks.github,
        },
        profilePic: profilePic || '',
        updatedAt: serverTimestamp(),
      };

      // Reference to user's profile document
      const profileDocRef = doc(db, 'profiles', currentUser.uid);

      // Update Firestore document
      await updateDoc(profileDocRef, profileData);

      // Show success toast
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);

      // Provide more specific error handling
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          toast.error('You do not have permission to update this profile');
        } else if (error.message.includes('not-found')) {
          toast.error('Profile document not found. Please contact support.');
        } else {
          toast.error(`Something went wrong: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Profile Completion Progress */}
        <div
          style={{
            backgroundColor: '#f0f9ff',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <TrendingUp size={20} style={{ marginRight: '10px', color: '#3b82f6' }} />
            <h3 style={{ margin: 0, color: '#1e3a8a' }}>Profile Completion</h3>
          </div>
          <div
            style={{
              height: '20px',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor:
                  calculateProfileCompletion() < 50
                    ? '#ef4444'
                    : calculateProfileCompletion() < 75
                      ? '#f59e0b'
                      : '#10b981',
                width: `${calculateProfileCompletion()}%`,
                transition: 'width 0.5s ease-in-out',
              }}
            ></div>
          </div>
          <div
            style={{
              marginTop: '10px',
              fontSize: '12px',
              color:
                calculateProfileCompletion() < 50
                  ? '#ef4444'
                  : calculateProfileCompletion() < 75
                    ? '#f59e0b'
                    : '#10b981',
            }}
          >
            {calculateProfileCompletion()}% Complete
            {calculateProfileCompletion() < 50 && " - Let's improve your profile!"}
            {calculateProfileCompletion() >= 50 &&
              calculateProfileCompletion() < 75 &&
              " - You're getting there!"}
            {calculateProfileCompletion() >= 75 && ' - Excellent profile!'}
          </div>
        </div>

        {/* Profile Picture Section */}
        <div
          style={{
            textAlign: 'center' as const,
            marginBottom: '20px',
          }}
        >
          <img
            src={profilePic || 'https://via.placeholder.com/150'}
            alt="Profile"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '4px solid #028A0F',
              objectFit: 'cover' as const,
            }}
          />
          <label
            htmlFor="profile-pic"
            style={{
              display: 'block',
              marginTop: '10px',
              color: '#028A0F',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Change Picture
          </label>
          <input
            type="file"
            id="profile-pic"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const previewUrl = URL.createObjectURL(file);
                setProfilePic(previewUrl);
              }
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div
              style={{
                ...{
                  marginBottom: '15px',
                },
                flex: 1,
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600',
                  color: '#333',
                }}
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #028A0F',
                  borderRadius: '5px',
                  outline: 'none',
                  fontSize: '14px',
                }}
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div
              style={{
                ...{
                  marginBottom: '15px',
                },
                flex: 1,
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600',
                  color: '#333',
                }}
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #028A0F',
                  borderRadius: '5px',
                  outline: 'none',
                  fontSize: '14px',
                }}
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div
            style={{
              marginBottom: '15px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
              }}
              htmlFor="about"
            >
              Professional Summary
            </label>
            <textarea
              id="about"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #028A0F',
                borderRadius: '5px',
                outline: 'none',
                fontSize: '14px',
              }}
              placeholder="Tell us about your professional journey..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Skills Section */}
          <div
            style={{
              marginBottom: '15px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
              }}
            >
              Skills
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '15px',
              }}
            >
              {skills.map((skill, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#028A0F',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  {skill.name} - {skill.proficiency}
                  <X
                    size={16}
                    style={{ marginLeft: '5px', cursor: 'pointer' }}
                    onClick={() => removeSkill(skill)}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <input
                type="text"
                placeholder="Skill Name"
                value={newSkill.name || ''}
                onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #028A0F',
                  borderRadius: '5px',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
              <select
                value={newSkill.proficiency || ''}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    proficiency: e.target.value as Skill['proficiency'],
                  }))
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #028A0F',
                  borderRadius: '5px',
                  outline: 'none',
                  fontSize: '14px',
                }}
              >
                <option value="">Select Proficiency</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={addSkill}
                style={{
                  backgroundColor: '#028A0F',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                disabled={!newSkill.name || !newSkill.proficiency}
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div
            style={{
              marginBottom: '15px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
              }}
            >
              Social Links
            </label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    ...{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: '600',
                      color: '#333',
                    },
                    fontSize: '12px',
                  }}
                  htmlFor="linkedin"
                >
                  LinkedIn
                </label>
                <input
                  type="url"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #028A0F',
                    borderRadius: '5px',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                  placeholder="LinkedIn profile URL"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    ...{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: '600',
                      color: '#333',
                    },
                    fontSize: '12px',
                  }}
                  htmlFor="twitter"
                >
                  Twitter
                </label>
                <input
                  type="url"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #028A0F',
                    borderRadius: '5px',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                  placeholder="Twitter profile URL"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    ...{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: '600',
                      color: '#333',
                    },
                    fontSize: '12px',
                  }}
                  htmlFor="github"
                >
                  GitHub
                </label>
                <input
                  type="url"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #028A0F',
                    borderRadius: '5px',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                  placeholder="GitHub profile URL"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin
                    size={24}
                    style={{
                      cursor: 'pointer',
                      color: '#028A0F',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter
                    size={24}
                    style={{
                      cursor: 'pointer',
                      color: '#028A0F',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                  <Github
                    size={24}
                    style={{
                      cursor: 'pointer',
                      color: '#028A0F',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </a>
              )}
            </div>
          </div>

          {/* Contact and Location */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div
              style={{
                ...{
                  marginBottom: '15px',
                },
                flex: 1,
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600',
                  color: '#333',
                }}
                htmlFor="contact"
              >
                Contact Number
              </label>
              <input
                id="contact"
                type="tel"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #028A0F',
                  borderRadius: '5px',
                  outline: 'none',
                  fontSize: '14px',
                }}
                placeholder="Enter your contact number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <div
              style={{
                ...{
                  marginBottom: '15px',
                },
                flex: 1,
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600',
                  color: '#333',
                }}
                htmlFor="location"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #028A0F',
                  borderRadius: '5px',
                  outline: 'none',
                  fontSize: '14px',
                }}
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div
            style={{
              marginBottom: '15px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
              }}
              htmlFor="dob"
            >
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #028A0F',
                borderRadius: '5px',
                outline: 'none',
                fontSize: '14px',
              }}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          {/* Save Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#028A0F',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Save Profile
            </button>
          </div>
        </form>

        {/* Recommended Skills Section */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '15px',
            marginTop: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <TrendingUp size={20} style={{ marginRight: '10px', color: '#10b981' }} />
            <h3 style={{ margin: 0, color: '#0649a1' }}>Recommended Skills</h3>
          </div>
          <div>
            {recommendedSkills.map((skill) => (
              <div
                key={skill}
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  margin: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const updatedSkills = [...skills, { name: skill, proficiency: 'Beginner' }];
                  setSkills(updatedSkills);
                  updateDoc(doc(db, 'profiles', currentUser.uid), {
                    skills: updatedSkills.map((s) => ({
                      name: s.name,
                      proficiency: s.proficiency,
                    })),
                  });
                }}
              >
                <Plus size={16} style={{ marginRight: '5px' }} />
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Connections Section */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '15px',
            marginTop: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#5b21b6' }}>Recommended Connections</h3>
          </div>
          {recommendedConnections.map((connection) => (
            <div
              key={connection.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            >
              <img
                src={connection.profilePic || 'https://via.placeholder.com/50'}
                alt={`${connection.firstName} ${connection.lastName}`}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  marginRight: '10px',
                }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {connection.firstName} {connection.lastName}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Shared Skills: {connection.skills?.slice(0, 3).join(', ')}
                </div>
              </div>
              <button
                style={{
                  marginLeft: 'auto',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '5px',
                }}
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
