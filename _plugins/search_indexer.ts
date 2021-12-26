/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Site } from "https://deno.land/x/lume@v1.3.1/core.ts";
import { SitePage } from "https://deno.land/x/lume@v1.3.1/core/filesystem.ts";
import { extname } from "https://deno.land/x/lume@v1.3.1/deps/path.ts";
import { Element } from "https://deno.land/x/lume@v1.3.1/deps/dom.ts";
import { createSlugifier } from "https://deno.land/x/lume@v1.3.1/plugins/slugify_urls.ts";

interface SearchResult {
  url: string;
  type: "page" | "heading" | "inline";
  section: string;
  page?: string;
  text: string;
}

const slugify = createSlugifier(),
  slugifyString = (str: string, cache: string[] = []): string => {
    let dups = 0;
    const baseSlug = slugify(str.slice(0, 16)),
      computedSlug = () => (dups ? `${baseSlug}-${dups}` : baseSlug);
    while (cache.find((slug) => slug === computedSlug())) dups++;
    cache.push(computedSlug());
    return computedSlug();
  };

// generates an index for consumption by search engines
export default (output = "/search-index.json") => {
  return (site: Site) => {
    site.addEventListener("beforeSave", () => {
      const index: SearchResult[] = [],
        pages = site.pages.filter((p) =>
          !p.data.draft &&
          p.data.section &&
          p.dest.ext === ".html"
        ).sort((a, b) =>
          (a.data.order as number ?? 0) -
          (b.data.order as number ?? 0)
        ).sort((a, b) =>
          (a.data.section_order as number ?? 0) -
          (b.data.section_order as number ?? 0)
        );

      for (const page of pages) {
        if (page.dest.ext !== ".html") continue;
        const url = page.dest.path.endsWith("/index")
            ? page.dest.path.slice(0, -"/index".length)
            : page.dest.path,
          title: SearchResult = {
            url,
            type: "page",
            section: <string> page.data.section,
            text: <string> page.data.title,
          };
        index.push(title);

        const slugCache: string[] = [],
          indexContainer = ($container: Element) => {
            for (let $element of $container.children) {
              const containerTags = [
                  "UL",
                  "OL",
                  "DIV",
                  "TABLE",
                  "THEAD",
                  "TBODY",
                  "TR",
                ],
                headingTags = ["H1", "H2", "H3", "H4", "H5", "H6"],
                isContainer = containerTags.includes($element.nodeName),
                isHeading = headingTags.includes($element.nodeName),
                isListItem = $element.nodeName === "LI",
                isNestedListParent = isListItem &&
                  $element.childNodes[0]?.nodeName === "P",
                isBlockquote = $element.nodeName === "BLOCKQUOTE",
                preserveWhitespace = $element.nodeName === "PRE",
                isCodeWithMeta = $element.matches("pre[data-has-meta]");

              if (isContainer) {
                indexContainer($element);
                continue;
              }

              const result: Partial<SearchResult> = {
                type: "inline",
                section: <string> page.data.section,
                page: <string> page.data.title,
              };

              if (isListItem) {
                if (!isNestedListParent) result.text = $element.innerText;
              } else if (isCodeWithMeta) {
                const meta = $element.children[0].innerText,
                  code = $element.children[1].innerText;
                result.text = `${meta}: ${code}`;
              } else {
                if (isBlockquote) $element = $element.children[0];
                if (isHeading) result.type = "heading";
                result.text = $element.innerText;
              }

              if (result.text) {
                if (preserveWhitespace) {
                  result.text = result.text.replace(/\n+/g, " ");
                }
                const id = $element.getAttribute("id") ||
                  slugifyString(result.text, slugCache);
                $element.setAttribute("id", id);
                result.url = `${url}#${id}`;
                index.push(result as SearchResult);
              }
              if (isNestedListParent) indexContainer($element);
            }
          };
        if (page.document) {
          const $post = page.document.querySelector(".prose");
          if ($post) {
            // strangely, * and [id] didn't work
            $post.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(
              ($node) => {
                const $element = <Element> $node,
                  id = $element.getAttribute("id");
                if (id) slugCache.push(id);
              },
            );
            indexContainer($post);
          }
        }
      }

      // output index as a page
      const ext = extname(output),
        path = output.slice(0, -ext.length),
        page = new SitePage({ path, ext });
      page.content = JSON.stringify(index);
      site.pages.push(page);
    });
  };
};
