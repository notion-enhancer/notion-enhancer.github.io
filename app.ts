/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

import { onRouteChange } from "./_includes/scripts/router.ts";
import { initMenuToggle } from "./_includes/scripts/menu-toggle.ts";
import { initThemeToggle } from "./_includes/scripts/theme-toggle.ts";
import { tiltElements } from "./_includes/scripts/tilt-element.ts";

onRouteChange(initMenuToggle);
onRouteChange(initThemeToggle);
onRouteChange(tiltElements);

// prevent flash of unthemed content on load
requestAnimationFrame(() => {
  document.documentElement.classList.remove("hidden");
});
