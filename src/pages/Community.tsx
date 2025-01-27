import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Globe, 
  Zap, 
  Rocket, 
  Award, 
  TrendingUp, 
  Search, 
  Filter,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  limit, 
  orderBy 
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';

// Types for Community Features
interface CommunityFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

// Types for Community Members
interface CommunityMember {
  id: string;
  displayName: string;
  skills: string[];
  profilePicture?: string;
}

// Types for Community Events
interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  organizer: string;
}

const Community: React.FC = () => {
  const { currentUser } = useAuth();
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [membersLoading, setMembersLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Default data when no data is fetched
  const defaultMembers: CommunityMember[] = [
    {
      id: 'default1',
      displayName: 'John Doe',
      skills: ['Web Development', 'React', 'Node.js'],
      profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'default2',
      displayName: 'Jane Smith',
      skills: ['UI/UX Design', 'Figma', 'Product Management'],
      profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'default3',
      displayName: 'Mike Johnson',
      skills: ['Machine Learning', 'Python', 'Data Science'],
      profilePicture: 'https://randomuser.me/api/portraits/men/75.jpg'
    },
    {
      id: 'default4',
      displayName: 'Emily Wong',
      skills: ['Mobile Development', 'Flutter', 'Dart', 'Cross-Platform Development', 'Firebase Integration'],
      profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 'default5',
      displayName: 'Carlos Rodriguez',
      skills: ['Cloud Computing', 'AWS', 'DevOps', 'Kubernetes', 'Docker', 'CI/CD'],
      profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg'
    }
  ];

  const defaultEvents: CommunityEvent[] = [
    {
      id: 'event1',
      title: 'Tech Innovation Meetup',
      date: '2024-02-15',
      description: 'Explore the latest trends in technology and network with industry professionals. Featuring keynote speakers from top tech companies and interactive workshops.',
      organizer: 'SkillSwap Community'
    },
    {
      id: 'event2',
      title: 'Design Thinking Workshop',
      date: '2024-03-20',
      description: 'Learn cutting-edge design thinking principles and collaborative techniques. Hands-on session with UX experts and interactive problem-solving challenges.',
      organizer: 'SkillSwap Community'
    },
    {
      id: 'event3',
      title: 'AI & Machine Learning Symposium',
      date: '2024-04-10',
      description: 'Deep dive into artificial intelligence and machine learning. Featuring live demos, expert panels, and networking opportunities with AI researchers and practitioners.',
      organizer: 'SkillSwap Tech Collective'
    },
    {
      id: 'event4',
      title: 'Cloud Computing Bootcamp',
      date: '2024-05-05',
      description: 'Comprehensive workshop on cloud technologies, covering AWS, Azure, and Google Cloud. Includes certification preparation and hands-on lab sessions.',
      organizer: 'SkillSwap Cloud Community'
    },
    {
      id: 'event5',
      title: 'Mobile App Development Hackathon',
      date: '2024-06-15',
      description: 'A 48-hour intensive hackathon focusing on mobile app development. Participants will work in teams to create innovative mobile solutions using Flutter, React Native, and other cutting-edge technologies.',
      organizer: 'SkillSwap Developer Network'
    },
    {
      id: 'event6',
      title: 'Cybersecurity and Ethical Hacking Summit',
      date: '2024-07-22',
      description: 'Comprehensive conference exploring the latest trends in cybersecurity, ethical hacking, and digital defense strategies. Featuring live penetration testing demonstrations, expert panels, and networking opportunities with security professionals.',
      organizer: 'SkillSwap Security Alliance'
    }
  ];

  // Features with more detailed descriptions
  const communityFeatures: CommunityFeature[] = [
    {
      icon: MessageCircle,
      title: 'Interactive Forums',
      description: 'Engage in deep, meaningful discussions about skills, learning, and professional growth.',
      color: 'text-blue-600'
    },
    {
      icon: Share2,
      title: 'Skill Exchange Hub',
      description: 'Seamlessly swap and learn skills through structured, supportive interactions.',
      color: 'text-green-600'
    },
    {
      icon: Globe,
      title: 'Global Networking',
      description: 'Connect with professionals from diverse backgrounds and industries worldwide.',
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Form study groups, mentorship programs, and skill-focused communities.',
      color: 'text-indigo-600'
    }
  ];

  // Fetch community members
  const fetchCommunityMembers = async () => {
    setMembersLoading(true);
    try {
      const membersRef = collection(firestore, 'users');
      const q = query(
        membersRef, 
        where('isProfileComplete', '==', true),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const members: CommunityMember[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || 'Anonymous User',
          skills: data.skills?.map((skill: any) => skill.name || skill) || [],
          profilePicture: data.photoURL || '/default-avatar.png'
        };
      }).filter(member => member.skills.length > 0);

      // Shuffle the members to show a random selection
      const shuffledMembers = members.length > 0 
        ? members.sort(() => 0.5 - Math.random()) 
        : defaultMembers;

      setCommunityMembers(shuffledMembers);
    } catch (error) {
      console.error('Error fetching community members:', error);
      toast.error('Failed to load community members');
      setCommunityMembers(defaultMembers);
    } finally {
      setMembersLoading(false);
    }
  };

  // Fetch community events
  const fetchCommunityEvents = async () => {
    setEventsLoading(true);
    try {
      const eventsRef = collection(firestore, 'communityEvents');
      const q = query(
        eventsRef, 
        orderBy('date', 'asc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const events: CommunityEvent[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        date: doc.data().date,
        description: doc.data().description,
        organizer: doc.data().organizer
      }));

      // Use default events if no events are found
      setCommunityEvents(events.length > 0 ? events : defaultEvents);
    } catch (error) {
      console.error('Error fetching community events:', error);
      toast.error('Failed to load community events');
      setCommunityEvents(defaultEvents);
    } finally {
      setEventsLoading(false);
    }
  };

  // Lifecycle hook to fetch data
  useEffect(() => {
    fetchCommunityMembers();
    fetchCommunityEvents();
  }, []);

  // Filtered members based on search and skill
  const filteredMembers = communityMembers.filter(member => 
    member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterSkill ? member.skills.some(skill => 
      skill.toLowerCase().includes(filterSkill.toLowerCase())
    ) : true)
  );

  return (
    <div className="min-h-screen py-8 bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 bg-white/70 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex justify-center items-center">
            <Users className="mr-4 text-blue-600" /> SkillSwap Community
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your learning journey through collaborative growth, 
            meaningful connections, and shared expertise.
          </p>
        </div>

        {/* Community Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {communityFeatures.map((feature) => (
            <div 
              key={feature.title}
              className="bg-white/80 backdrop-blur-md rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <feature.icon className={`w-16 h-16 mx-auto mb-4 ${feature.color}`} />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Community Members Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="mr-3 text-yellow-500" /> Active Community Members
            </h2>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Search members" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
              <input 
                type="text" 
                placeholder="Filter by skill" 
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          {membersLoading ? (
            <div className="flex justify-center items-center py-8">
              <Zap className="animate-spin text-blue-500 w-12 h-12" />
              <span className="ml-4 text-gray-600">Loading community members...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex justify-center items-center py-8 text-gray-600">
              <AlertTriangle className="mr-4 text-yellow-500" />
              No members found. Try a different search or filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMembers.map(member => (
                <div 
                  key={member.id} 
                  className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                >
                  <img 
                    src={member.profilePicture} 
                    alt={member.displayName}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-blue-100"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">{member.displayName}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Skills: {member.skills.slice(0, 2).join(', ')}
                    {member.skills.length > 2 && '...'}
                  </div>
                  <div className="flex justify-center space-x-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        // TODO: Implement view profile functionality
                        toast('View profile coming soon!', {
                          icon: '👤',
                          style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                          }
                        });
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Events Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Rocket className="mr-3 text-red-500" /> Upcoming Community Events
          </h2>
          {eventsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Rocket className="animate-spin text-red-500 w-12 h-12" />
              <span className="ml-4 text-gray-600">Loading community events...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityEvents.map(event => (
                <div 
                  key={event.id} 
                  className="bg-gray-100 rounded-lg p-6 hover:bg-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <span className="text-sm text-gray-600">{event.date}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="mr-2 w-5 h-5 text-yellow-600" />
                    Organized by {event.organizer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
