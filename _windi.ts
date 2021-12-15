import { extname } from "https:/deno.land/x/lume@v1.3.1/deps/path.ts";
import { merge } from "https:/deno.land/x/lume@v1.3.1/core/utils.ts";
import { SitePage } from "https:/deno.land/x/lume@v1.3.1/core/filesystem.ts";
import { Page, Site } from "https:/deno.land/x/lume@v1.3.1/core.ts";

import Processor from "https://esm.sh/windicss@3.1.2";
import {
  CSSParser,
  HTMLParser,
} from "https://esm.sh/windicss@3.1.2/utils/parser";
import { StyleSheet } from "https://esm.sh/windicss@3.1.2/utils/style";

export interface Options {
  minify: boolean;
  mode: "interpret" | "compile";
  output: {
    // ouput mode "file"
    // = a single file will be created with generated styles
    //   from across the entire site
    // output mode "styleTag"
    // = a <style> tag will be inserted into each page
    //   containing only the generated styles for that page
    mode: "file" | "styleTag";
    filename?: string;
  };
  // https://github.com/windicss/windicss/blob/main/src/interfaces.ts#L367
  // https://windicss.org/guide/configuration.html
  config: Record<string, unknown>;
}

const defaults = {
  minify: false,
  mode: "interpret" as "interpret" | "compile",
  output: {
    mode: "file" as "file" | "styleTag",
    filename: "windi.css",
  },
  config: {},
};

/**
 * a lume plugin for windicss, the next generation utility-first css framework
 *
 * classnames from all built pages will be read/extracted
 * and only the necessary css will be generated
 *
 * the output css file must be manually included in your document's
 * head e.g. <link rel="stylesheet" href="/windi.css">
 */
export default function (userOptions: Partial<Options> = {}) {
  const options = merge(defaults, userOptions) as Options;

  return (site: Site) => {
    // create & configure a windicss instance
    // (config assignment merges provided with defaults)
    const processor = new Processor();
    options.config = processor.loadConfig(options.config);

    site.addEventListener("afterRender", () => {
      const pages = site.pages
        .filter((page) => page.dest.ext === ".html");

      if (options.output.mode === "file" && options.output.filename) {
        // create & merge stylesheets for all pages
        const stylesheet = pages
          .map((page) => windi(page, processor, options))
          .reduce(
            (previous, current) => previous.extend(current),
            new StyleSheet(),
          )
          .sort()
          .combine();

        // output css as a page
        const ext = extname(options.output.filename),
          path = options.output.filename.slice(0, -ext.length),
          page = new SitePage({ path, ext });
        page.content = stylesheet.build(options.minify);
        site.pages.push(page);
      } else if (options.output.mode === "styleTag") {
        // insert stylesheets directly into pages
        for (const page of pages) {
          const stylesheet = windi(page, processor, options);
          page.content += `<style>${stylesheet.build(options.minify)}</style>`;
        }
      }
    });
  };
}

export function windi(page: Page, processor: Processor, options: Options) {
  let content = page.content as string;
  const parser = new HTMLParser(content);

  // update page content with classnames output from windi
  // e.g. to expand variant:(class groups) and to support compile mode
  let stylesheet = new StyleSheet(), html = "", index = 0;
  for (const className of parser.parseClasses()) {
    html += content.substring(index, className.start);
    index = className.end;
    if (options.mode === "interpret") {
      const interpreted = processor.interpret(className.result);
      html += [...interpreted.success, ...interpreted.ignored].join(" ");
      stylesheet = stylesheet.extend(interpreted.styleSheet);
    } else if (options.mode === "compile") {
      const compiled = processor.compile(
        className.result,
        options.config.prefix as string || "windi-",
      );
      html += [compiled.className, ...compiled.ignored].join(" ");
      stylesheet = stylesheet.extend(compiled.styleSheet);
    }
  }
  content = html + content.substring(index);

  // attributify: https://windicss.org/features/attributify.html
  // reduceRight taken from https://github.com/windicss/windicss/blob/main/src/cli/index.ts
  const attrs: { [key: string]: string | string[] } = parser
    .parseAttrs()
    .reduceRight((a: { [key: string]: string | string[] }, b) => {
      if (b.key === "class" || b.key === "className") return a;
      if (b.key in a) {
        a[b.key] = Array.isArray(a[b.key])
          ? Array.isArray(b.value)
            ? [...(a[b.key] as string[]), ...b.value]
            : [...(a[b.key] as string[]), b.value]
          : [
            a[b.key] as string,
            ...(Array.isArray(b.value) ? b.value : [b.value]),
          ];
        return a;
      }
      return Object.assign(a, { [b.key]: b.value });
    }, {});
  const attributified = processor.attributify(attrs);
  stylesheet = stylesheet.extend(attributified.styleSheet);

  // style blocks: use @apply etc. in a style tag
  // will always replace the inline style block with the generated styles
  // https://windicss.org/features/directives.html
  // https://windicss.org/posts/language.html
  // https://windicss.org/integrations/cli.html#style-block
  content = content.replace(
    /<style lang=['"]windi["']>([\s\S]*)<\/style>/,
    (_match, css) => {
      return `<style>${
        new CSSParser(css, processor).parse().build(options.minify)
      }</style>`;
    },
  );

  page.content = content;

  if (!options.config.preflight) return stylesheet;
  const preflightSheet = processor.preflight(content);
  return stylesheet.extend(preflightSheet);
}
