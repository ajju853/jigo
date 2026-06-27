import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 5,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  count,
  showValue = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
  };

  const currentRating = hoverRating || rating;

  const handleStarClick = (idx) => {
    if (interactive && onChange) {
      onChange(idx);
    }
  };

  const handleMouseEnter = (idx) => {
    if (interactive) setHoverRating(idx);
  };

  const handleMouseLeave = () => {
    if (interactive) setHoverRating(0);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxStars; i++) {
      let isFilled = false;
      let isHalf = false;

      if (i <= Math.floor(currentRating)) {
        isFilled = true;
      } else if (i === Math.ceil(currentRating) && currentRating % 1 >= 0.3) {
        if (interactive) {
          isFilled = true; // Round up for interactive hover clarity
        } else {
          isHalf = true;
        }
      }

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer focus:outline-none transition-transform active:scale-125' : 'cursor-default'}`}
        >
          <div className="relative">
            {isHalf && (
              <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
                <Star className={`${sizes[size]} text-amber-400 fill-amber-400`} />
              </div>
            )}
            <Star
              className={`${sizes[size]} ${
                isFilled 
                  ? 'text-amber-400 fill-amber-400' 
                  : isHalf 
                    ? 'text-slate-600 fill-transparent' 
                    : 'text-slate-600'
              }`}
            />
          </div>
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{renderStars()}</div>
      {showValue && (
        <span className="text-sm font-semibold text-white ml-0.5">
          {parseFloat(rating).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-400 ml-1">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
