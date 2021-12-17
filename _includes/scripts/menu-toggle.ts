/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

const menuSelector = "aside[aria-label='menu']",
  btnSelector = "[data-action='toggle-menu']",
  isMenuOpen = () => {
    const $menu = <HTMLElement> document.querySelector(menuSelector);
    if (!$menu) return false;
    return !!$menu.style.getPropertyValue("--tw-translate-x");
  },
  openMenu = () => {
    const $menu = <HTMLElement> document.querySelector(menuSelector);
    if (!$menu) return false;
    $menu.style.setProperty("--tw-translate-x", "0");
  },
  closeMenu = () => {
    const $menu = <HTMLElement> document.querySelector(menuSelector);
    if (!$menu) return false;
    $menu.style.removeProperty("--tw-translate-x");
  },
  toggleMenu = () => {
    if (isMenuOpen()) {
      closeMenu();
    } else openMenu();
  };

export const initMenuToggle = () => {
  const $toggleMenu = <HTMLElement> document.querySelector(btnSelector),
    $menu = <HTMLElement> document.querySelector(menuSelector),
    $header = <HTMLElement> document.querySelector("header"),
    $article = <HTMLElement> document.querySelector("article");

  if (!$menu) {
    $toggleMenu.style.display = "none";
    return;
  } else $toggleMenu.style.display = "";

  $toggleMenu.addEventListener("click", toggleMenu);
  $menu.querySelectorAll("a").forEach(($a) => {
    $a.removeEventListener("click", closeMenu);
    $a.addEventListener("click", closeMenu);
  });
  $header.removeEventListener("click", closeMenu);
  $header.addEventListener("click", closeMenu);
  $article.removeEventListener("click", closeMenu);
  $article.addEventListener("click", closeMenu);
};
