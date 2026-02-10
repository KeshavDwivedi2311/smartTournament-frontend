import React from 'react';
import { statusConfig } from '../../theme/designSystem';
import { getStatusIcon } from '../icons/IconHelper';

const Badge = ({ 
  status, 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const statusInfo = statusConfig[status] || statusConfig.SCHEDULED;
  const IconComponent = getStatusIcon(status);
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };
  
  const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded-full';
  
  return (
    <span 
      className={`${baseClasses} ${sizes[size]} ${className}`} 
      style={{
        backgroundColor: statusInfo.bg,
        color: statusInfo.text,
        border: `1px solid ${statusInfo.color}40`,
      }}
    >
      <IconComponent className={iconSizes[size]} />
      {children || statusInfo.label}
    </span>
  );
};

export default Badge;
