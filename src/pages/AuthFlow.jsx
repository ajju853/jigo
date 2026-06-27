import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import LoginForm from '../components/forms/LoginForm';
import SignupForm from '../components/forms/SignupForm';

const AuthFlow = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuthStore();
  const [step, setStep] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // We can track onboarding analytics here if we implement the endpoint
  const trackOnboarding = async (action, data) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      await fetch('http://localhost:5000/api/activities', { // Adjust if needed
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activityType: action,
          details: data
        })
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const handleLoginSubmit = async (e, formData) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await login(formData);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-darkBg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome to Jigo
          </h1>
          <p className="text-gray-400 mt-2">
            {step === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        {/* Auth Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-lg">
          <button
            onClick={() => setStep('login')}
            className={`flex-1 py-2 rounded-lg transition ${
              step === 'login' 
                ? 'bg-brandPurple text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setStep('signup')}
            className={`flex-1 py-2 rounded-lg transition ${
              step === 'signup' 
                ? 'bg-brandPurple text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {step === 'login' ? (
          <LoginForm />
        ) : (
          <SignupForm />
        )}

        {/* Forgot Password Link */}
        {step === 'login' && (
          <div className="text-center mt-4">
            <button 
              className="text-sm text-brandPurple hover:text-brandPurple/80 transition"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;
