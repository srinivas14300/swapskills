import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/Button';
import { 
  Home, 
  Zap, 
  Users, 
  Bot, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Briefcase, 
  Grid,
  Search,
  Bell,
  Award,
  Edit2,
  Settings,
  ChevronDown,
  User
} from 'lucide-react';

const NavbarModern: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Home', iconName: 'Home', path: '/', requiredAuth: false },
    { name: 'About', iconName: 'Award', path: '/about', requiredAuth: false },
    { name: 'Skills', iconName: 'Zap', path: '/skills', requiredAuth: true },
    
    { name: 'Community', iconName: 'Users', path: '/community', requiredAuth: true },
    { name: 'AI Assistant', iconName: 'Bot', path: '/ai-assistant', requiredAuth: true },
    
    { name: 'Dashboard', iconName: 'Dashboard', path: '/Dashboard', requiredAuth: false }
  ];

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      Home: Home,
      Award: Award,
      Zap: Zap,
      Users: Users,
      Bot: Bot,
      Calendar: Calendar,
      Search: Search
    };
    return iconMap[iconName] || Home; // Default to Home if icon not found
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const renderNavLinks = (isMobile = false) => {
    return navLinks.filter(link => 
      (!link.requiredAuth || (currentUser && link.requiredAuth)) &&
      !(currentUser && link.hideWhenLoggedIn)
    ).map((link) => {
      const Icon = getIcon(link.iconName);
      return (
        <div key={link.path} className="relative group">
          <Link 
            to={link.path} 
            className={`
              flex items-center space-x-2 
              rounded-lg px-3 py-2
              ${isMobile 
                ? 'w-full hover:bg-blue-100 text-gray-800' 
                : 'hover:bg-white/20 hover:text-white'
              }
              ${isActive(link.path) 
                ? `
                  ${isMobile 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white/30 text-white font-semibold'
                  }
                ` 
                : `
                  ${isMobile 
                    ? 'text-gray-700' 
                    : 'text-white/80'
                  }
                `
              } 
              transition-all duration-300 ease-in-out
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{link.name}</span>
          </Link>
        </div>
      );
    });
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const profileDropdownItems = [
    { 
      name: 'My Profile', 
      icon: User, 
      path: '/profile',
      onClick: () => navigate('/profile')
    },
    { 
      name: 'Complete Profile', 
      icon: Edit2, 
      path: '/complete-profile',
      onClick: () => navigate('/complete-profile')
    },
    { 
      name: 'Account Settings', 
      icon: Settings, 
      path: '/settings',
      onClick: () => navigate('/settings')
    },
    { 
      name: 'Sign Out', 
      icon: LogOut, 
      path: '/',
      onClick: handleSignOut
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Brand */}
        <Link 
          to="/" 
          className="text-2xl font-bold flex items-center space-x-2"
        >
          <Briefcase className="w-6 h-6" />
          <span>SkillSwap</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {renderNavLinks()}

          {/* Profile Dropdown */}
          {currentUser && (
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-md transition-colors"
              >
                <img 
                  src={currentUser.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{currentUser.displayName || 'Profile'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
                  {profileDropdownItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        item.onClick();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-gray-500" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg">
            <div className="flex flex-col space-y-4 p-4">
              {renderNavLinks(true)}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarModern;
