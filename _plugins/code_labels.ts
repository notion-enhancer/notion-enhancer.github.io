/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import type MarkdownIt from "https://cdn.skypack.dev/markdown-it?dts";

// invisible within pages, shows up in search index
const colon = '<span style="display:none">: </span>';

// displays language or other meta e.g. filename
// at the top of code blocks
export default (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!;
  // deno-lint-ignore no-explicit-any
  md.renderer.rules.fence = (...args: any) => {
    const token = args[0][args[1]],
      info = token.info.split(" "),
      language = info.length ? info.shift() : "",
      meta = info.join(" ");
    token.info = language;
    const html = fence(...args),
      label = `<div>${meta || language}${colon}</div>`;
    return meta || language
      ? html.replace(/^<pre>/, `<pre data-labelled>${label}`)
      : html;
  };
};
