import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Search, Filter } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    gender: '',
    sortBy: 'relevance'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchParams({ q: filters.query });
    setLoading(true);

    try {
      const queryStr = new URLSearchParams(filters).toString();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:5000/api/search/profiles?${queryStr}`, {
        headers
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search companions, services, locations..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="pl-12"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            <Button type="submit" variant="primary">
              Search
            </Button>
            
            <Button 
              type="button"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </form>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-darkSurface border border-gray-700 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           <div>
             <label className="block text-sm text-gray-400 mb-1">Min Price</label>
             <Input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
           </div>
           <div>
             <label className="block text-sm text-gray-400 mb-1">Max Price</label>
             <Input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
           </div>
           <div>
             <label className="block text-sm text-gray-400 mb-1">Sort By</label>
             <select 
               className="w-full bg-darkBg border border-gray-700 rounded-lg p-2 text-white focus:border-brandPurple outline-none transition"
               value={filters.sortBy} 
               onChange={(e) => handleFilterChange('sortBy', e.target.value)}
             >
               <option value="relevance">Relevance</option>
               <option value="rating">Rating</option>
               <option value="price_asc">Price: Low to High</option>
               <option value="price_desc">Price: High to Low</option>
               <option value="newest">Newest</option>
             </select>
           </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.length === 0 ? (
            <p className="text-gray-400 text-center col-span-full py-12">No profiles found.</p>
          ) : (
            results.map(profile => (
              <div key={profile.id} className="bg-darkSurface rounded-xl overflow-hidden border border-gray-700 hover:border-brandPurple/50 transition">
                <div className="h-48 bg-gray-800 relative">
                  {profile.user?.profilePhoto && (
                    <img src={profile.user.profilePhoto} alt={profile.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white">{profile.title}</h3>
                  <p className="text-brandPurple font-medium">${profile.pricePerHour}/hr</p>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{profile.bio}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
