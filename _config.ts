import lume from "https:/deno.land/x/lume@v1.3.1/mod.ts";

import resolveUrls from "https:/deno.land/x/lume@v1.3.1/plugins/resolve_urls.ts";
import codeHighlight from "https:/deno.land/x/lume@v1.3.1/plugins/code_highlight.ts";

import bundler from "https:/deno.land/x/lume@v1.3.1/plugins/bundler.ts";
import esbuild from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/esbuild/esbuild.ts";
import minify from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/minify/minify.ts";

import windicss from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/windicss/windicss.ts";
import postcss from "https://deno.land/x/lume@v1.3.1/plugins/postcss.ts";

import windiConfig from "./_windi.config.ts";
import markdownPlugin from "./_markdown.ts";

import { Element } from "https://deno.land/x/lume@v1.3.1/deps/dom.ts";
import { createSlugifier } from "https://deno.land/x/lume@v1.3.1/plugins/slugify_urls.ts";
import {
  Ast,
  parse1 as parseley,
} from "https://deno.land/x/parseley@v0.9.1/parseley.ts";

export const site = lume({}, {
  markdown: { plugins: [markdownPlugin], keepDefaultPlugins: true },
});

site.ignore("README.md");
site.copy("_includes/dep", "dep");
site.copy("_includes/media", "media");
site.copy("_includes/screenshots", "screenshots");
site.use(resolveUrls());
site.loadAssets([".ts"]);

interface Heading {
  level: number;
  slug: string;
  text: string;
}
const slugify = createSlugifier(),
  slugifyHeading = (
    heading: Partial<Heading>,
    cache: Heading[] = [],
  ): Partial<Heading> => {
    let dups = 0;
    const baseSlug = heading.slug || slugify(heading.text || ""),
      computedSlug = () => (dups ? `${baseSlug}-${dups}` : baseSlug);
    while (cache.find(({ slug }) => slug === computedSlug())) dups++;
    heading.slug = computedSlug();
    return heading;
  };
site.preprocess([".html"], (page) => {
  const filename = page.src.path + page.src.ext;
  page.data.filename = filename;
  if (!page.data.table_of_contents) {
    const content = Deno.readTextFileSync(site.src(filename)),
      tableOfContents: Heading[] = [];
    for (const match of content.matchAll(/\n(#+) (.+)/g)) {
      const attrs = match[2].match(/ {.+}$/)?.[0],
        heading: Partial<Heading> = {
          level: match[1].length,
          text: attrs ? match[2].slice(0, -attrs.length) : match[2],
        };
      if (attrs) {
        const parsedAttrs = parseley(attrs.slice(2, -1)).list,
          id = <Ast.IdSelector> parsedAttrs.find(({ type }) => type === "id");
        if (id) heading.slug = id.name;
      }
      slugifyHeading(heading, tableOfContents);
      tableOfContents.push(heading as Heading);
    }
    page.data.table_of_contents = tableOfContents;
  }
});
site.process([".html"], (page) => {
  if (!page.document) return;
  const hSelector =
      ".prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6",
    tableOfContents: Heading[] = [];
  page.document.querySelectorAll(hSelector)
    .forEach((node) => {
      const $h = <Element> node;
      if ($h.getAttribute("id")) return;
      const heading: Partial<Heading> = { text: $h.innerText };
      slugifyHeading(heading, tableOfContents);
      $h.setAttribute("id", heading.slug);
    });
});

site.use(codeHighlight());
site.use(windicss({ minify: true, config: windiConfig }));
site.use(postcss());

site.use(bundler());
site.use(esbuild());
site.use(minify());

export default site;
