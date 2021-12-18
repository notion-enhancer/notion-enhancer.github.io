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
  $btns = () => document.querySelectorAll("[data-action='toggle-theme']"),
  $header = () => <HTMLElement> document.querySelector("header"),
  showButton = ($b: Element) =>
    !$header().contains($b) && location.pathname !== "/" ? "add" : "remove";

const hotkey = (event: KeyboardEvent) => {
  const pressed = event.shiftKey && !event.altKey &&
    (event.metaKey || event.ctrlKey) && !(event.metaKey && event.ctrlKey) &&
    event.key.toLowerCase() === "l";
  if (pressed) {
    event.preventDefault();
    toggle();
  }
};

export const initTheme = () => {
  const mediaMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "",
    storedMode = localStorage["theme"];
  if (storedMode === "dark" || (!storedMode && mediaMode === "dark")) {
    document.documentElement.classList.add("dark");
  }

  $btns().forEach(($b) => $b.removeEventListener("click", toggle));
  $btns().forEach(($b) => {
    $b.classList[showButton($b)]("sm:pointer-events-none", "sm:opacity-0");
    $b.addEventListener("click", toggle);
  });

  document.removeEventListener("keydown", hotkey);
  document.addEventListener("keydown", hotkey);
};
