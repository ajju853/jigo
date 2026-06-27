import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Styles logic
  const baseStyles = 'inline-flex items-center justify-center font-heading font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brandIndigo/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brandIndigo to-brandPurple text-white shadow-lg hover:shadow-neon-indigo hover:brightness-110',
    secondary: 'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg hover:shadow-neon-rose hover:brightness-110',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <Spinner className="w-4 h-4 mr-2" />}
      {!isLoading && IconLeft && <IconLeft className="w-4 h-4 mr-2" />}
      {children}
      {!isLoading && IconRight && <IconRight className="w-4 h-4 ml-2" />}
    </button>
  );
};

export default Button;
