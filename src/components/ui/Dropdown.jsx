import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  className = '',
  placeholder = 'Select option'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 focus:outline-none focus:border-brandIndigo transition-all"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 left-0 z-30 mt-2 py-1.5 glass-panel bg-darkSurface border border-white/10 shadow-2xl max-h-60 overflow-y-auto animate-fade-in-up">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${value === option.value ? 'text-brandIndigo font-semibold bg-white/5' : 'text-slate-300'}`}
            >
              {option.label}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-4 py-2 text-sm text-slate-500 text-center">No options available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
