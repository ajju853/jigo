import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  success,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Validation border colors
  let stateBorder = 'border-white/10 focus:border-brandIndigo focus:ring-brandIndigo/25';
  if (error) {
    stateBorder = 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20';
  } else if (success) {
    stateBorder = 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20';
  }

  return (
    <div className={`relative w-full mb-4 ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type={currentType}
          id={inputId}
          placeholder=" "
          className={`block w-full px-4 pt-6 pb-2 text-sm text-white bg-white/5 border rounded-xl appearance-none focus:outline-none focus:ring-4 transition-all duration-200 placeholder-transparent ${stateBorder}`}
          {...props}
        />
        
        {label && (
          <label
            htmlFor={inputId}
            className="absolute text-slate-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
          >
            {label}
          </label>
        )}

        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>
      )}
      {!error && success && (
        <p className="mt-1 text-xs text-emerald-400 font-medium">{success}</p>
      )}
      {!error && !success && helperText && (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
