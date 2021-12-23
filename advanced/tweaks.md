---
title: Tweaks
description: insert custom code through the notion-enhancer
order: 1
---

# Tweaks

> This is a feature intended for advanced users only. If you do not
> know what CSS is or how to inspect the DOM, this guide is not for you.

Enhancing the layout and appearance of Notion beyond what the
notion-enhancer's themes and extensions offer can be done by
injecting custom CSS into the client:

1. Create a `.css` text file containing your desired CSS
   (ensure your file manager has "show file extensions" enabled).

2. In the notion-enhancer menu, enable the _tweaks_ mod and open
   its options in the sidebar. Click the "Upload file..." button beneath
   the "css insert" option and select the `.css` file you created.

   > Note: previously, uploads were linked to the original files and
   > would reflect changes. This is no longer the case - uploaded files are
   > stored in memory and must be re-uploaded to reflect edits.
   >
   > This also means relative `@import` statements will not work.

The majority of CSS rules will need to be appended with `!important` to
override Notion's inline styling and selectors will need to be based on a
combination of classes, parents and attributes. The most reliable way to
create and test a tweak is with a combination of **DevTools → Inspect Element**
and experimentation.

The notion-enhancer's theming variables can also be overridden for colour/theme
customisation. You can find all available variables and their default values
[here](https://github.com/notion-enhancer/repo/blob/main/theming/variables.css).

A few pre-created & pre-tested tweaks are available below. Others can be found in the
[legacy documentation](https://github.com/notion-enhancer/desktop/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/STYLING.md)
or the [archived tweaks repository](https://github.com/notion-enhancer/tweaks), but may not work reliably.

If one of the tweaks below isn't working, or you would like to add a new tweak
to the list, please create an issue or a pull request in the
[notion-enhancer/notion-enhancer.github.io](https://github.com/notion-enhancer/notion-enhancer.github.io/)
repository.

---

#### Smaller Page Icons

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147211740-37144cb7-78c9-4e54-819a-5f9fb8fe3566.png)

```css
/* make icon relative to title container */
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child {
  padding-top: 32px;
  position: relative;
}
/* size icon */
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-record-icon[style*='height: 140px'],
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-record-icon[style*='height: 78px'] {
  width: 32px !important;
  height: 32px !important;
}
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-record-icon[style*='height: 140px']
  *,
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-record-icon[style*='height: 78px']
  * {
  width: 100% !important;
  height: 100% !important;
}
/* position icon */
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-record-icon[style*='height: 140px'],
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-record-icon[style*='height: 78px'] {
  margin-top: 16px !important;
  margin-right: 8px !important;
  float: left;
}
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-page-controls {
  position: absolute !important;
  top: -5px;
}
/* emojis */
.notion-scroller[style*='display: flex; flex-direction: column']
  > [style$='z-index: 3; flex-shrink: 0;']
  > :first-child
  > :first-child
  .notion-record-icon
  [style*='font-size: 78px'] {
  font-size: 32px !important;
}
/* remove extra space at top when there's no icon or cover */
.notion-page-controls[style*='margin-top: 80px'],
.notion-page-controls[style*='margin-top: 32px'] {
  margin-top: 8px !important;
}
```

#### Narrow Table Columns

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147212962-aa9eb26c-bab1-44df-b3c3-d8c3c3c6eb75.png)

```css
[class*=' notion-collection_view'][data-block-id='TABLE_ID']
  > div
  > div
  > :nth-child(COLUMN_NUMBER)
  > div
  > .notion-table-view-header-cell,
[class*=' notion-collection_view'][data-block-id='TABLE_ID']
  > :nth-child(3)
  > div
  > :nth-child(COLUMN_NUMBER) {
  width: 32px !important;
}
```

#### Minify Breadcrumbs

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147213765-bfe766a4-da95-4261-995a-b3b1a08a330e.png)

```css
/* remove icon margin */
.notion-topbar .notranslate[style*='margin-right: 8px'] [role='button'] .notion-record-icon {
  margin-right: 0 !important;
}
/* position page title */
.notion-topbar .notranslate[style*='margin-right: 8px'] .notion-selectable:hover {
  z-index: 999;
}
.notion-topbar .notranslate[style*='margin-right: 8px'] [role='button'] {
  position: relative;
}
.notion-topbar
  .notranslate[style*='margin-right: 8px']
  [role='button']
  .notion-record-icon
  + div {
  background: var(--theme--ui_interactive-active);
  height: 24px;
  padding: 0 6px;
  border-radius: 3px;
  position: absolute;
  left: 26px;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.notion-topbar
  .notranslate[style*='margin-right: 8px']
  [role='button']
  .notion-record-icon
  + div {
  transition: opacity 20ms ease-in, max-width 300ms ease-in !important;
}
/* slide out title on hover */
.notion-topbar
  .notranslate[style*='margin-right: 8px']
  [role='button']:not(:hover)
  .notion-record-icon
  + div {
  opacity: 0;
  max-width: 0px !important;
}
.notion-topbar
  .notranslate[style*='margin-right: 8px']
  [role='button']:hover
  .notion-record-icon
  + div {
  opacity: 1;
}
.notion-topbar
  .notranslate[style*='margin-right: 8px']
  [role='button']:hover
  .notion-record-icon,
.notion-topbar
  .notranslate[style*='margin-right: 8px']
  [role='button']:hover
  .notion-record-icon
  + div {
  transition-delay: 200ms !important;
}
```

#### Remove Linked Page Arrows

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147217098-020034ab-a487-4456-bfea-f4df525cb9f5.png)

