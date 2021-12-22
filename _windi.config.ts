/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { defineConfig } from "https://cdn.skypack.dev/windicss@3.3.0/helpers";
import typography from "https://cdn.skypack.dev/windicss@3.3.0/plugin/typography";

export default defineConfig({
  preflight: true,
  attributify: true,
  theme: {
    extend: {
      fontFamily: {
        sans: "'Inter var', Inter, sans-serif",
        mono: "Fira Code, monospace",
      },
    },
  },
  plugins: [typography({ dark: true })],
  shortcuts: {
    "bg-header": `
      transition
      bg-light-900 text-dark-900
      dark:(bg-dark-900 text-light-900)
      `,
    "bg-body": `
      transition
      bg-light-800 text-dark-900
      dark:(bg-dark-800 text-light-900)
    `,
    "bg-card": `
      transition
      bg-light-700 text-dark-900
      dark:(bg-dark-500 text-light-900)
    `,

    "bg-primary": `text-white bg-violet-400 dark:(text-black bg-violet-300)`,
    "bg-dim": `text-white bg-gray-700 dark:(text-black bg-gray-400)`,

    "text-primary": `text-violet-400 dark:text-violet-300`,
    "text-dim": `text-gray-700 dark:text-gray-400`,

    "border-primary": `border-violet-400 dark:border-violet-300`,
    "border-dim": `border-gray-300 dark:border-dark-400`,

    "ring-primary": `outline-none ring-2 ring-violet-400 dark:ring-violet-300`,
    "ring-dim": `outline-none ring-2 ring-gray-300 dark:ring-dark-400`,

    "button": `
      transition
      flex space-x-3 items-center px-4 py-3 rounded-md
      bg-card hover:(bg-light-600 dark:bg-dark-600)
      border border-dim focus:ring-dim
    `,
    "button-floating": `
      box-content h-4 w-4 p-2 mt-2 shadow rounded-full
      focus:ring-dim border border-dim relative bg-card
      hover:(bg-light-600 dark:bg-dark-600) duration-100
    `,

    "tooltip": `
      absolute pointer-events-none rounded px-2 py-1 w-max
      text-sm font-medium transition bg-dark-900 text-light-900
      dark:(bg-light-900 text-dark-900)
    `,

    "feather": `
      w-4 h-4 fill-none stroke-current
      stroke-2 stroke-cap-round stroke-join-round
    `,

    "link": `
      underline font-medium transition
      text-gray-600 hover:text-gray-800
      dark:(text-gray-300 hover:text-gray-200)
    `,

    "search-result-section": `
      block bg-body pb-2 w-full text-primary sticky top-0
    `,
    "search-result": `
      block mb-4 px-4 py-3 w-full rounded-md cursor-pointer
      bg-card duration-50 hover:bg-primary flex items-center
      focus:(bg-primary outline-none)
    `,
    "search-result-icon": `
      feather h-6 w-6 mr-4 text-dim flex-shrink-0
      group-hover:text-current group-focus:text-current
    `,
    "search-result-highlight": `
      bg-transparent text-primary
      group-hover:text-current group-focus:text-current
    `,
  },
});
