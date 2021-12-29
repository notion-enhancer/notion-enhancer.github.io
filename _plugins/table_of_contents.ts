/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Site } from "https://deno.land/x/lume@v1.4.1/core.ts";
import {
  DOMParser,
  Element,
} from "https://deno.land/x/lume@v1.4.1/deps/dom.ts";
import { createSlugifier } from "https://deno.land/x/lume@v1.4.1/plugins/slugify_urls.ts";
import {
  markdownIt,
  markdownItAttrs,
} from "https://deno.land/x/lume@v1.4.1/deps/markdown_it.ts";

interface Heading {
  level: number;
  slug: string;
  text: string;
}

// @ts-ignore: expression not callable
const md = markdownIt(),
  slugify = createSlugifier(),
  slugifyHeading = (
    heading: Partial<Heading>,
    cache: Heading[] = [],
  ): Partial<Heading> => {
    let dups = 0;
    const baseSlug = heading.slug || slugify(heading.text || ""),
      computedSlug = () => (dups ? `${baseSlug}-${dups}` : baseSlug);
    while (cache.find(({ slug }) => slug === computedSlug())) dups++;
    heading.slug = computedSlug();
    cache.push(heading as Heading);
    return heading;
  };
md.use(markdownItAttrs);

// for sidebar toc
export default () => {
  return (site: Site) => {
    site.preprocess([".html"], (page) => {
      const filename = page.src.path + page.src.ext;
      // filename also used for "edit this page" links
      page.data.filename = filename;
      if (!page.data.table_of_contents) {
        const content = Deno.readTextFileSync(site.src(filename)),
          tableOfContents: Heading[] = [];
        for (const match of content.matchAll(/\n(#+) (.+)/g)) {
          const $h = new DOMParser().parseFromString(
              md.render(`${match[1]} ${match[2]}`),
              "text/html",
            )!.querySelector(`h${match[1].length}`)!,
            heading: Partial<Heading> = {
              level: match[1].length,
              text: $h.innerText,
              slug: $h.getAttribute("id") ?? "",
            };
          slugifyHeading(heading, tableOfContents);
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
          const $h = <Element> node,
            heading: Partial<Heading> = {
              text: $h.innerText,
              slug: $h.getAttribute("id") ?? "",
            };
          slugifyHeading(heading, tableOfContents);
          $h.setAttribute("id", heading.slug);
        });
    });
  };
};
