/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        container: '1200px',
      },
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        success: '#51cf66',
        danger: '#ff6b6b',
        warning: '#ffd93d',
        info: '#6bcfff',
        dark: '#2d3436',
        light: '#dfe6e9',
      },
      backgroundColor: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        tertiary: '#eff0f3',
      },
      textColor: {
        primary: '#2d3436',
        secondary: '#636e72',
        tertiary: '#95a5a6',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      transitionDuration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        default: 'ease-in-out',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 300ms ease-in-out',
        slideInUp: 'slideInUp 300ms ease-in-out',
        slideInDown: 'slideInDown 300ms ease-in-out',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        klavika: ['klavika', 'serif'],
      },
    },
  },
  plugins: [],
}
