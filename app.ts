/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

import psyche, {
  platformModifier,
  registerHotkey,
} from "https://deno.land/x/psyche@v0.3.2/client/psyche.min.mjs";
import { initRouter, onRouteChange } from "./_scripts/router.ts";
import { tiltElements } from "./_scripts/tilt.ts";

const eventListener = (
  $: Element,
  event: string,
  listener: EventListenerOrEventListenerObject,
) => {
  $.removeEventListener(event, listener);
  $.addEventListener(event, listener);
};

const getMenu = () =>
    document.querySelector<HTMLElement>("aside[aria-label='menu']"),
  closeMenu = () => {
    const $menu = getMenu();
    if ($menu) $menu.style.removeProperty("--tw-translate-x");
  },
  toggleMenu = () => {
    const $menu = getMenu();
    if ($menu) {
      const isOpen = $menu.style.getPropertyValue("--tw-translate-x");
      isOpen ? closeMenu() : $menu.style.setProperty("--tw-translate-x", "0");
    }
  },
  initMenu = () => {
    const $menu = getMenu();
    if (!$menu) return;
    const $toggle = document.querySelector("[data-action='toggle-menu']"),
      $close = [
        document.querySelector("figure[role='banner']"),
        document.querySelector("header"),
        document.querySelector("article"),
        ...$menu.querySelectorAll("a"),
      ].filter(($) => $);
    if ($toggle) eventListener($toggle, "click", toggleMenu);
    for (const $ of $close) eventListener($!, "click", closeMenu);
  };

const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    const mode = document.documentElement.classList.contains("dark");
    localStorage["theme"] = mode ? "dark" : "light";
  },
  initTheme = () => {
    const mediaMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "",
      storedMode = localStorage["theme"];
    if (storedMode === "dark" || (!storedMode && mediaMode === "dark")) {
      document.documentElement.classList.add("dark");
    }
    const $buttons = document.querySelectorAll("[data-action='toggle-theme']");
    $buttons.forEach(($) => eventListener($, "click", toggleTheme));
    // prevent flash of unthemed content on load
    document.documentElement.classList.remove("hidden");
  };

const searchInstance = psyche({
    theme: {
      font: { sans: "Inter", mono: "Fira Code" },
      light: { accent: "#a78bfa" },
      dark: { accent: "#d8b4fe" },
      scrollbarStyle: "square",
    },
    hotkeys: [{
      kbd: `${platformModifier} + SHIFT + L`,
      label: "to toggle theme",
    }],
    index: await fetch("/search.json").then((res) => res.json()),
  }),
  initSearch = () => {
    const $buttons = document.querySelectorAll("[data-action='open-search']");
    $buttons.forEach(($) => eventListener($, "click", searchInstance.open));
    searchInstance.unregister();
    searchInstance.register();
  };

registerHotkey({
  key: "l",
  platformModifier: true,
  shiftKey: true,
  onkeydown: (event: KeyboardEvent) => {
    event.preventDefault();
    toggleTheme();
  },
});

onRouteChange(initMenu);
onRouteChange(initTheme);
onRouteChange(initSearch);
onRouteChange(tiltElements);
initRouter();
