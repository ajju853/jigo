import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Share2, Heart, ShieldCheck, MessageSquare, CalendarCheck, Flag, Eye } from 'lucide-react';
import { profileAPI, reviewAPI } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import RatingStars from '../components/ui/RatingStars';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import BookingForm from '../components/forms/BookingForm';
import ReviewForm from '../components/forms/ReviewForm';
import useToastStore from '../stores/toastStore';
import useAuthStore from '../stores/authStore';

export const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('jigo_favorites')) || []
  );
  const reviewLimit = 5;

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => profileAPI.getById(id),
  });

  const { data: reviewsData, isLoading: isLoadingReviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id, reviewPage],
    queryFn: () => reviewAPI.getProfileReviews(id, reviewPage, reviewLimit),
  });
  const reviewsDataNorm = reviewsData?.data || reviewsData || {};
  const reviews = Array.isArray(reviewsDataNorm)
    ? reviewsDataNorm
    : (Array.isArray(reviewsDataNorm.reviews) ? reviewsDataNorm.reviews : []);
  const reviewPagination = reviewsDataNorm.pagination;

  useEffect(() => {
    if (id) {
      profileAPI.getById(id).catch(() => {});
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner className="w-8 h-8 text-brandIndigo" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-400">Companion profile not found.</p>
        <Link to="/browse">
          <Button variant="secondary">Go Back</Button>
        </Link>
      </div>
    );
  }

  const profileData = profile.data || profile;
  const isFavorited = favorites.includes(profileData.id);

  const toggleFavorite = async () => {
    if (!user) {
      addToast('Please log in to save favorites.', 'warning');
      return;
    }
    try {
      const result = await profileAPI.toggleFavorite(profileData.id);
      const data = result.data || result;
      const isFav = data.favorited ?? !isFavorited;
      const updated = isFav
        ? [...favorites, profileData.id]
        : favorites.filter(fid => fid !== profileData.id);
      setFavorites(updated);
      localStorage.setItem('jigo_favorites', JSON.stringify(updated));
      addToast(isFav ? `${profileData.user?.name} added to favorites!` : `${profileData.user?.name} removed from favorites.`, isFav ? 'success' : 'info');
    } catch (err) {
      addToast(err.message || 'Failed to update favorite', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Profile link copied to clipboard!", "success");
  };



  const handleInitiateChat = () => {
    if (!user) {
      addToast("Please log in to message companions.", "warning");
      navigate('/login');
      return;
    }
    addToast(`Initiating chat with ${profileData.user?.name}...`, "success");
    setTimeout(() => navigate('/messages'), 1000);
  };

  const handleBookNow = () => {
    if (!user) {
      addToast("Please log in to book a companion.", "warning");
      navigate('/login');
      return;
    }
    setIsBookingOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <Link to="/browse" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>
        <div className="flex gap-2">
          <button onClick={handleShare} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={toggleFavorite} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all">
            <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-rose-500'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-glass-shadow bg-white/5">
            <img
              src={(profileData.images || [])[activeImageIdx] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'}
              alt={profileData.user?.name || 'Profile'}
              className="w-full h-full object-cover"
            />
          </div>
          {(profileData.images || []).length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {profileData.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border transition-all ${
                    activeImageIdx === idx ? 'border-brandIndigo ring-2 ring-brandIndigo/25' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-2">
                {profileData.user?.name}, {profileData.age}
                {profileData.verified && <ShieldCheck className="w-6 h-6 text-emerald-400 fill-emerald-500/10" />}
              </h1>
              {(profileData.tags || []).map(t => (
                <span key={t} className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold text-white bg-brandIndigo/20 border border-brandIndigo/35 uppercase tracking-wider">
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{profileData.location}</span>
              <span>•</span>
              <RatingStars rating={profileData.rating} count={profileData.reviewsCount} showValue={true} />
              <span>•</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {profileData.profileViews ?? 0} views</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div className="text-center border-r border-white/5 py-1">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Hourly Rate</span>
              <span className="text-xl font-heading font-extrabold text-white">₹{Number(profileData.pricePerHour || profileData.price || 0)}<span className="text-xs text-slate-400 font-medium">/hr</span></span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={handleBookNow} variant="primary" className="flex-1 py-3 text-xs sm:text-sm">Book Now</Button>
              <button onClick={handleInitiateChat} className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-heading font-semibold text-white uppercase tracking-wide border-b border-white/5 pb-2">Biography</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{profileData.bio}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h3 className="text-sm font-heading font-semibold text-white uppercase tracking-wide border-b border-white/5 pb-2">Specialties</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(profileData.specialties || []).map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">{s}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-heading font-semibold text-white uppercase tracking-wide border-b border-white/5 pb-2">Languages</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(profileData.languages || []).map(l => (
                  <span key={l} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-white/5 pt-10 mt-10">
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brandIndigo" /> Available Packages
          </h3>
          <div className="space-y-3">
            {(profileData.services || []).map(pkg => (
              <Card key={pkg.id || pkg.name} hoverable={false} padding="sm" className="bg-white/5">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-white">{pkg.name}</h4>
                  <span className="text-sm font-extrabold text-brandIndigo">₹{pkg.price}</span>
                </div>
                <span className="text-xs text-slate-400">{pkg.duration} {pkg.duration === 1 ? 'Hour' : 'Hours'} duration</span>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-lg font-heading font-semibold text-white">
              Reviews & Feedback ({reviewPagination?.total ?? reviews.length})
            </h3>
            {user && user.role === 'customer' && (
              <button onClick={() => setIsReviewOpen(true)} className="text-xs text-brandIndigo font-semibold hover:underline">Write a Review</button>
            )}
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No reviews submitted yet for this companion.</p>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-white">{rev.reviewerName || rev.reviewer?.name}</h4>
                    <span className="text-[10px] text-slate-400">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <RatingStars rating={rev.rating} size="sm" />
                  <p className="text-xs text-slate-400 leading-relaxed">{rev.comment || rev.text}</p>
                </div>
              ))
            )}
            {reviewPagination && reviewPagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button onClick={() => setReviewPage(p => Math.max(1, p - 1))} disabled={reviewPage <= 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Previous</button>
                <span className="px-3 py-1.5 text-xs text-slate-400">Page {reviewPage} of {reviewPagination.totalPages}</span>
                <button onClick={() => setReviewPage(p => Math.min(reviewPagination.totalPages, p + 1))} disabled={reviewPage >= reviewPagination.totalPages} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} title={`Book ${profileData.user?.name}`} size="md">
        <BookingForm profile={profileData} onComplete={() => { setIsBookingOpen(false); navigate('/dashboard'); }} />
      </Modal>

      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Write a Review" size="sm">
        <ReviewForm
          profileId={profileData.id}
          onComplete={async () => {
            setIsReviewOpen(false);
            await refetchReviews();
            await refetch();
          }}
        />
      </Modal>
    </div>
  );
};

export default ProfilePage;
