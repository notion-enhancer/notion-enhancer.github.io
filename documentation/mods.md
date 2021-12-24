---
title: Mods
description: How notion-enhancer mods are created.
order: 2
---

# Mods

> Before creating a mod, read the [Contributing](../about/contributing.md)
> guide for instructions on setting up a development environment and
> the guidelines that must be followed for a mod to be accepted by the
> notion-enhancer.

In its most basic form, a notion-enhancer mod is a folder containing a `mod.json`
file. This file defines mod metadata, scripts & styles:

| Property                  | Description                                                                                                                                                                             | Type       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `name`                    | display name                                                                                                                                                                            | string     |
| `id`                      | a unique uuidv4 identifier (generated via e.g. `uuidgen` or [uuidgenerator.net](https://www.uuidgenerator.net/))                                                                        | string     |
| `version`                 | a semver version number (MAJOR.MINOR.PATCH e.g. "0.5.2")                                                                                                                                | string     |
| `environments` (optional) | the environments the mod may run in - available environments are `linux`, `win32`, `darwin` and `extension` (leave blank for any)                                                       | string[]   |
| `description`             | a summary of the features provided by the mod (inline markdown available)                                                                                                               | string     |
| `preview` (optional)      | the relative filepath of a screenshot demonstrating the mod (should be in the same directory as the `mod.json` and have a non-generic name, e.g. `my-mod.png` instead of `preview.png`) | string     |
| `tags`                    | mod categorisation (e.g. `automation`) - must include at least one of `core`, `extension`, `theme` or `integration` (themes must also include either `dark` or `light`)                 | string     |
| `authors`                 | an array of [authors](#authors)                                                                                                                                                         | author[]   |
| `css`                     |                                                                                                                                                                                         | { }        |
| `css.frame` (optional)    | an array of relative filepaths to `.css` files                                                                                                                                          | string[]   |
| `css.client` (optional)   | an array of relative filepaths to `.css` files                                                                                                                                          | string[]   |
| `css.menu` (optional)     | an array of relative filepaths to `.css` files                                                                                                                                          | string[]   |
| `js`                      |                                                                                                                                                                                         | { }        |
| `js.frame` (optional)     | an array of relative filepaths to `.mjs` files (see the [Renderer Scripts](#renderer-scripts) section)                                                                                  | string[]   |
| `js.client` (optional)    | an array of relative filepaths to `.mjs` files (see the [Renderer Scripts](#renderer-scripts) section)                                                                                  | string[]   |
| `js.menu` (optional)      | an array of relative filepaths to `.mjs` files (see the [Renderer Scripts](#renderer-scripts) section)                                                                                  | string[]   |
| `js.electron` (optional)  | an array of relative `.cjs` sources & Electron targets (see the [Electron Scripts](#electron-scripts) section)                                                                          | electron[] |
| `options`                 | an array of [options](#options)                                                                                                                                                         | options[]  |

### Tags

Though all mods are made the same way, they are separated
conceptually. This forces mods to focus on doing one thing
well and makes configuration easier and safer.

It is usually recommended mods have 2 tags: a category and
a subcategory, e.g. an `extension` that deals with `layout` changes.

**Core** mods cannot be disabled (e.g. the menu), and are depended on by
other parts of the notion-enhancer. Most mods should _not_ have the `core` tag.

**Extensions** are general feature-enhancing mods.

- They should contain JavaScript.
- They may contain some supporting CSS.
- They should not change any CSS variables.
- They must have the `extension` tag.

**Themes** override Notion's default colour palette.

- They should primarily change the available
  [CSS theming variables](https://github.com/notion-enhancer/repo/blob/main/theming/variables.css).
- They may contain some supporting CSS.
- They should not contain layout changes or remove/hide UI elements.
- They may only use JavaScript to set user-configured colour values.
- They must have the `theme` tag.
- They must have either the `dark` tag or `light` tag. If there are both light
  and dark variants of the same theme they should be separated out into their own mods.

**Integrations** are extensions that use the [unofficial notion API](./api/#notion) to
access and modify Notion content.

- They should not do anything without explicit user interaction.
- They must be thoroughly tested to ensure they won't break the user's workspace.
- They must update Notion content.
- They may contain some supporting CSS.
- They should not change any CSS variables.
- They must have the `integration` tag.

### Authors

Mod authors are listed in the notion-enhancer menu and on the
notion-enhancer website. Multiple authors may be listed, e.g.
if you are porting a feature from elsewhere to the notion-enhancer.

If you are just contributing a minor bugfix to an existing mod,
do not add yourself to the author's list.

| Property           | Description                                             | Type   |
| ------------------ | ------------------------------------------------------- | ------ |
| `name`             | author name                                             | string |
| `email` (optional) | an email for e.g. emergency contact relating to the mod | string |
| `homepage`         | a link to the author's website or profile               | string |
| `avatar`           | the author's profile picture                            | string |

### Scripts & Styles

Scripts and styles can be loaded into a few different renderer processes:

- The **frame** is the parent renderer within which the Notion web client
  is loaded. This is only available within the app, and is e.g. where the
  _tabs_ mod places its tab bar.
- The **client** is the Notion web client, the same in the app and browser.
- The **menu** is the notion-enhancer menu, the same in the app and browser.

#### Themes

Themes should override [the available CSS theming variables](https://github.com/notion-enhancer/repo/blob/main/theming/variables.css)
in the document [`:root`](https://developer.mozilla.org/en-US/docs/Web/CSS/:root)
with a class specifying their mode, e.g.

```css
:root.light {
  --theme--bg: #93b8e7;
}
/* or */
:root.dark {
  --theme--bg: #0f111a;
}
```

Themes should override all colour variables - e.g. if card backgrounds and text colours
have been changed, but the main background colour is still the default Notion colour,
the theme is incomplete and will not be merged into the notion-enhancer.

#### Renderer Scripts

The default exports of mod scripts in renderer processes are called with 2 arguments:

- `api` is an object containing the notion-enhancer helper [API](./api.njk).
- `db` is an instance of the notion-enhancer's database scoped to the current mod.

  To save data to the database, run `await db.set(['path', 'of', 'keys], newValue)`.

  To get data from the database, run `await db.get(['path', 'of', 'keys], fallbackValue)`.

  Mod options are saved to this database and automatically fallback to the value provided
  in the `mod.json` file (e.g. to get an option with the key `display_mode`, run `await db.get(['display_mode'])`).

```mjs
export default async function (api, db) {
  //
}
```

#### Electron Scripts

Scripts inserted into the main Electron process should be defined in the `mod.json` file
with the following properties:

| Property | Description                                                                                  | Type   |
| -------- | -------------------------------------------------------------------------------------------- | ------ |
| `source` | a relative filepath to a `.cjs` file                                                         | string |
| `target` | a filepath to one of the Notion app's `.js` files, relative to the `resources/app` directory | string |

These receive an additional 2 arguments:

- `__exports` is a reference to the target/parent script's `module.exports` object,
  and can be modified to override exports from the parent script.
- `__eval` is a function that can be called with a single string to execute as JavaScript
  in the parent scope, e.g. to modify/override non-exported variables and functions. This string
  should never be dynamic (see [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval)).

```cjs
module.exports = async function (api, db, __exports, __eval) {
  //
};
```

#### Options

Mod options are configurable through the notion-enhancer menu
and accessibe through the mod database (see above). A few base
properties should be provided with all options in the `mod.json` file:

| Property                  | Description                                                                                                                                       | Type   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `type`                    | the option type (see below)                                                                                                                       | string |
| `key`                     | the mod database key to access/set the option value to                                                                                            | string |
| `label`                   | the option's display name                                                                                                                         | string |
| `tooltip` (optional)      | an extended description of what the option will affect (inline markdown available, bold text will be black and normal text will be grey)          | string |
| `environments` (optional) | the environments the option will be configurable in - available environments are `linux`, `win32`, `darwin` and `extension` (leave blank for any) | string |

- Option type: `toggle`

  | Property | Description                            | Type    |
  | -------- | -------------------------------------- | ------- |
  | `value`  | the default on/off state of the toggle | boolean |

- Option type: `select`

  | Property | Description                                                        | Type     |
  | -------- | ------------------------------------------------------------------ | -------- |
  | `values` | an array of selectable values, with the first value as the default | string[] |

- Option type: `text`

  | Property | Description                         | Type   |
  | -------- | ----------------------------------- | ------ |
  | `value`  | the default value of the text input | string |

- Option type: `number`

  | Property | Description                           | Type   |
  | -------- | ------------------------------------- | ------ |
  | `value`  | the default value of the number input | number |

- Option type: `hotkey`

  > Record user keypresses to create hotkey accelerators
  > for handling with [`api.web.addHotkeyListener`](./api/#web.addhotkeylis).

  | Property | Description                                        | Type   |
  | -------- | -------------------------------------------------- | ------ |
  | `value`  | the default hotkey accelerator e.g. `Ctrl+Shift+X` | string |

- Option type: `color`

  > `rgba()` color pickers.

  | Property | Description            | Type   |
  | -------- | ---------------------- | ------ |
  | `value`  | the default rgba color | string |

- Option type: `file`

  > Accept file uploads that are stored in the database as
  > `{ filename: string, content: blob | string }`.

  | Property     | Description                          | Type     |
  | ------------ | ------------------------------------ | -------- |
  | `extensions` | allowed file extensions e.g. `.json` | string[] |

> For working examples of existing mods, check out the
> [notion-enhancer/repo](https://github.com/notion-enhancer/repo) repository.
> A `mod.json` generator and graphical theme builder are work-in-progress.
