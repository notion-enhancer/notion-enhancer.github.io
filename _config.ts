import lume from "https:/deno.land/x/lume@v1.3.1/mod.ts";

import resolveUrls from "https:/deno.land/x/lume@v1.3.1/plugins/resolve_urls.ts";

import bundler from "https:/deno.land/x/lume@v1.3.1/plugins/bundler.ts";
import postcss from "https:/deno.land/x/lume@v1.3.1/plugins/postcss.ts";
import minify from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/minify/minify.ts";
import esbuild from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/esbuild/esbuild.ts";
import windicss from "./_windi.ts";

import windiConfig from "./_windi.config.ts";

const site = lume();

site.ignore("README.md");
site.copy("_includes/dep", "dep");
site.copy("_includes/media", "media");
site.copy("_includes/screenshots", "screenshots");
site.loadAssets([".ts"]);

site.use(resolveUrls());

site.use(bundler());
site.use(
  windicss({ minify: true, config: windiConfig }),
);
site.use(postcss());
site.use(esbuild());
site.use(minify());

export default site;
