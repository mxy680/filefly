import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',  // Include all files in the `pages` directory
    './components/**/*.{js,ts,jsx,tsx}', // Include all files in the `components` directory
    './app/**/*.{js,ts,jsx,tsx}',    // Include all files in the `app` directory for Next.js 13+
  ],
};

export default config;
