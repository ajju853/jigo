import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { reviewAPI } from '../../api/client';
import RatingStars from '../ui/RatingStars';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useToastStore from '../../stores/toastStore';

export const ReviewForm = ({ profileId, bookingId, onComplete }) => {
  const { addToast } = useToastStore();
  const [rating, setRating] = useState(5);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      reviewerName: '',
      text: '',
      anonymous: false
    }
  });

  const onSubmit = async (data) => {
    try {
      await reviewAPI.create({
        bookingId,
        profileId,
        rating,
        comment: data.text,
        isAnonymous: data.anonymous,
      });
      addToast("Review submitted successfully!", "success");
      reset();
      setRating(5);
      if (onComplete) onComplete();
    } catch (err) {
      addToast(err.message || "Failed to submit review", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Your Rating</label>
        <RatingStars rating={rating} interactive={true} onChange={(val) => setRating(val)} size="lg" />
      </div>

      <div className="flex items-center gap-2 cursor-pointer hover:text-white pt-1">
        <input
          type="checkbox"
          id="anonymous"
          className="w-4 h-4 rounded bg-white/5 border-white/10 text-brandIndigo focus:ring-brandIndigo/50"
          {...register('anonymous')}
        />
        <label htmlFor="anonymous" className="text-xs text-slate-400 cursor-pointer">Submit anonymously</label>
      </div>

      {!watch('anonymous') && (
        <Input
          label="Your Name (Optional)"
          type="text"
          error={errors.reviewerName?.message}
          {...register('reviewerName')}
        />
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Review Content</label>
        <textarea
          className="w-full min-h-[100px] p-4 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo focus:ring-4 focus:ring-brandIndigo/25 transition-all duration-200"
          placeholder="Share your experience with this companion..."
          {...register('text', { required: 'Review details are required' })}
        />
        {errors.text && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.text.message}</p>}
      </div>

      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
