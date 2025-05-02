const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        content1: '#242424',
        content2: '#2a2a2a',
        primary: {
          DEFAULT: '#64748b',
          foreground: '#ffffff',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: '#1a1a1a',
            content1: '#242424',
            content2: '#2a2a2a',
            primary: {
              DEFAULT: '#64748b',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
};