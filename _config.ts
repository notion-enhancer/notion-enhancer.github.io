import lume from "lume";

import resolveUrls from "lume/plugins/resolve_urls.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import bundler from "lume/plugins/bundler.ts";
import postcss from "lume/plugins/postcss.ts";

import psyche from "https://deno.land/x/psyche@v0.3.2/indexers/lume.ts";
import featherIcons from "https://cdn.skypack.dev/feather-icons";

import esbuild from "https://raw.githubusercontent.com/lumeland/experimental-plugins/cb94abee21c241ad0b34fc872b3c5985caa0e0a8/esbuild/esbuild.ts";
import minify from "https://raw.githubusercontent.com/lumeland/experimental-plugins/cb94abee21c241ad0b34fc872b3c5985caa0e0a8/minify/minify.ts";
import windicss from "https://raw.githubusercontent.com/lumeland/experimental-plugins/cb94abee21c241ad0b34fc872b3c5985caa0e0a8/windicss/windicss.ts";

import windiConfig from "./_windi.config.ts";
import codeLabels from "./_plugins/code_labels.ts";
import tableOfContents from "./_plugins/table_of_contents.ts";

export const site = lume({}, {
  nunjucks: { includes: "_layouts" },
  markdown: { plugins: [codeLabels], keepDefaultPlugins: true },
});

site.ignore("README.md");
site.copy("favicon.ico", "favicon.ico");
site.copy("media", "media");
site.copy("assets", "assets");
site.loadAssets([".ts"]);

// used for "edit this page" links
site.preprocess([".html"], (page) => {
  page.data.filename = page.src.path + page.src.ext;
});

// icons
const feather = (value: string, attrs = {}) =>
  featherIcons.icons[value].toSvg(attrs);
site.filter("feather", feather);

// content
site.use(tableOfContents());
site.use(codeHighlight());
site.use(psyche());

// assets
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
