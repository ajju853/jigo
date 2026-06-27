import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { profileAPI } from '../api/client';
import BookingForm from '../components/forms/BookingForm';
import Spinner from '../components/ui/Spinner';

export const BookingFlow = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => profileAPI.getById(profileId),
  });

  const profile = data?.data || data;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner className="w-8 h-8 text-brandIndigo" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-400">Companion profile not found.</p>
        <Link to="/browse">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white">Go to Browse</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link to={`/profile/${profileId}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Cancel & Go to Profile
      </Link>
      <div className="glass-panel p-8 border border-white/10">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">Complete Your Booking</h2>
          <p className="text-xs text-slate-400 mt-1">Book your companion session with {profile.name}.</p>
        </div>
        <BookingForm profile={profile} onComplete={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

export default BookingFlow;
