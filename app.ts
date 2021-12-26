/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

import { onRouteChange } from "./_scripts/router.ts";
import { initSearch } from "./_scripts/search.ts";
import { initMenu } from "./_scripts/menu.ts";
import { initTheme } from "./_scripts/theme.ts";
import { tiltElements } from "./_scripts/tilt.ts";

onRouteChange(initSearch);
onRouteChange(initMenu);
onRouteChange(initTheme);
onRouteChange(tiltElements);

// prevent flash of unthemed content on load
onRouteChange(() => {
  document.documentElement.classList.remove("hidden");
});
