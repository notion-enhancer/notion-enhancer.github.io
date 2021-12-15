/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { defineConfig } from "https://esm.sh/windicss@3.1.2/helpers";

export default defineConfig({
  preflight: true,
  attributify: true,
  theme: {
    extend: {
      fontFamily: {
        sans: "'Inter var', Inter, sans-serif",
        mono: "Fira Code, monospace",
      },
      colors: {
        notion: {
          light: "#fff",
          "light-secondary": "rgb(247, 246, 243)",
          "light-card": "#fff",
          dark: "rgb(47, 52, 55)",
          "dark-secondary": "rgb(55, 60, 63)",
          "dark-card": "rgb(63, 68, 71)",
        },
      },
    },
  },
  shortcuts: {
    "bg-main": `
      transition
      bg-light-800 text-dark-900
      dark:(bg-dark-800 text-light-900)
    `,
    "bg-secondary": `
      transition
      bg-light-900 text-dark-900
      dark:(bg-dark-900 text-light-900)
      `,
    "bg-interactive": `
      transition bg-light-700 text-dark-900 hover:bg-light-600
      dark:(bg-dark-700 text-light-900 hover:bg-dark-600)
    `,

    "button": `
      transition
      flex space-x-3 items-center px-4 py-3 rounded-md border
      bg-interactive border-dark-100 dark:border-dark-50
    `,

    "feather": `
      w-4 h-4 fill-none stroke-current
      stroke-2 stroke-cap-round stroke-join-round
    `,

    "tooltip": `
      absolute pointer-events-none rounded px-2 py-1 w-max
      text-sm font-medium opacity-0 group-hover:opacity-100
      transition bg-dark-900 text-light-900 dark:(bg-light-900 text-dark-900)
    `,

    "link": `
      underline font-medium transition
      text-gray-600 hover:text-gray-800
      dark:(text-gray-300 hover:text-gray-200)
    `,
  },
});
