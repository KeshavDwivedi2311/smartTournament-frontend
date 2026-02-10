import React from 'react';
import { LoadingButton } from '../LoadingSpinner';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };
  
  const sizes = {
    sm: 'px-4 py-3 sm:px-3 sm:py-1.5 text-base sm:text-sm rounded-lg sm:rounded-md min-h-[44px] sm:min-h-0',
    md: 'px-5 py-3.5 sm:px-4 sm:py-2 text-base rounded-lg sm:rounded-md min-h-[44px] sm:min-h-0',
    lg: 'px-6 py-4 sm:py-3 text-lg rounded-lg min-h-[48px] sm:min-h-0',
    icon: 'p-3 sm:p-2 rounded-lg sm:rounded-md min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <LoadingButton
      {...props}
      loading={loading}
      disabled={disabled || loading}
      className={classes}
    >
      {children}
    </LoadingButton>
  );
};

export default Button;
