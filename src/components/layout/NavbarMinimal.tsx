import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Briefcase, 
  MessageCircle,
  Zap,
  Users,
  Bot,
  Calendar
} from 'lucide-react';

const NavbarMinimal: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinks = [
    { name: 'Home', icon: Home, path: '/', requiredAuth: false },
    { name: 'Skills', icon: Zap, path: '/skills', requiredAuth: true },
    { name: 'Community', icon: Users, path: '/community', requiredAuth: true },
    { name: 'AI Assistant', icon: Bot, path: '/ai-assistant', requiredAuth: true },
    { name: 'Tech Events', icon: Calendar, path: '/tech-events', requiredAuth: false },
    { name: 'profile', icon: User, path: '/profile', requiredAuth: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-white flex items-center space-x-2"
        >
          <Briefcase className="w-6 h-6" />
          <span>SkillSwap</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {NavLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className="text-white hover:text-blue-200 transition-colors flex items-center space-x-2"
            >
              <link.icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          ))}

          {currentUser ? (
            <div className="flex items-center space-x-4">
              <img 
                src={currentUser.photoURL || '/default-avatar.png'} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <Button 
                variant="outline" 
                onClick={signOut}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Login
              </Button>
              <Button 
                variant="solid" 
                onClick={() => navigate('/register')}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {NavLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="block py-2 px-3 text-gray-800 hover:bg-blue-50 rounded-md flex items-center space-x-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="w-5 h-5 text-blue-600" />
                <span>{link.name}</span>
              </Link>
            ))}

            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 py-2 px-3 bg-blue-50 rounded-md">
                  <img 
                    src={currentUser.photoURL || '/default-avatar.png'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{currentUser.displayName || 'User'}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="w-full text-red-600 border-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 w-5 h-5" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Login
                </Button>
                <Button 
                  variant="solid" 
                  onClick={() => navigate('/register')}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarMinimal;
