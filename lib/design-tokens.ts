// Design tokens for consistent UI across Vibe Chat app

export const colors = {
    // Primary brand colors
    primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // rose-500 - main primary color
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },

    // Secondary colors
    secondary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
    },

    // Neutral colors
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },

    // Semantic colors
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444',   // rose-500
    info: '#3b82f6',    // blue-500
}

export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
}

export const borderRadius = {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
}

export const fontSize = {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
}

export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

export const animation = {
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },
    easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
}

// Component-specific tokens
export const components = {
    button: {
        primary: {
            bg: colors.primary[500],
            hover: colors.primary[600],
            text: 'white',
            shadow: shadows.md,
        },
        secondary: {
            bg: 'white',
            hover: colors.gray[50],
            text: colors.gray[700],
            border: colors.gray[200],
        },
        ghost: {
            bg: 'transparent',
            hover: colors.gray[100],
            text: colors.gray[700],
        },
    },

    navigation: {
        bg: 'white',
        border: '#fcedef', // Light rose tint
        active: colors.primary[500],
        shadow: shadows.lg,
    },

    card: {
        bg: 'white',
        border: colors.gray[200],
        shadow: shadows.md,
        radius: borderRadius.xl,
    },

    header: {
        bg: 'white',
        border: colors.gray[100],
        title: colors.gray[900],
        subtitle: colors.gray[600],
    },
}
