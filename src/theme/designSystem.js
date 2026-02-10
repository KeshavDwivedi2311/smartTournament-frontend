// Design System - Consistent colors, spacing, and typography

export const colors = {
  // Primary colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  
  // Status colors
  status: {
    scheduled: '#F59E0B',  // Amber
    ready: '#3B82F6',      // Blue
    ongoing: '#10B981',    // Green
    completed: '#6B7280',  // Gray
    next: '#8B5CF6',       // Purple
  },
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  neutral: '#6B7280',
  
  // Background colors
  bg: {
    light: '#F9FAFB',
    white: '#FFFFFF',
    gray: '#F3F4F6',
  },
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  full: '9999px',
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

// Status badge configurations - using icon names instead of emojis
export const statusConfig = {
  SCHEDULED: {
    color: colors.status.scheduled,
    bg: '#FEF3C7',
    text: '#92400E',
    label: 'Scheduled',
    icon: 'Calendar', // Icon name for lucide-react
  },
  READY: {
    color: colors.status.ready,
    bg: '#DBEAFE',
    text: '#1E40AF',
    label: 'Ready',
    icon: 'CheckCircle2', // Icon name for lucide-react
  },
  NEXT: {
    color: colors.status.next,
    bg: '#EDE9FE',
    text: '#6D28D9',
    label: 'Next Up',
    icon: 'Target', // Icon name for lucide-react
  },
  ONGOING: {
    color: colors.status.ongoing,
    bg: '#D1FAE5',
    text: '#065F46',
    label: 'Live',
    icon: 'Radio', // Icon name for lucide-react
  },
  COMPLETED: {
    color: colors.status.completed,
    bg: '#F3F4F6',
    text: '#374151',
    label: 'Completed',
    icon: 'Flag', // Icon name for lucide-react
  },
};
