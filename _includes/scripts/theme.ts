/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

const toggle = () => {
    document.documentElement.classList.toggle("dark");
    const mode = document.documentElement.classList.contains("dark");
    localStorage["theme"] = mode ? "dark" : "light";
  },
  $btn = () =>
    <HTMLElement> document.querySelector("[data-action='toggle-theme']");

export const initTheme = () => {
  const mediaMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "",
    storedMode = localStorage["theme"];

  if (storedMode === "dark" || (!storedMode && mediaMode === "dark")) {
    document.documentElement.classList.add("dark");
  }
  $btn().removeEventListener("click", toggle);
  $btn().addEventListener("click", toggle);
};
