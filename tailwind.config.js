/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  corePlugins: {
    preflight: false, // CRITICAL: preserve existing CSS and avoid element resets
  },
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border, 0 0% 90%))",
        input: "hsl(var(--input, 0 0% 90%))",
        ring: "hsl(var(--ring, 0 0% 0%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 0 0% 0%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 230 100% 55%))",
          foreground: "var(--primary-foreground, #fff)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 0 0% 96%))",
          foreground: "hsl(var(--secondary-foreground, 0 0% 0%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 0 0% 96%))",
          foreground: "hsl(var(--muted-foreground, 0 0% 45%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 0 0% 96%))",
          foreground: "hsl(var(--accent-foreground, 0 0% 0%))",
        },
      },
    },
  },
  plugins: [],
};
