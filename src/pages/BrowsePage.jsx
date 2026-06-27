import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Heart, SlidersHorizontal, ShieldCheck, X } from 'lucide-react';
import { profileAPI } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import RatingStars from '../components/ui/RatingStars';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import useAuthStore from '../stores/authStore';
import useToastStore from '../stores/toastStore';

export const BrowsePage = () => {
  const { user, token } = useAuthStore();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('All');
  const [priceRange, setPriceRange] = useState(5000);
  const [ageRange, setAgeRange] = useState('All');
  const [rating, setRating] = useState(0);
  const [sortBy, setSortBy] = useState('Relevance');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(
    JSON.parse(localStorage.getItem('jigo_favorites')) || []
  );

  const itemsPerPage = 6;

  const filters = {
    search, gender, minPrice: 500, maxPrice: priceRange,
    ageRange, rating, sortBy, page, limit: itemsPerPage,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => profileAPI.browse(filters),
    placeholderData: (prev) => prev,
  });

  const responseData = data?.data || data || {};
  const profiles = Array.isArray(responseData)
    ? responseData
    : (Array.isArray(responseData.profiles) ? responseData.profiles : []);
  const totalPages = responseData.pagination?.totalPages || responseData.totalPages || 1;

  const toggleFavorite = async (profileId, name) => {
    if (!user) {
      addToast('Please log in to save favorites.', 'warning');
      return;
    }
    try {
      const result = await profileAPI.toggleFavorite(profileId, token);
      const data = result.data || result;
      const isFav = data.favorited ?? !favoriteIds.includes(profileId);
      const updated = isFav
        ? [...favoriteIds, profileId]
        : favoriteIds.filter(id => id !== profileId);
      setFavoriteIds(updated);
      localStorage.setItem('jigo_favorites', JSON.stringify(updated));
      addToast(
        isFav ? `${name} added to favorites!` : `${name} removed from favorites.`,
        isFav ? 'success' : 'info'
      );
    } catch (err) {
      addToast(err.message || 'Failed to update favorite', 'error');
    }
  };

  const handleClearFilters = () => {
    setSearch(''); setGender('All'); setPriceRange(5000); setAgeRange('All');
    setRating(0); setSortBy('Relevance'); setPage(1);
    addToast('Filters cleared.', 'info');
  };

  const FilterControls = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-base font-heading font-semibold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brandIndigo" /> Filter Companion
        </h3>
        <button onClick={handleClearFilters} className="text-xs text-brandIndigo hover:underline">Clear All</button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Gender</label>
        <select
          value={gender}
          onChange={(e) => { setGender(e.target.value); setPage(1); }}
          className="w-full px-3 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo"
        >
          <option value="All" className="bg-darkSurface">All Genders</option>
          <option value="Male" className="bg-darkSurface">Male</option>
          <option value="Female" className="bg-darkSurface">Female</option>
          <option value="Non-binary" className="bg-darkSurface">Non-binary</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <span>Max Price</span>
          <span className="text-white font-bold">₹{priceRange}/hr</span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          value={priceRange}
          onChange={(e) => { setPriceRange(parseInt(e.target.value)); setPage(1); }}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brandIndigo"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>₹500</span>
          <span>₹5,000</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Age Bracket</label>
        <select
          value={ageRange}
          onChange={(e) => { setAgeRange(e.target.value); setPage(1); }}
          className="w-full px-3 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo"
        >
          <option value="All" className="bg-darkSurface">All Ages</option>
          <option value="18-25" className="bg-darkSurface">18 - 25 years</option>
          <option value="26-35" className="bg-darkSurface">26 - 35 years</option>
          <option value="36-45" className="bg-darkSurface">36 - 45 years</option>
          <option value="45+" className="bg-darkSurface">45+ years</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Minimum Rating</label>
        <div className="flex flex-col gap-2">
          {[0, 4.5, 4.0, 3.0].map((rate) => (
            <label key={rate} className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer hover:text-white">
              <input
                type="radio"
                name="rating_filter"
                checked={rating === rate}
                onChange={() => { setRating(rate); setPage(1); }}
                className="w-4 h-4 bg-transparent border-white/20 text-brandIndigo focus:ring-brandIndigo/50"
              />
              {rate === 0 ? 'Any Rating' : `${rate}+ Stars`}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Sort Results By</label>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="w-full px-3 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo"
        >
          <option value="Relevance" className="bg-darkSurface">Relevance</option>
          <option value="Price: Low-High" className="bg-darkSurface">Price: Low to High</option>
          <option value="Price: High-Low" className="bg-darkSurface">Price: High to Low</option>
          <option value="Rating" className="bg-darkSurface">Highest Rated</option>
          <option value="Newest" className="bg-darkSurface">New Members</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Browse Companions</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Find verified, elite social escorts and local buddies.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="md:hidden flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setShowMobileFilters(true)} iconLeft={SlidersHorizontal}>
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="hidden md:block col-span-1 glass-panel border border-white/5 p-6 h-fit sticky top-24">
          <FilterControls />
        </aside>

        <main className="col-span-1 md:col-span-3 space-y-6">
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Spinner className="w-8 h-8 text-brandIndigo" />
            </div>
          ) : error ? (
            <p className="text-rose-400 text-center py-10">An error occurred loading companion profiles.</p>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20 glass-panel border border-white/5">
              <p className="text-sm text-slate-500 mb-2">No matching companions found.</p>
              <button onClick={handleClearFilters} className="text-xs text-brandIndigo font-semibold hover:underline">Reset all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map(p => (
                  <Card key={p.id} hoverable={true} padding="none" className="overflow-hidden flex flex-col group h-full bg-white/5">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'}
                        alt={p.name || p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-darkBg/95 via-transparent to-transparent opacity-90" />
                      {(p.tags || []).slice(0, 2).map(t => (
                        <span key={t} className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                      <button
                        onClick={(e) => { e.preventDefault(); toggleFavorite(p.id, p.name || p.title); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${favoriteIds.includes(p.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-white'}`} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white truncate flex items-center gap-1">
                            {p.name || p.title}, {p.age}
                            {p.verified && <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-500/10" />}
                          </h3>
                          <span className="text-xs font-bold text-brandIndigo whitespace-nowrap">₹{Number(p.pricePerHour || p.price || 0)}/hr</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{p.location || p.user?.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-auto">
                        <RatingStars rating={p.rating} count={p.reviewsCount || p.reviews_count} size="sm" />
                        <Link to={`/profile/${p.id}`}>
                          <Button variant="secondary" size="sm" className="py-1 px-3.5 text-xs font-bold">View Profile</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            </>
          )}
        </main>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-80 bg-darkSurface border-l border-white/10 p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto z-10 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-heading font-semibold text-white">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterControls />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
