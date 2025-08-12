// tailwind.config.js
// ─────────────────────────────────────────────
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  content: [
    './resources/**/*.{blade.php,js,jsx,ts,tsx,vue}',
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
  ],

  theme: {
    extend: {
      /* ①  Ajoute les alias de couleurs utilisés dans tes classes utilitaires */
      colors: {
        /* palette “design tokens” (extraits de app.css) */
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',

        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',

        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',

        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',

        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',

        /* 👇  ceux-ci évitent toutes les erreurs “unknown utility class” */
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
      },

      /* ②  Tes rayons déclarés en CSS custom prop */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },

  /* ③  Plugins éventuels */
  plugins: [
    require('tailwindcss-animate'),
  ],
};
