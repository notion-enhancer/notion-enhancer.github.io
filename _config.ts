import lume from "https:/deno.land/x/lume@v1.3.1/mod.ts";

import resolveUrls from "https:/deno.land/x/lume@v1.3.1/plugins/resolve_urls.ts";
import codeHighlight from "https:/deno.land/x/lume@v1.3.1/plugins/code_highlight.ts";

import bundler from "https:/deno.land/x/lume@v1.3.1/plugins/bundler.ts";
import esbuild from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/esbuild/esbuild.ts";
import minify from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/minify/minify.ts";

import windicss from "./_plugins/windicss.ts";
import postcss from "https://deno.land/x/lume@v1.3.1/plugins/postcss.ts";
import featherIcons from "https://cdn.skypack.dev/feather-icons";

import windiConfig from "./_windi.config.ts";
import codeLanguage from "./_plugins/code_language.ts";
import tableOfContentsPlugin from "./_plugins/table_of_contents.ts";
import searchIndexer from "./_plugins/search_indexer.ts";

export const site = lume({}, {
  nunjucks: { includes: "_layouts" },
  markdown: { plugins: [codeLanguage], keepDefaultPlugins: true },
});

site.ignore("README.md");
site.copy("favicon.ico", "favicon.ico");
site.copy("media", "media");
site.copy("assets", "assets");
site.use(resolveUrls());
site.loadAssets([".ts"]);

const feather = (value: string, attrs = {}) =>
  featherIcons.icons[value].toSvg(attrs);
site.filter("feather", feather);

site.use(tableOfContentsPlugin());
site.use(codeHighlight());
site.use(windicss({
  minify: true,
  config: windiConfig,
  windiLangFiles: "transpile",
}));
site.use(postcss());

site.use(bundler());
site.use(esbuild());
site.use(minify());

site.use(searchIndexer());

export default site;
