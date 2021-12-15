/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

import { onRouteChange } from "./router.ts";

// theme picker
onRouteChange(() => {
  const $toggleTheme = document.querySelector("#toggle-theme"),
    mediaMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "",
    storedMode = localStorage["theme"],
    classList = document.documentElement.classList;

  if ($toggleTheme) {
    const $icon = $toggleTheme.children[1].children[0] as SVGUseElement,
      updateIcon = (icon: string) => {
        $icon.href.baseVal = $icon.href.baseVal.replace(/#\w+$/, `#${icon}`);
      };
    if (storedMode === "dark" || (!storedMode && mediaMode === "dark")) {
      classList.add("dark");
      updateIcon("moon");
    }
    $toggleTheme.addEventListener("click", () => {
      classList.toggle("dark");
      const mode = classList.contains("dark");
      localStorage["theme"] = mode ? "dark" : "light";
      updateIcon(mode ? "moon" : "sun");
    });
  }
});

// prevent flash of unthemed content on load
requestAnimationFrame(() => {
  document.documentElement.classList.remove("hidden");
});