```css
.pageLinkIndicator {
  display: none !important;
}
```

#### Unrounded Page Icons

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147217751-2c17b20d-7c94-40fe-b9c3-9ccf9b716319.png)

```css
.notion-record-icon,
.notion-record-icon img {
  border-radius: 0px !important;
}
```

#### Centre-Aligned Table Headers

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147216738-8712dd75-6784-4993-b1c8-987bc9f4acb1.png)

```css
.notion-table-view-header-cell > div > div {
  margin: 0px auto;
}
```

#### Remove Table Header Icons

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147215074-4b6ac261-7248-41c5-8c53-1a75cfcb0f68.png)

```css
.notion-table-view-header-cell [style^='margin-right: 6px;'] {
  display: none !important;
}
```

#### Fira Math Equation Font

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147216250-ec62cb39-a03a-44e3-b5fe-827805b3ed7a.png)

```css
@import url('https://firamath.github.io/css/firamath.css');
.katex * {
  font-family: 'Fira Math' !important;
}
```

#### Hide Page Backlinks

> Last updated: 2021-12-23

```css
.notion-page-details-controls {
  display: none !important;
}
```

#### Hide Page Discussions

> Last updated: 2021-12-23

```css
.notion-page-view-discussion,
.notion-page-view-discussion + [style*='width: 100%; height: 1px;'] {
  display: none !important;
}
```

#### Hide Callout Icons

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147214796-7171e250-9ae9-4cbd-a06b-199851529801.png)

```css
.notion-selectable.notion-callout-block .notion-record-icon {
  display: none !important;
}
```

#### Hide Sidebar New Page Button

> Last updated: 2021-12-23

```css
.notion-sidebar > :nth-child(7) > .notion-focusable {
  display: none !important;
}
```

#### Compact Code Blocks

> Last updated: 2021-12-23

![](https://user-images.githubusercontent.com/16874139/147216542-e508a7c7-efba-4fb0-8661-275acf3d10a8.png)

```css
.notion-code-block.line-numbers > div {
  padding-top: 14px !important;
  padding-bottom: 14px !important;
}
.notion-code-block .code_line_numbers--plain {
  top: 14px !important;
  bottom: 14px !important;
}
```
