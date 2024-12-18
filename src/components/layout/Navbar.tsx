import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Button } from '../ui/Button.tsx';
import { 
  LogOut, 
  Menu, 
  User, 
  Repeat, 
  Bell, 
  Settings, 
  Award, 
  Edit2, 
  LayoutGrid, 
  Search, 
  Sparkles, 
  Wand2 as Magic,
  Users,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext.tsx';
import { useState } from 'react';

// Dynamic Navigation Configuration
const navigationConfig = [
  {
    label: 'Home',
    path: '/',
    icon: LayoutGrid,
    requiredAuth: false,
  },
  {
    label: 'Skills',
    path: '/skills',
    icon: Repeat,
    requiredAuth: true,
    subRoutes: [
      { label: 'Available Skills', path: '/skills/available', icon: Award },
      { label: 'Post Skill', path: '/skills/post', icon: Edit2 },
    ],
  },
  {
    label: 'Community',
    path: '/community',
    icon: Users,
    requiredAuth: false,
  },
  {
    label: 'AI Assistant',
    path: '/ai-assistant',
    icon: Magic,
    requiredAuth: true,
  },
  {
    label: 'Tech Events',
    path: '/tech-events',
    icon: Calendar,
    requiredAuth: false,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
    requiredAuth: true,
    dropdown: [
      {
        label: 'My Profile',
        path: '/profile',
        icon: User,
      },
      {
        label: 'Complete Profile',
        path: '/complete-profile',
        icon: Edit2,
      },
      {
        label: 'Account Settings',
        path: '/account-settings',
        icon: Settings,
      },
      {
        label: 'Sign Out',
        path: '/logout',
        icon: LogOut,
        action: 'signOut',
      }
    ]
  },
];

export default function Navbar() {
  const { currentUser, signOut } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter navigation items based on authentication
  const filteredNavigation = navigationConfig.filter(
    (item) => !item.requiredAuth || (currentUser && item.requiredAuth)
  );

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const renderNavLinks = () => (
    <div className="flex space-x-6">
      {filteredNavigation.map((navItem) => (
        <div key={navItem.path} className="relative">
          <div 
            onClick={() => navItem.dropdown && handleDropdownToggle(navItem.label)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Link 
              to={navItem.path} 
              className="flex items-center space-x-2"
            >
              <navItem.icon className="w-5 h-5" />
              <span>{navItem.label}</span>
            </Link>
            {navItem.dropdown && (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </div>
          
          {/* Sub-routes dropdown */}
          {navItem.subRoutes && (
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 z-10">
              {navItem.subRoutes.map((subRoute) => (
                <Link
                  key={subRoute.path}
                  to={subRoute.path}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <subRoute.icon className="w-4 h-4" />
                    <span>{subRoute.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Dropdown */}
          {navItem.dropdown && activeDropdown === navItem.label && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {navItem.dropdown.map((dropdownItem) => (
                dropdownItem.action === 'signOut' ? (
                  <button
                    key={dropdownItem.label}
                    onClick={handleSignOut}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <dropdownItem.icon className="mr-2 w-4 h-4" />
                    <span>{dropdownItem.label}</span>
                  </button>
                ) : (
                  <Link
                    key={dropdownItem.path}
                    to={dropdownItem.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <dropdownItem.icon className="mr-2 w-4 h-4" />
                    <span>{dropdownItem.label}</span>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Define the theme color dynamically (can be based on state or context)
  const themeColor = '#1d4ed8'; // Tailwind blue (you can make this dynamic)
  const backgroundColor = '#ffffff'; // Light background (or use dark background dynamically)
  const hoverColor = '#f3f4f6'; // Hover background color (light gray for hover effect)
  const borderColor = '#e5e7eb'; // Border color for separating navbar

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav 
      className="sticky top-0 z-50 bg-white shadow-sm"
      style={{ 
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: backgroundColor,
      }}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/" 
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            SkillSwap
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {renderNavLinks()}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-blue-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-full"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `/default-avatar.png`;
                        e.currentTarget.onerror = null;
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {currentUser.displayName 
                        ? currentUser.displayName.charAt(0).toUpperCase() 
                        : currentUser.email 
                        ? currentUser.email.charAt(0).toUpperCase() 
                        : 'U'}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentUser.displayName || currentUser.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <User className="mr-2 w-4 h-4" /> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/complete-profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Edit2 className="mr-2 w-4 h-4" /> Complete Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/account-settings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="mr-2 w-4 h-4" /> Account Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="mr-2 w-4 h-4" /> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link 
                to="/login" 
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {renderNavLinks()}
          </div>
        </div>
      )}
    </nav>
  );
}
