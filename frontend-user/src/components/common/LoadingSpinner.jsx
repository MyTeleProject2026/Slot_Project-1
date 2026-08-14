import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-24 h-24' };
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin`} />
      <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
    </div>
  );
  if (fullScreen) {
    return <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50">{spinner}</div>;
  }
  return spinner;
};

export default LoadingSpinner;