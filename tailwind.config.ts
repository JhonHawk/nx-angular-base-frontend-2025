// @ts-ignore
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./apps/*/src/**/*.{html,ts}', './libs/*/src/**/*.{html,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-primeui')],
};

export default config;
