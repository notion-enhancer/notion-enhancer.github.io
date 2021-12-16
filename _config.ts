import lume from "https:/deno.land/x/lume@v1.3.1/mod.ts";

import resolveUrls from "https:/deno.land/x/lume@v1.3.1/plugins/resolve_urls.ts";
import codeHighlight from "https:/deno.land/x/lume@v1.3.1/plugins/code_highlight.ts";

import bundler from "https:/deno.land/x/lume@v1.3.1/plugins/bundler.ts";
import esbuild from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/esbuild/esbuild.ts";
import minify from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/minify/minify.ts";

import windicss from "https://raw.githubusercontent.com/dragonwocky/experimental-plugins/main/windicss/windicss.ts";
import postcss from "https://deno.land/x/lume@v1.3.1/plugins/postcss.ts";

import windiConfig from "./_windi.config.ts";
import markdownPlugin from "./_markdown.ts";

const site = lume({}, {
  markdown: { plugins: [markdownPlugin], keepDefaultPlugins: true },
});
site.use(resolveUrls());

site.ignore("README.md");
site.copy("_includes/dep", "dep");
site.copy("_includes/media", "media");
site.copy("_includes/screenshots", "screenshots");
site.loadAssets([".ts"]);

site.preprocess([".html"], (page) => {
  page.data.sourceFile = page.src.path + page.src.ext;
});

site.use(codeHighlight());
site.use(windicss({ minify: true, config: windiConfig }));
site.use(postcss());

site.use(bundler());
site.use(esbuild());
site.use(minify());

export default site;
