/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FileMaker inspired colors from the screenshot
        'filemaker': {
          'blue': '#4A90E2',
          'light-blue': '#E8F4FD',
          'gray': '#F5F5F5',
          'border': '#D1D5DB',
          'text': '#374151',
          'header': '#FFFFFF',
          'button': '#3B82F6',
          'button-hover': '#2563EB',
          'green': '#10B981',
          'red': '#EF4444',
          'yellow': '#F59E0B',
          'orange': '#F97316',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
