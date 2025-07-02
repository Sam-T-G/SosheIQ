/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-red-500',
    'bg-yellow-500',
    'bg-green-500',
  ],
  theme: {
    extend: {
      colors: {
        // You can extend your color palette here if needed
        // For example, if you had custom colors in your <style> tag
        // slate: colors.slate, // Already part of Tailwind default
        // teal: colors.teal,
        // sky: colors.sky,
        // green: colors.green,
        // red: colors.red,
      }
    },
  },
  plugins: [],
};