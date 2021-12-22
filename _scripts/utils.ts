/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

export const safe = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")
    .replace(/\\/g, "&#x5C;");

export const html = (str: TemplateStringsArray, ...templates: unknown[]) => {
  const $fragment = document.createRange().createContextualFragment(
    str.map((str) => {
      let tmpl = templates.shift();
      if (!["string", "number"].includes(typeof tmpl)) {
        tmpl = safe(JSON.stringify(tmpl, null, 2) ?? "");
      }
      return str + tmpl;
    }).join(""),
  );
  return <HTMLElement> ($fragment.children.length === 1
    ? $fragment.children[0]
    : $fragment.children);
};
