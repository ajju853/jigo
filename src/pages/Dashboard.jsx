import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, IndianRupee, Eye, Star, TrendingUp, Check, X } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useBookingStore from '../stores/bookingStore';
import useToastStore from '../stores/toastStore';
import { profileAPI } from '../api/client';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import RatingStars from '../components/ui/RatingStars';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { bookings, isLoading, fetchBookings, confirmBooking } = useBookingStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (user) {
      fetchBookings({ limit: 50 });
    }
  }, [user]);

  const handleBookingAction = async (bookingId, action) => {
    try {
      if (action === 'accept') {
        await confirmBooking(bookingId);
      } else {
        await useBookingStore.getState().cancelBooking(bookingId, 'Declined by jigolo');
      }
      addToast(`Booking ${action === 'accept' ? 'accepted' : 'declined'} successfully.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update booking status', 'error');
    }
  };

  const isJigolo = user?.role === 'jigolo';

  const { data: companionData } = useQuery({
    queryKey: ['dashboardProfile', user?.id],
    queryFn: async () => {
      const response = await profileAPI.browse({ userId: user.id });
      const data = response.data || response;
      return (data.profiles || []).find(p => p.userId === user.id) || null;
    },
    enabled: !!user && isJigolo,
  });

  const { data: recommendedData } = useQuery({
    queryKey: ['recommendedProfiles'],
    queryFn: () => profileAPI.browse({ limit: 6, sortBy: 'rating', minRating: 4 }),
    enabled: !!user && !isJigolo,
  });

  if (isLoading && bookings.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner className="w-8 h-8 text-brandIndigo" />
      </div>
    );
  }

  // Redirect to onboarding if jigolo has no profile
  if (isJigolo && companionData === null) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-brandPurple/20 rounded-full flex items-center justify-center text-brandPurple mb-2">
          <Star size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
        <p className="text-slate-400 max-w-md text-center">
          You need to set up your profile before you can access the dashboard and start receiving bookings.
        </p>
        <Link to="/onboarding">
          <Button variant="primary" size="lg" className="mt-4 text-white">
            Set Up Profile Now
          </Button>
        </Link>
      </div>
    );
  }

  if (isJigolo) {
    const companion = companionData || {};
    const stats = {
      totalEarnings: bookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0),
      profileViews: companion.profileViews || 0,
      rating: Number(companion.rating || 0),
    };
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
    const completedBookings = bookings.filter(b => b.status === 'completed');

    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Welcome back, {user?.name}. Here is your profile activity.</p>
          </div>
          <Link to="/settings">
            <Button variant="secondary" size="sm">Manage Availability</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hoverable={false} padding="sm" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Total Revenue</span>
              <h3 className="text-xl font-heading font-bold text-white">₹{stats.totalEarnings}</h3>
            </div>
          </Card>

          <Card hoverable={false} padding="sm" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brandIndigo/10 border border-brandIndigo/25 flex items-center justify-center text-brandIndigo">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Profile Views</span>
              <h3 className="text-xl font-heading font-bold text-white">{stats.profileViews}</h3>
            </div>
          </Card>

          <Card hoverable={false} padding="sm" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Pending Requests</span>
              <h3 className="text-xl font-heading font-bold text-white">{pendingBookings.length}</h3>
            </div>
          </Card>

          <Card hoverable={false} padding="sm" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brandPurple/10 border border-brandPurple/25 flex items-center justify-center text-brandPurple">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">My Rating</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white">{stats.rating}</span>
                <RatingStars rating={stats.rating} size="sm" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card hoverable={false} className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-heading font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brandIndigo" /> Weekly Earnings Trend
              </h3>
              <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">Last 4 Weeks</span>
            </div>
            <div className="w-full h-48 bg-black/10 rounded-xl relative flex items-end px-4 pb-2 pt-6">
              <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 150">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <path d="M 10 120 Q 100 80, 200 40 T 390 10 L 390 140 L 10 140 Z" fill="url(#chartGrad)" />
                <path d="M 10 120 Q 100 80, 200 40 T 390 10" fill="none" stroke="#6366f1" strokeWidth="3" />
                <circle cx="10" cy="120" r="4" fill="#8b5cf6" />
                <circle cx="130" cy="90" r="4" fill="#8b5cf6" />
                <circle cx="260" cy="30" r="4" fill="#8b5cf6" />
                <circle cx="390" cy="10" r="4" fill="#8b5cf6" />
              </svg>
              <div className="flex justify-between w-full text-[10px] text-slate-500 font-semibold uppercase tracking-wider relative z-10">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4 (Current)</span>
              </div>
            </div>
          </Card>

          <Card hoverable={false} className="space-y-4">
            <h3 className="text-base font-heading font-semibold text-white">Upcoming Schedule</h3>
            {upcomingBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No upcoming bookings</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {upcomingBookings.slice(0, 5).map(b => (
                  <li key={b.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div>
                      <span className="text-slate-400 block">{b.date}</span>
                      <span className="text-white font-medium">{b.startTime} - {b.endTime}</span>
                    </div>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg text-[10px] font-bold">{b.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card hoverable={false} className="space-y-4">
            <h3 className="text-base font-heading font-semibold text-white">Pending Booking Requests ({pendingBookings.length})</h3>
            {pendingBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No pending requests available.</p>
            ) : (
              <div className="space-y-3.5">
                {pendingBookings.map(b => (
                  <div key={b.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.customer?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                        alt={b.customer?.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{b.customer?.name}</h4>
                        <span className="text-xs text-slate-400">{b.date} at {b.startTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBookingAction(b.id, 'accept')}
                        className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBookingAction(b.id, 'reject')}
                        className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card hoverable={false} className="space-y-4">
            <h3 className="text-base font-heading font-semibold text-white">Upcoming Appointments ({upcomingBookings.length})</h3>
            {upcomingBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No upcoming bookings scheduled.</p>
            ) : (
              <div className="space-y-3.5">
                {upcomingBookings.map(b => (
                  <div key={b.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.customer?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                        alt={b.customer?.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{b.customer?.name}</h4>
                        <span className="text-xs text-slate-400">{b.date} at {b.startTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">₹{Number(b.totalPrice || 0)}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg capitalize">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const recommendedProfiles = recommendedData?.data?.profiles || recommendedData?.profiles || [];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Welcome back, {user?.name}. Manage your appointments and companion requests.</p>
        </div>
        <Link to="/browse">
          <Button variant="primary" size="sm">Browse Companions</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card hoverable={false} className="space-y-4">
            <h3 className="text-base font-heading font-semibold text-white">My Active Bookings</h3>
            {activeBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-500 mb-4">You have no active bookings at the moment.</p>
                <Link to="/browse">
                  <Button variant="secondary" size="sm">Book a Companion</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map(b => (
                  <div key={b.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={b.profile?.images?.[0] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'}
                        alt={b.profile?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/5"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{b.profile?.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{b.date} at {b.startTime}</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <span className="text-sm font-bold text-white">₹{Number(b.totalPrice || 0)}</span>
                      <span className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-lg capitalize ${
                        b.status === 'confirmed'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card hoverable={false} className="space-y-4">
            <h3 className="text-base font-heading font-semibold text-white">Booking History</h3>
            {pastBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No past booking records.</p>
            ) : (
              <div className="space-y-3.5">
                {pastBookings.map(b => (
                  <div key={b.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.profile?.images?.[0] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'}
                        alt={b.profile?.name}
                        className="w-9 h-9 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-white">{b.profile?.name}</h4>
                        <span className="text-[10px] text-slate-400">{b.date} • ₹{Number(b.totalPrice || 0)}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-lg capitalize ${
                      b.status === 'completed'
                        ? 'text-slate-400 bg-white/5 border-white/10'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card hoverable={false} className="space-y-4">
            <h3 className="text-base font-heading font-semibold text-white">Recommended for You</h3>
            <div className="space-y-4">
              {recommendedProfiles.slice(0, 3).map(p => (
                <Link to={`/profile/${p.id}`} key={p.id} className="block group">
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'}
                      alt={p.name || p.title}
                      className="w-11 h-11 rounded-lg object-cover border border-white/5 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-brandIndigo transition-colors">{p.name || p.title}, {p.age}</h4>
                      <span className="block text-[10px] text-slate-400 truncate">{p.location}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-xs font-bold text-white">₹{Number(p.pricePerHour || p.price || 0)}/hr</span>
                      <div className="flex items-center gap-0.5 text-[10px] text-amber-400 justify-end">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
