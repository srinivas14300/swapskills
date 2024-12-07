import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Skill {
  id: string;
  skillName: string;
  category: string;
  description: string;
  proficiencyLevel?: string;
  type: 'offer' | 'request';
  userEmail: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
}

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    'Programming Languages',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'DevOps',
    'Data Science',
    'Machine Learning',
  ];

  useEffect(() => {
    const unsubscribeSkills = onSnapshot(
      query(collection(getFirestore(), 'skills'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const skillsData: Skill[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
        setSkills(skillsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching skills:', error);
        toast.error('Failed to load skills');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeSkills();
    };
  }, []);

  const clearSkills = () => {
    setSkills([]);
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-16 py-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Exchange Skills, <span className="text-blue-600">Grow Together</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect with experts in software development and IoT. Share knowledge, learn new skills, and build your network.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/post-skill">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Post Your Skill
              </Button>
            </Link>
            <Link to="/need-skill">
              <Button variant="outline" size="lg">Request Skill</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for skills or courses..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Skills</h2>
          <div className="flex gap-4">
            <Button
              variant={selectedCategory === 'offer' ? "default" : "outline"}
              onClick={() => setSelectedCategory(selectedCategory === 'offer' ? null : 'offer')}
            >
              Skills Offered
            </Button>
            <Button
              variant={selectedCategory === 'request' ? "default" : "outline"}
              onClick={() => setSelectedCategory(selectedCategory === 'request' ? null : 'request')}
            >
              Skills Needed
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading skills...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No skills found. Be the first to post a skill!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="rounded-lg bg-white p-6 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{skill.skillName}</h3>
                    <p className="text-sm text-gray-500">{skill.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    skill.type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {skill.type === 'offer' ? 'Offering' : 'Seeking'}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{skill.description}</p>
                {skill.proficiencyLevel && (
                  <p className="mt-2 text-sm text-gray-500">
                    Level: {skill.proficiencyLevel}
                  </p>
                )}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{skill.userEmail}</span>
                  <Button variant="outline" size="sm">Contact</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}