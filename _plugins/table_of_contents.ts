/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { slugify } from "https://deno.land/x/psyche@v0.3.0/indexers/shared.ts";

import type { Site } from "lume/core.ts";
import type { Element } from "lume/deps/dom.ts";
import { DOMParser } from "lume/deps/dom.ts";
import { markdownIt, markdownItAttrs } from "lume/deps/markdown_it.ts";

interface Heading {
  slug: string;
  text: string;
}

// @ts-ignore: expression not callable
const md = markdownIt();
md.use(markdownItAttrs);

const crawlSlugs = ($: Element) => {
  const slugs: string[] = [],
    cache = ($: Element) => {
      if ($.hasAttribute("id")) slugs.push($.id);
      for (const $child of $.children) cache($child);
    };
  cache($);
  return slugs;
};

// for sidebar toc
export default () => {
  return (site: Site) => {
    site.preprocess([".html"], (page) => {
      const filename = page.src.path + page.src.ext;
      if (page.data.table_of_contents || !filename.endsWith(".md")) return;

      const content = Deno.readTextFileSync(site.src(filename)),
        headings: Heading[] = [],
        document = new DOMParser().parseFromString(
          // ignore frontmatter
          md.render(content.replace(/^---[\s\S]+?---/, "")),
          "text/html",
        )!,
        slugs: string[] = crawlSlugs(document.body);

      const hSelector = "h1, h2, h3, h4, h5, h6";
      for (const node of document.querySelectorAll(hSelector)) {
        const $h = <Element> node;
        headings.push({
          slug: $h.getAttribute("id") ?? slugify($h.innerText, slugs),
          text: $h.innerText.replace(/[\n\s]+/, " ").trim(),
        });
      }
      page.data.table_of_contents = headings;
    });

    site.process([".html"], (page) => {
      if (!page.document) return;

      const slugs: string[] = crawlSlugs(page.document.body),
        hSelector =
          ".prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6";
      for (const node of page.document.querySelectorAll(hSelector)) {
        const $h = <Element> node,
          id = $h.getAttribute("id") ?? slugify($h.innerText, slugs);
        $h.setAttribute("id", id);
      }
    });
  };
};
