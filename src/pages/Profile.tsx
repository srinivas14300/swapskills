import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function Profile() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');

  const { user, signOut } = useAuth();
  const db = getFirestore();

  // Handle profile picture upload
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setProfilePic(previewUrl);
    }
  };

  // Save profile data to Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!about || !skills || !location || !contact || !firstName || !lastName || !dob) {
      toast.error('All fields are required!');
      return;
    }

    if (user) {
      try {
        await setDoc(doc(db, 'profiles', user.uid), {
          profilePic,
          about,
          skills,
          location,
          contact,
          firstName,
          lastName,
          dob,
        });
        toast.success('Profile updated successfully!');
      } catch (error) {
        toast.error('Failed to save profile. Please try again.');
      }
    }
  };

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'profiles', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfilePic(data.profilePic || null);
            setAbout(data.about || '');
            setSkills(data.skills || '');
            setLocation(data.location || '');
            setContact(data.contact || '');
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setDob(data.dob || '');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  // Inline styles for the Geeks for Geeks theme
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      color: '#028A0F',
      marginBottom: '20px',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '600',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #028A0F',
      borderRadius: '5px',
      outline: 'none',
      fontSize: '14px',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #028A0F',
      borderRadius: '5px',
      outline: 'none',
      fontSize: '14px',
    },
    button: {
      backgroundColor: '#028A0F',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    buttonHover: {
      backgroundColor: '#02680C',
    },
    profilePicContainer: {
      textAlign: 'center' as const,
      marginBottom: '20px',
    },
    profilePic: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      border: '4px solid #028A0F',
      objectFit: 'cover' as const,
    },
    changePicLabel: {
      display: 'block',
      marginTop: '10px',
      color: '#028A0F',
      cursor: 'pointer',
      fontWeight: '600',
    },
  };

  return (
    <div style={{ backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-500', minHeight: '100vh' }}>
      <div style={styles.container}>
        <h1 style={styles.heading}>My Profile</h1>
        <div style={styles.profilePicContainer}>
          <img
            src={profilePic || 'https://via.placeholder.com/150'}
            alt="Profile"
            style={styles.profilePic}
          />
          <label htmlFor="profile-pic" style={styles.changePicLabel}>
            <Edit2 size={16} style={{ marginRight: '5px' }} />
            Change Picture
          </label>
          <input
            type="file"
            id="profile-pic"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleProfilePicChange}
          />
        </div>
        <form onSubmit={handleSave}>
          {/* First Name */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Date of Birth */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="dob">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              style={styles.input}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          {/* About */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="about">
              About
            </label>
            <textarea
              id="about"
              rows={4}
              style={styles.textarea}
              placeholder="Tell us about yourself"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          {/* Skills */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="skills">
              Skills
            </label>
            <input
              id="skills"
              type="text"
              style={styles.input}
              placeholder="List your skills (e.g., React, Node.js)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          {/* Location */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              style={styles.input}
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Contact */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="contact">
              Contact Info
            </label>
            <input
              id="contact"
              type="text"
              style={styles.input}
              placeholder="Enter your email or phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          {/* Save Button */}
          <div style={{ textAlign: 'right' }}>
            <button
              type="submit"
              style={styles.button}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#02680C')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#028A0F')}
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Sign Out Button */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => signOut()}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}