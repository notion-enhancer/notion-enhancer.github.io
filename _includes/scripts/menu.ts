/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

const menuSelector = "aside[aria-label='menu']",
  btnSelector = "[data-action='toggle-menu']",
  isOpen = () => {
    const $menu = <HTMLElement> document.querySelector(menuSelector);
    if (!$menu) return false;
    return !!$menu.style.getPropertyValue("--tw-translate-x");
  },
  open = () => {
    const $menu = <HTMLElement> document.querySelector(menuSelector);
    if (!$menu) return false;
    $menu.style.setProperty("--tw-translate-x", "0");
  },
  close = () => {
    const $menu = <HTMLElement> document.querySelector(menuSelector);
    if (!$menu) return false;
    $menu.style.removeProperty("--tw-translate-x");
  },
  toggle = () => {
    if (isOpen()) {
      close();
    } else open();
  };

export const initMenuToggle = () => {
  const $menuToggle = <HTMLElement> document.querySelector(btnSelector),
    $menu = <HTMLElement> document.querySelector(menuSelector),
    $header = <HTMLElement> document.querySelector("header"),
    $article = <HTMLElement> document.querySelector("article");

  if (!$menu) {
    $menuToggle.style.display = "none";
    return;
  } else $menuToggle.style.display = "";

  $menuToggle.addEventListener("click", toggle);
  $menu.querySelectorAll("a").forEach(($a) => {
    $a.removeEventListener("click", close);
    $a.addEventListener("click", close);
  });
  $header.removeEventListener("click", close);
  $header.addEventListener("click", close);
  $article.removeEventListener("click", close);
  $article.addEventListener("click", close);
};
