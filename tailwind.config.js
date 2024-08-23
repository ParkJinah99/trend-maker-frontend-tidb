const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */

const config = {
  content: [
    "./src/**/*.{js,jsx}", // Adjust based on your project's file structure
    flowbite.content(),
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'), // Make sure this plugin is installed and compatible
    flowbite.plugin(),
  ],
  darkMode: 'class',
};

module.exports = config; // Use common JS export if not using ES6 modules
