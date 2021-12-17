import lume from "https:/deno.land/x/lume@v1.3.1/mod.ts";

import resolveUrls from "https:/deno.land/x/lume@v1.3.1/plugins/resolve_urls.ts";
import codeHighlight from "https:/deno.land/x/lume@v1.3.1/plugins/code_highlight.ts";

import bundler from "https:/deno.land/x/lume@v1.3.1/plugins/bundler.ts";
import esbuild from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/esbuild/esbuild.ts";
import minify from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/minify/minify.ts";

import windicss from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/windicss/windicss.ts";
import postcss from "https://deno.land/x/lume@v1.3.1/plugins/postcss.ts";

import windiConfig from "./_plugins/windi.config.ts";
import markdownPlugin from "./_plugins/markdown.ts";
import tableOfContentsPlugin from "./_plugins/table-of-contents.ts";
import searchIndexer from "./_plugins/search-indexer.ts";

export const site = lume({}, {
  markdown: { plugins: [markdownPlugin], keepDefaultPlugins: true },
});

site.ignore("README.md");
site.copy("_includes/dep", "dep");
site.copy("_includes/media", "media");
site.copy("_includes/screenshots", "screenshots");
site.use(resolveUrls());
site.loadAssets([".ts"]);

site.use(tableOfContentsPlugin());
site.use(codeHighlight());
site.use(windicss({ minify: true, config: windiConfig }));
site.use(postcss());

site.use(bundler());
site.use(esbuild());
site.use(minify());

site.use(searchIndexer());

export default site;
