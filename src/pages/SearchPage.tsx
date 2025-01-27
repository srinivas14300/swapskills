import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, Filter, Users, Briefcase } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface SearchResult {
  id: string;
  type: 'skill' | 'user' | 'event';
  title: string;
  description?: string;
  imageUrl?: string;
}

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'skills' | 'users' | 'events'>('all');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    setSearchQuery(query);

    if (query) {
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      // Input validation
      if (!query || query.trim().length < 2) {
        toast.error('Search query must be at least 2 characters long');
        setLoading(false);
        return;
      }

      const results: SearchResult[] = [];

      // Search Skills 
      try {
        const skillsQuery = query(
          collection(db, 'skills'),
          where('skillName', '>=', query),
          where('skillName', '<=', query + '\uf8ff')
        );
        const skillsSnapshot = await getDocs(skillsQuery);
        
        skillsSnapshot.forEach((doc) => {
          const skillData = doc.data();
          if (skillData) {
            results.push({
              id: doc.id,
              type: 'skill',
              title: skillData.skillName,
              description: skillData.description || 'No description',
              imageUrl: skillData.imageUrl || undefined
            });
          }
        });
      } catch (skillError) {
        console.error('Error searching skills:', skillError);
        toast.error('Failed to search skills. Please try again.');
      }

      // Search Users 
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('displayName', '>=', query),
          where('displayName', '<=', query + '\uf8ff')
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData) {
            results.push({
              id: doc.id,
              type: 'user',
              title: userData.displayName,
              description: userData.email || 'No email',
              imageUrl: userData.photoURL || undefined
            });
          }
        });
      } catch (userError) {
        console.error('Error searching users:', userError);
        toast.error('Failed to search users. Please try again.');
      }

      // Filter results if needed
      const filteredResults = filter === 'all' 
        ? results 
        : results.filter(result => result.type === filter.slice(0, -1));

      setSearchResults(filteredResults);
      setLoading(false);

      if (filteredResults.length === 0) {
        toast.info('No results found. Try a different search term.');
      }
    } catch (error) {
      console.error('Comprehensive search error:', error);
      toast.error('An unexpected error occurred during search.');
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Search</h1>
      
      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-6">
        <div className="relative">
          <Input 
            type="text"
            placeholder="Search skills, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4"
          />
          <Search className="absolute left-3 top-3 text-gray-400" />
          <Button type="submit" className="absolute right-1 top-1">
            Search
          </Button>
        </div>
      </form>

      {/* Filter Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        {['all', 'skills', 'users'].map((filterType) => (
          <Button 
            key={filterType}
            variant={filter === filterType ? 'solid' : 'outline'}
            onClick={() => setFilter(filterType as any)}
            className="capitalize"
          >
            {filterType}
          </Button>
        ))}
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : searchResults.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((result) => (
            <div 
              key={result.id} 
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition"
            >
              {result.imageUrl && (
                <img 
                  src={result.imageUrl} 
                  alt={result.title} 
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{result.title}</h2>
              <p className="text-gray-600 mb-2">{result.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                {result.type === 'skill' && <Briefcase className="mr-2" />}
                {result.type === 'user' && <Users className="mr-2" />}
                <span className="capitalize">{result.type}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No results found for "{searchQuery}"
        </p>
      )}
    </div>
  );
};

export default SearchPage;
