// ══════════════════════════════════════════════
// TournPur — Sport Design System
// ══════════════════════════════════════════════

export const colors = {
  // Sport brand
  sport: {
    blue: '#00d4ff',
    green: '#00ff88',
    purple: '#8b5cf6',
    live: '#22c55e',
  },

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
    ongoing: '#22c55e',    // Green (sport-live)
    completed: '#6B7280',  // Gray
    next: '#8B5CF6',       // Purple
  },

  // Semantic
  success: '#22c55e',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#00d4ff',
  neutral: '#6B7280',

  // Dark backgrounds
  bg: {
    dark: '#060a13',
    darkLight: '#0c1929',
    light: '#F9FAFB',
    white: '#FFFFFF',
    gray: '#F3F4F6',
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    white: '#F1F5F9',
    dim: '#94A3B8',
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
};

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  sport: '0 0 20px rgba(0, 212, 255, 0.15)',
};

// Status badge configurations
export const statusConfig = {
  SCHEDULED: {
    color: colors.status.scheduled,
    bg: '#FEF3C7',
    text: '#92400E',
    label: 'Scheduled',
    icon: 'Calendar',
  },
  READY: {
    color: colors.status.ready,
    bg: '#DBEAFE',
    text: '#1E40AF',
    label: 'Ready',
    icon: 'CheckCircle2',
  },
  NEXT: {
    color: colors.status.next,
    bg: '#EDE9FE',
    text: '#6D28D9',
    label: 'Next Up',
    icon: 'Target',
  },
  ONGOING: {
    color: colors.status.ongoing,
    bg: '#DCFCE7',
    text: '#166534',
    label: 'Live',
    icon: 'Radio',
  },
  COMPLETED: {
    color: colors.status.completed,
    bg: '#F3F4F6',
    text: '#374151',
    label: 'Completed',
    icon: 'Flag',
  },
};
