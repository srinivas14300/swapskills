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
  Grid 
} from 'lucide-react';

const NavbarGradient: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const NavLinks = [
    { name: 'Dashboard', icon: Grid, path: '/dashboard' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Skills', icon: Briefcase, path: '/skills' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-500 shadow-2xl">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo and Brand */}
        <Link 
          to="/" 
          className="text-3xl font-extrabold text-white flex items-center space-x-3 transform hover:scale-105 transition-transform"
        >
          <Briefcase className="w-8 h-8 text-white" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            SkillSwap
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {NavLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className="text-white/90 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center space-x-2"
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}

          {/* User Section */}
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition-all"
              >
                <img 
                  src={currentUser.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white/50"
                />
                <span className="text-white font-semibold">
                  {currentUser.displayName || 'User'}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl overflow-hidden animate-dropdown">
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <p className="font-bold">{currentUser.displayName}</p>
                    <p className="text-sm opacity-75">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/account-settings" 
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4 text-purple-600" />
                      <span>Account Settings</span>
                    </Link>
                    <button 
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="text-white border-white/50 hover:bg-white/20"
              >
                Login
              </Button>
              <Button 
                variant="solid" 
                onClick={() => navigate('/register')}
                className="bg-white text-indigo-600 hover:bg-white/90"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-white"
          >
            {isDropdownOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isDropdownOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {NavLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="block py-3 px-4 text-gray-800 hover:bg-purple-50 rounded-lg flex items-center space-x-3 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <link.icon className="w-5 h-5 text-purple-600" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}

            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 py-3 px-4 bg-purple-50 rounded-lg">
                  <img 
                    src={currentUser.photoURL || '/default-avatar.png'} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full border-2 border-purple-200"
                  />
                  <div>
                    <p className="font-bold text-gray-800">{currentUser.displayName || 'User'}</p>
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
                  className="w-full text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Login
                </Button>
                <Button 
                  variant="solid" 
                  onClick={() => navigate('/register')}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
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

export default NavbarGradient;
