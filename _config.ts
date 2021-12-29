import lume from "https:/deno.land/x/lume@v1.4.1/mod.ts";

import resolveUrls from "https:/deno.land/x/lume@v1.4.1/plugins/resolve_urls.ts";
import codeHighlight from "https:/deno.land/x/lume@v1.4.1/plugins/code_highlight.ts";

import bundler from "https:/deno.land/x/lume@v1.4.1/plugins/bundler.ts";
import esbuild from "https://raw.githubusercontent.com/lumeland/experimental-plugins/ad1d4d27ff435197cdb753183447849c7f518ea3/esbuild/esbuild.ts";
import minify from "https://raw.githubusercontent.com/lumeland/experimental-plugins/ad1d4d27ff435197cdb753183447849c7f518ea3/minify/minify.ts";

import windicss from "https://raw.githubusercontent.com/lumeland/experimental-plugins/ad1d4d27ff435197cdb753183447849c7f518ea3/windicss/windicss.ts";
import postcss from "https://deno.land/x/lume@v1.4.1/plugins/postcss.ts";
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
site.loadAssets([".ts"]);

site.use(tableOfContentsPlugin());
site.use(searchIndexer());

const feather = (value: string, attrs = {}) =>
  featherIcons.icons[value].toSvg(attrs);
site.filter("feather", feather);
site.use(codeHighlight());

site.use(windicss({
  minify: true,
  config: windiConfig,
  windiLangFiles: "merge",
}));
site.use(postcss());

site.use(resolveUrls());
site.use(bundler());
site.use(esbuild());
site.use(minify());

export default site;
