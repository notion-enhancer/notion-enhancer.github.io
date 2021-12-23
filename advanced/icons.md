---
title: Icons
description: Load sets of custom icons into Notion's icon picker for easy access.
order: 2
---

# Icons

> This is a feature intended for advanced users only. If you are unfamiliar
> with asset hosting or `.json` files, this guide may not be for you.

![](../assets/mods/icon-sets.jpg)

The _icon sets_ integration upgrades Notion's icon picker -
saving uploaded icon history, reducing decreases in image quality,
and adding entire sets of additional icons that can be selected.

The [notion-enhancer/icons](https://github.com/notion-enhancer/icons/)
repository provides a few pre-prepared icon sets that are loaded into the picker
by default. You can add your own sets to the picker by uploading a `.json` file of
the following format to the _icon sets_ integration's options in the menu.

#### Schema

The `.json` file should contain an array of icon set records
under the `"icons"` key.

| property               | description                                                                                                                                                       | type                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `name`                 | display name                                                                                                                                                      | string              |
| `source`               | if `sourceUrl` is defined: a list of icon filenames OR a file prefix for use with `count`. otherwise: a list of icon urls.                                        | strings[] \| string |
| `extension` (optional) | the icons' file extension (not necessary if `source` is an array of urls), e.g. `png`, `svg`.                                                                     | string              |
| `sourceUrl` (optional) | a base url for all icons in the set                                                                                                                               | string              |
| `count` (optional)     | if `sourceUrl` is defined: the `source` filename will be iterated from `0` to `count` with an underscore `_` in between, i.e. `source_0`, `source_1`, `source_2`. | number              |
| `author` (optional)    | name of the set's author.                                                                                                                                         | string              |
| `authorUrl` (optional) | link to the set's author's site.                                                                                                                                  | string              |

#### Example

![](../assets/screenshots/icon-sets-example.jpg)

```json
{
  "icons": [
    {
      "name": "Icons8 Fluent",
      "sourceUrl": "https://img.icons8.com/fluent/280/000000/",
      "source": ["source-code", "forward", "fire-element"],
      "extension": "png"
    }
  ]
}
```
