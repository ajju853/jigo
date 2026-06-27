import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { profileAPI } from '../../api/client';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuthStore from '../../stores/authStore';
import useToastStore from '../../stores/toastStore';

export const ProfileForm = ({ profile }) => {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();

  const isJigolo = user?.role === 'jigolo';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: profile?.bio || '',
      price: Number(profile?.pricePerHour || profile?.price || 1500),
      languages: profile?.languages?.join(', ') || '',
      specialties: profile?.specialties?.join(', ') || '',
      profilePhoto: user?.profilePhoto || ''
    }
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone);
      setValue('location', user.location);
      setValue('profilePhoto', user.profilePhoto);
    }
    if (profile) {
      setValue('bio', profile.bio);
      setValue('price', Number(profile.pricePerHour || profile.price || 1500));
      setValue('languages', profile.languages?.join(', '));
      setValue('specialties', profile.specialties?.join(', '));
    }
  }, [user, profile, setValue]);

  const onSubmit = async (data) => {
    try {
      await updateUser({
        name: data.name,
        phone: data.phone,
        location: data.location,
        profilePhoto: data.profilePhoto
      });

      if (isJigolo && profile) {
        const langArr = data.languages.split(',').map(s => s.trim()).filter(Boolean);
        const specArr = data.specialties.split(',').map(s => s.trim()).filter(Boolean);

        await profileAPI.update(profile.id, {
          bio: data.bio,
          pricePerHour: parseInt(data.price),
          languages: langArr,
          specialties: specArr,
        });
      }

      addToast("Profile saved successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to update profile", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" type="text" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
        <Input label="Phone Number" type="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Location" type="text" error={errors.location?.message} {...register('location', { required: 'Location is required' })} />
        <Input label="Profile Photo URL" type="text" error={errors.profilePhoto?.message} {...register('profilePhoto')} />
      </div>

      {isJigolo && (
        <div className="border-t border-white/5 pt-6 mt-6 space-y-4">
          <h3 className="text-md font-heading font-semibold text-white mb-2">Companion Profile Information</h3>
          <Input label="Hourly Rate (₹ INR)" type="number" error={errors.price?.message}
            {...register('price', { required: 'Price per hour is required', min: { value: 200, message: 'Minimum rate is ₹200' } })} />
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Biography</label>
            <textarea
              className="w-full min-h-[120px] p-4 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo focus:ring-4 focus:ring-brandIndigo/25 transition-all duration-200"
              placeholder="Describe yourself to potential clients..."
              {...register('bio', { required: 'Bio is required' })}
            />
            {errors.bio && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.bio.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Languages Spoken (comma separated)" type="text" helperText="e.g. English, Hindi, Spanish" error={errors.languages?.message} {...register('languages')} />
            <Input label="Specialties (comma separated)" type="text" helperText="e.g. Fine Dining, Social Escort, Gym Buddy" error={errors.specialties?.message} {...register('specialties')} />
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" isLoading={isSubmitting} className="mt-6">Save Profile</Button>
    </form>
  );
};

export default ProfileForm;
