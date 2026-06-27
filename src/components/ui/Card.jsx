import React from 'react';

export const Card = ({
  children,
  hoverable = true,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'glass-panel';
  const hoverStyles = hoverable ? 'glass-panel-hover cursor-pointer' : '';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
