/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

import { handlePostRoute, onRouteChange } from "./_includes/scripts/router.ts";
import { initSearch } from "./_includes/scripts/search.ts";
import { initMenu } from "./_includes/scripts/menu.ts";
import { initTheme } from "./_includes/scripts/theme.ts";
import { tiltElements } from "./_includes/scripts/tilt.ts";

onRouteChange(initSearch);
onRouteChange(initMenu);
onRouteChange(initTheme);
onRouteChange(tiltElements);

// prevent flash of unthemed content on load
requestAnimationFrame(() => {
  document.documentElement.classList.remove("hidden");
  handlePostRoute();
});
