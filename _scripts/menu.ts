/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

const $: Record<string, () => HTMLElement> = {};
$.menu = () => <HTMLElement> document.querySelector("aside[aria-label='menu']");
$.btn = () =>
  <HTMLElement> document.querySelector("[data-action='toggle-menu']");
$.header = () => <HTMLElement> document.querySelector("header");
$.article = () => <HTMLElement> document.querySelector("article");

const gui: Record<string, () => unknown> = {};
gui.isOpen = () => !!$.menu().style.getPropertyValue("--tw-translate-x");
gui.open = () => $.menu().style.setProperty("--tw-translate-x", "0");
gui.close = () => $.menu().style.removeProperty("--tw-translate-x");
gui.toggle = () => gui.isOpen() ? gui.close() : gui.open();

export const initMenu = () => {
  if (!$.menu()) {
    if ($.btn()) $.btn().style.display = "none";
    return;
  } else $.btn().style.display = "";

  $.btn().addEventListener("click", gui.toggle);
  $.menu().querySelectorAll("a").forEach(($a) => {
    $a.removeEventListener("click", gui.close);
    $a.addEventListener("click", gui.close);
  });
  $.header().removeEventListener("click", gui.close);
  $.header().addEventListener("click", gui.close);
  $.article().removeEventListener("click", gui.close);
  $.article().addEventListener("click", gui.close);
};
