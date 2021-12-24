/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import MarkdownIt from "https://cdn.skypack.dev/markdown-it?dts";

// displays language or additional meta e.g. filename
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
    const html = fence(...args);
    return meta || language
      ? html.replace(
        /^<pre>/,
        `<pre data-has-meta><div>${meta || language}</div>`,
      )
      : html;
  };
};
