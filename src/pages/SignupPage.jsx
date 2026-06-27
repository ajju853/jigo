import React from 'react';
import SignupForm from '../components/forms/SignupForm';

export const SignupPage = () => {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brandPurple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 border border-white/10 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-r from-brandIndigo to-brandPurple items-center justify-center font-heading text-white font-extrabold text-lg shadow-neon-purple mx-auto">
            J
          </div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-wide">Create Account</h2>
          <p className="text-xs text-slate-400">
            Join the Jigo network as a client or companion today.
          </p>
        </div>

        {/* Form */}
        <SignupForm />

      </div>
    </div>
  );
};

export default SignupPage;
