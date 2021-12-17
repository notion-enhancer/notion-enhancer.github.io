/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Site } from "https://deno.land/x/lume@v1.3.1/core.ts";
import { SitePage } from "https://deno.land/x/lume@v1.3.1/core/filesystem.ts";
import { extname } from "https://deno.land/x/lume@v1.3.1/deps/path.ts";
import { Element } from "https://deno.land/x/lume@v1.3.1/deps/dom.ts";

interface SearchResult {
  url: string;
  type: "page" | "heading" | "inline";
  section: string;
  page?: string;
  text: string;
}

// generates an index for consumption by search engines
export default (output = "/search-index.json") => {
  return (site: Site) => {
    site.addEventListener("beforeSave", () => {
      const index: SearchResult[] = [],
        pages = site.pages.sort((a, b) =>
          (a.data.section_order as number ?? 0) -
          (b.data.section_order as number ?? 0)
        );

      for (const page of pages) {
        if (page.dest.ext !== ".html") continue;
        if (page.dest.path === "/index") continue;
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

        const indexContainer = ($container: Element) => {
          for (const $element of $container.children) {
            const headingTags = ["h1", "h2", "h3", "h4", "h5", "h6"],
              listTags = ["ul", "ol"],
              isHeading = headingTags.includes($element.nodeName.toLowerCase()),
              isList = listTags.includes($element.nodeName.toLowerCase()),
              isListItem = $element.nodeName.toLowerCase() === "li",
              isCodeWithMeta = $element.matches("pre[data-has-meta]");

            const id = $element.getAttribute("id") || crypto.randomUUID(),
              result: Partial<SearchResult> = {
                url: `${url}#${id}`,
                type: "inline",
                section: <string> page.data.section,
                page: <string> page.data.title,
              };
            $element.setAttribute("id", id);

            if (isList) {
              indexContainer($element);
            } else if (isListItem) {
              result.text = $element.childNodes[0].textContent;
              index.push(result as SearchResult);
              indexContainer($element);
            } else if (isCodeWithMeta) {
              const meta = $element.children[0].innerText,
                code = $element.children[1].innerText;
              result.text = `${meta}: ${code}`;
              index.push(result as SearchResult);
            } else {
              if (isHeading) result.type = "heading";
              result.text = $element.innerText;
              index.push(result as SearchResult);
            }
          }
        };
        if (page.document) {
          const $post = page.document.querySelector(".prose");
          if ($post) indexContainer($post);
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
