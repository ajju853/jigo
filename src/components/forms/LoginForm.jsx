import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuthStore from '../../stores/authStore';
import useToastStore from '../../stores/toastStore';

export const LoginForm = () => {
  const { login, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Failed to login', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Input
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
      />

      <div className="flex items-center justify-between text-xs text-slate-400">
        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            className="w-4 h-4 rounded bg-white/5 border-white/10 text-brandIndigo focus:ring-brandIndigo/50"
            {...register('rememberMe')}
          />
          Remember Me
        </label>
        <button 
          type="button" 
          onClick={() => addToast("Reset password link sent to your email (Mock)", "info")}
          className="hover:underline hover:text-white"
        >
          Forgot Password?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        className="mt-6"
      >
        Sign In
      </Button>

      <div className="text-center text-xs text-slate-500 mt-4">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brandIndigo hover:underline">
          Sign Up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
