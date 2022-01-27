/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

type Env = "linux" | "win32" | "darwin" | "extension";

interface BaseOption {
  key: string;
  label: string;
  tooltip?: string;
  environments?: Env[];
}
interface ToggleOption extends BaseOption {
  type: "toggle";
  value: boolean;
}
interface SelectOption extends BaseOption {
  type: "select";
  value: string[];
}
interface TextOption extends BaseOption {
  type: "text";
  value: string;
}
interface HotkeyOption extends BaseOption {
  type: "hotkey";
  // hotkey accelerator e.g. "Ctrl+Shift+X"
  value: string;
}
interface NumberOption extends BaseOption {
  type: "number";
  value: number;
}
interface ColorOption extends BaseOption {
  type: "color";
  // color: rgb[a], hsl, hex
  value: string;
}
interface FileOption extends BaseOption {
  type: "file";
  // file ext e.g. ".json"
  extensions: string[];
}
type Option =
  | ToggleOption
  | SelectOption
  | TextOption
  | HotkeyOption
  | NumberOption
  | ColorOption
  | FileOption;

interface Mod {
  name: string;
  // uuid
  id: string;
  // semver
  version: string;
  environments?: Env[];
  description: string;
  // file | url
  preview?: string;
  // inc. one of: core, extension, theme, integration
  tags: string[];
  authors: Array<{
    name: string;
    email?: string;
    // url
    homepage: string;
    // url
    avatar: string;
  }>;
  css: {
    // file.css
    frame?: string[];
    // file.css
    client?: string[];
    // file.css
    menu?: string[];
  };
  js: {
    // file.mjs
    frame?: string[];
    // file.mjs
    client?: string[];
    // file.mjs
    menu?: string[];
    electron?: Array<{
      // file.cjs (within mod)
      source: string;
      // file.js (within electron)
      target: string;
    }>;
  };
  options: Option[];
}

import makeloc from "https://x.nest.land/dirname@1.1.2/mod.ts";
const { __dirname } = makeloc(import.meta),
  json = (path: string) => Deno.readTextFile(path).then(JSON.parse);

const repo: string = Deno.args[0] || ".",
  registry: string[] = await json(`${repo}/registry.json`),
  index: { tag?: string; category: string; mods: Mod[] }[] = [
    { tag: "core", category: "Core", mods: [] },
    { tag: "extension", category: "Extensions", mods: [] },
    { tag: "theme", category: "Themes", mods: [] },
    { tag: "integration", category: "Integrations", mods: [] },
  ];

for (const mod of registry) {
  const meta = await json(`${repo}/${mod}/mod.json`);
  for (const group of index) {
    if (meta.tags.includes(group.tag)) {
      meta.tags = meta.tags
        .filter((tag: string) => tag !== group.tag)
        .map((tag: string) => `#${tag}`)
        .join(" ");
      meta.category = group.category;
      delete meta.css;
      delete meta.js;
      delete meta.options;
      if (meta.preview) {
        await Deno.copyFile(
          `${repo}/${mod}/${meta.preview}`,
          `${__dirname}/../../assets/mods/${meta.preview}`,
        );
      }
      group.mods.push(meta);
      break;
    }
  }
}
for (const group of index) delete group.tag;

await Deno.writeTextFile(
  `${__dirname}/../../getting-started/_data.json`,
  JSON.stringify({
    section: "Getting Started",
    section_order: 1,
    layout: "docs.njk",
    tags: "getting-started",
    mods: index,
  }),
);
