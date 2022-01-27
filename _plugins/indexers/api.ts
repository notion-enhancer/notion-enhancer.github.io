/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { doc } from "https://deno.land/x/deno_doc@v0.24.0/mod.ts";
import {
  DocNodeNamespace,
  JsDocTagNamedTyped,
  JsDocTagTyped,
  JsDocTagUnsupported,
} from "https://deno.land/x/deno_doc@v0.24.0/lib/types.d.ts";

import makeloc from "https://x.nest.land/dirname@1.1.2/mod.ts";
const { __dirname } = makeloc(import.meta);

const api: string = Deno.args[0] || "./index.mjs",
  jsDoc = await doc(`file://${Deno.cwd()}/${api}`);

const index = jsDoc.map((namespace) => {
  const exports = (<DocNodeNamespace> namespace).namespaceDef.elements,
    descriptionElement = exports.find((element) => {
      const tag = <JsDocTagUnsupported> element?.jsDoc?.tags?.[0];
      if (
        tag?.value?.startsWith("@namespace ") &&
        tag?.value?.slice(11) === namespace.name
      ) {
        return true;
      }
    });
  return {
    namespace: namespace.name,
    description: descriptionElement?.jsDoc?.doc || "",
    exports: exports
      .filter((element) => {
        if (element.declarationKind !== "export") return false;
        return true;
      })
      .map((element) => {
        const tags = element?.jsDoc?.tags ?? [];
        return {
          name: element.name,
          type: (<JsDocTagTyped> tags.find((tag) =>
            tag.kind === "type"
          ))?.type ?? "function",
          doc: element.jsDoc?.doc ?? "",
          tags: tags.filter((tag) => tag.kind !== "type")
            .map((tag) => {
              if (tag.kind === "unsupported") {
                return {
                  kind: tag.value.split(" ")[0].slice(1),
                  doc: tag.value.split(" ").slice(1).join(" "),
                };
              }
              if ((<JsDocTagNamedTyped> tag).type?.endsWith("=")) {
                return {
                  ...tag,
                  type: (<JsDocTagNamedTyped> tag).type.slice(0, -1),
                  optional: true,
                };
              }
              return tag;
            }),
        };
      }),
  };
}).sort((a, b) => a.namespace.localeCompare(b.namespace));

await Deno.writeTextFile(
  `${__dirname}/../../documentation/_data.json`,
  JSON.stringify({
    section: "Developer Documentation",
    section_order: 4,
    layout: "docs.njk",
    tags: "documentation",
    api: index,
  }),
);
