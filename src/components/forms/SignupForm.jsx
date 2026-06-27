import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuthStore from '../../stores/authStore';
import useToastStore from '../../stores/toastStore';

export const SignupForm = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      dateOfBirth: '',
      gender: '',
      terms: false
    }
  });

  const password = watch('password', '');

  // Calculate password strength
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const handlePasswordChange = (e) => {
    const strength = calculateStrength(e.target.value);
    setPasswordStrength(strength);
  };

  const validateAge = (dob) => {
    if (!dob) return false;
    const date = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age >= 18 || 'You must be at least 18 years old to register.';
  };

  const onSubmit = async (data) => {
    try {
      const user = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender
      });
      addToast(`Account created successfully! Welcome, ${user.name}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Failed to sign up', 'error');
    }
  };

  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Role Selection Slider */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 text-center">
          I want to register as a:
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/5 rounded-xl">
          <label className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
            watch('role') === 'customer' 
              ? 'bg-gradient-to-r from-brandIndigo to-brandPurple text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}>
            <input
              type="radio"
              value="customer"
              className="sr-only"
              {...register('role')}
            />
            Customer
          </label>
          <label className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
            watch('role') === 'jigolo' 
              ? 'bg-gradient-to-r from-brandIndigo to-brandPurple text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}>
            <input
              type="radio"
              value="jigolo"
              className="sr-only"
              {...register('role')}
            />
            Jigolo Companion
          </label>
        </div>
      </div>

      <Input
        label="Full Name"
        type="text"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />

      <Input
        label="Email Address"
        type="email"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth', {
            required: 'Date of birth is required',
            validate: validateAge
          })}
        />
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Gender
          </label>
          <select
            className={`w-full bg-white/5 border ${errors.gender ? 'border-rose-500' : 'border-white/10'} rounded-lg p-2.5 text-sm text-white focus:border-brandPurple outline-none transition`}
            {...register('gender', { required: 'Gender is required' })}
          >
            <option value="" disabled className="text-gray-500">Select Gender</option>
            <option value="Male" className="bg-darkBg text-white">Male</option>
            <option value="Female" className="bg-darkBg text-white">Female</option>
            <option value="Non-Binary" className="bg-darkBg text-white">Non-Binary</option>
            <option value="Other" className="bg-darkBg text-white">Other</option>
            <option value="Prefer not to say" className="bg-darkBg text-white">Prefer not to say</option>
          </select>
          {errors.gender && <p className="text-rose-400 text-[10px] font-semibold mt-1">{errors.gender.message}</p>}
        </div>
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            },
            onChange: handlePasswordChange
          })}
        />
        {/* Password Strength indicator */}
        {password.length > 0 && (
          <div className="px-1 mb-2">
            <div className="flex gap-1.5 h-1.5 mb-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 rounded-full transition-colors duration-300 ${
                    step <= passwordStrength 
                      ? strengthColors[passwordStrength - 1] 
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Strength</span>
              <span className={passwordStrength > 0 ? strengthColors[passwordStrength - 1].replace('bg-', 'text-') : ''}>
                {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        type="password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (val) => val === password || 'Passwords do not match'
        })}
      />

      <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer hover:text-white pt-1">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded bg-white/5 border-white/10 text-brandIndigo focus:ring-brandIndigo/50"
          {...register('terms', { required: 'You must agree to the terms & conditions' })}
        />
        <div>
          I agree to the{' '}
          <a href="#" className="text-brandIndigo hover:underline">
            Terms & Conditions
          </a>{' '}
          and Safety Policy.
          {errors.terms && <p className="text-rose-400 text-[10px] font-semibold mt-0.5">{errors.terms.message}</p>}
        </div>
      </label>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        className="mt-6"
      >
        Create Account
      </Button>

      <div className="text-center text-xs text-slate-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-brandIndigo hover:underline">
          Log In
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;
