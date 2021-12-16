/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

const isMenuOpen = () => {
    const $menu = document.querySelector("aside#menu") as HTMLElement;
    if (!$menu) return false;
    return !!$menu.style.getPropertyValue("--tw-translate-x");
  },
  openMenu = () => {
    const $menu = document.querySelector("aside#menu") as HTMLElement;
    if (!$menu) return false;
    $menu.style.setProperty("--tw-translate-x", "0");
  },
  closeMenu = () => {
    const $menu = document.querySelector("aside#menu") as HTMLElement;
    if (!$menu) return false;
    $menu.style.removeProperty("--tw-translate-x");
  },
  toggleMenu = () => {
    if (isMenuOpen()) {
      closeMenu();
    } else openMenu();
  };

export const initMenuToggle = () => {
  const $toggleMenu = document.querySelector("#toggle-menu") as HTMLElement,
    $menu = document.querySelector("aside#menu") as HTMLElement,
    $header = document.querySelector("header") as HTMLElement,
    $article = document.querySelector("article") as HTMLElement;

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
