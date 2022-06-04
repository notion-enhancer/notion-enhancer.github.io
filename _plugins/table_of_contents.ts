/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { slugify } from "https://deno.land/x/psyche@v0.3.0/indexers/shared.ts";

import type { Site } from "https://deno.land/x/lume@v1.9.1/core.ts";
import type { Element } from "https://deno.land/x/lume@v1.9.1/deps/dom.ts";
import { stringToDocument } from "https://deno.land/x/lume@v1.9.1/core/utils.ts";

interface Heading {
  slug: string;
  text: string;
}

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
      // deno-lint-ignore no-explicit-any
      const md = <any> site.formats.get(".md")!.engine,
        filename = page.src.path + page.src.ext;
      if (page.data.table_of_contents || !filename.endsWith(".md")) return;

      const content = <string> page.data.content,
        headings: Heading[] = [],
        document = stringToDocument(
          // ignore frontmatter
          md.render(content.replace(/^---[\s\S]+?---/, "")),
        ),
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
