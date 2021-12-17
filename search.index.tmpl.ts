/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { site } from "./_config.ts";
import { Data, Helper } from "https://deno.land/x/lume@v1.3.1/core.ts";

export const url = "/search.index.json";
export const renderOrder = 2; // after all others

interface Document {
  path: string;
  title: string;
  description: string;
  section: string;
  content: string;
}

export default (_data: Data, _helpers: Record<string, Helper>) => {
  const index: Document[] = [];

  for (const page of site.pages) {
    if (page.dest.ext !== ".html") continue;
    if (page.dest.path === "/index") continue;
    const document: Partial<Document> = {
      path: page.dest.path,
      title: <string> page.data.title ?? "",
      description: <string> page.data.description ?? "",
      section: <string> page.data.section ?? "",
    };
    if (page.src.ext === ".md") {
      // search based on markdown instead of html
      document.content = Deno.readTextFileSync(
        site.src(page.src.path + page.src.ext),
      ).trim();
      if (document.content.startsWith("---")) {
        // remove frontmatter
        const frontmatter = <RegExpMatchArray> document.content.match(/\n---/);
        if (frontmatter) {
          const end = (<number> frontmatter.index) + frontmatter[0].length;
          document.content = document.content.slice(end).trim();
        }
      }
    } else if (page.document) {
      // get renderer dom innertext if e.g. from a .njk
      document.content =
        page.document.querySelector(".prose")?.innerText?.trim() || "";
    } else document.content = "";
    index.push(document as Document);
  }

  return JSON.stringify(index);
};
