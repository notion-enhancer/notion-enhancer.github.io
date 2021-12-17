/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

import { onRouteChange } from "./_includes/scripts/router.ts";
import { initSearch } from "./_includes/scripts/search.ts";
import { initMenuToggle } from "./_includes/scripts/menu.ts";
import { initThemeToggle } from "./_includes/scripts/theme.ts";
import { tiltElements } from "./_includes/scripts/tilt.ts";

onRouteChange(initSearch);
onRouteChange(initMenuToggle);
onRouteChange(initThemeToggle);
onRouteChange(tiltElements);

// prevent flash of unthemed content on load
requestAnimationFrame(() => {
  document.documentElement.classList.remove("hidden");
});
