/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

const onClick = () => {
    document.documentElement.classList.toggle("dark");
    const mode = document.documentElement.classList.contains("dark");
    localStorage["theme"] = mode ? "dark" : "light";
  },
  btnSelector = "[data-action='toggle-theme']";

export const initThemeToggle = () => {
  const $themeToggle = <HTMLElement> document.querySelector(btnSelector),
    mediaMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "",
    storedMode = localStorage["theme"];

  if (storedMode === "dark" || (!storedMode && mediaMode === "dark")) {
    document.documentElement.classList.add("dark");
  }
  $themeToggle.removeEventListener("click", onClick);
  $themeToggle.addEventListener("click", onClick);
};
