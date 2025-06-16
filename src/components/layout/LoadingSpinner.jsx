import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${sizes[size]} border-t-emerald-500 border-b-emerald-300 border-l-emerald-300 border-r-emerald-300`}></div>
    </div>
  );
};

export default LoadingSpinner;