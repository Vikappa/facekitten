module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        success: '#51cf66',
        danger: '#ff6b6b',
        warning: '#ffd93d',
        info: '#6bcfff',
      },
    },
  },
  plugins: [],
}
