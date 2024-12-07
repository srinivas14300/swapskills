import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { LogOut, Menu, User, Repeat } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, signOut } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define the theme color dynamically (can be based on state or context)
  const themeColor = '#1d4ed8'; // Tailwind blue (you can make this dynamic)
  const backgroundColor = '#ffffff'; // Light background (or use dark background dynamically)
  const hoverColor = '#f3f4f6'; // Hover background color (light gray for hover effect)
  const borderColor = '#e5e7eb'; // Border color for separating navbar

  const navStyle = {
    borderBottom: `1px solid ${borderColor}`,
    backgroundColor: backgroundColor,
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const linkStyle = {
    padding: '0.5rem 1rem',
    fontSize: '14px',
    color: '#6b7280', // Tailwind text-gray-500
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: themeColor,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  const signOutButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444', // Red color for sign out
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', marginRight: '2rem' }}>
          <Repeat className="h-6 w-6" style={{ color: themeColor }} />
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: themeColor, marginLeft: '0.5rem' }}>Swap Skills</span>
        </Link>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ ...linkStyle, '&:hover': { backgroundColor: hoverColor } }}>Home</Link>
          <Link to="/about" style={{ ...linkStyle, '&:hover': { backgroundColor: hoverColor } }}>About</Link>
          <Link to="/techevents" style={{ ...linkStyle, '&:hover': { backgroundColor: hoverColor } }}>Tech Events</Link>
          <Link to="/requests" style={{ ...linkStyle, '&:hover': { backgroundColor: hoverColor } }}>Requests</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <Link to="/profile">
              <Button variant="secondary" style={buttonStyle}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login">
              <Button variant="outline" style={buttonStyle}>Sign In</Button>
            </Link>
            <Link to="/register">
              <Button style={buttonStyle}>Sign Up</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div style={{ display: 'none', flexDirection: 'column', position: 'relative' }}>
        <Button 
          variant="secondary" 
          style={{ padding: '0.5rem', border: 'none' }}
          onClick={handleMenuToggle}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {isMobileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <Link to="/" style={{ ...linkStyle, display: 'block', marginBottom: '1rem' }}>Home</Link>
            <Link to="/about" style={{ ...linkStyle, display: 'block', marginBottom: '1rem' }}>About</Link>
            <Link to="/techevents" style={{ ...linkStyle, display: 'block', marginBottom: '1rem' }}>Tech Events</Link>
            <Link to="/contact" style={{ ...linkStyle, display: 'block', marginBottom: '1rem' }}>Contact</Link> {/* Mobile Contact Link */}
          </div>
        )}
      </div>
    </nav>
  );
}