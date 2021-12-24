/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

import { html, safe } from "./utils.ts";
import FuzzySet from "https://cdn.skypack.dev/fuzzyset.js";
import featherIcons from "https://cdn.skypack.dev/feather-icons";

interface SearchResult {
  url: string;
  type: "page" | "heading" | "inline";
  section: string;
  page?: string;
  text: string;
}

const $ = {
  triggers: () => document.querySelectorAll('[data-action="open-search"]'),
  header: () => <HTMLElement> document.querySelector("header"),
  showTrigger: ($t: Element) =>
    !$.header().contains($t) && location.pathname !== "/" ? "add" : "remove",
  container: () =>
    <HTMLElement> document.querySelector('aside[aria-label="search"]'),
  input: () =>
    <HTMLInputElement> $.container().querySelector('input[type="search"]'),
  clear: () =>
    <HTMLElement> $.container().querySelector('[data-action="clear-search"]'),
  close: () =>
    <HTMLElement> $.container().querySelector('[data-action="close-search"]'),
  resultsList: () =>
    <HTMLElement> $.container().querySelector('[aria-label="results"]'),
  results: () => Array.from($.resultsList().querySelectorAll("a")),
};

const gui: Record<string, () => unknown> = {};
gui.isOpen = () => !$.container().classList.contains("opacity-0");
gui.open = () => {
  $.container().classList.remove("pointer-events-none", "opacity-0");
  $.input().focus();
};
gui.close = () => {
  $.container().classList.add("pointer-events-none", "opacity-0");
  $.input().blur();
};
gui.toggle = () => gui.isOpen() ? gui.close() : gui.open();
gui.clear = () => {
  (<HTMLInputElement> $.input()).value = "";
  $.resultsList().innerHTML = "";
};

gui.scrollResultsToTop = () => $.resultsList().scrollTo({ top: 0 });
gui.scrollActiveToCenter = () =>
  document.activeElement?.scrollIntoView?.({ block: "center" });
gui.focusPrev = () => {
  if (!gui.isOpen()) return;
  const $results = $.results(),
    i = $results.findIndex(($r) => $r === document.activeElement);
  if (document.activeElement === $.input()) {
    $results[$results.length - 1]?.focus({ preventScroll: true });
  } else if (i > 0) {
    $results[i - 1]?.focus({ preventScroll: true });
  } else {
    $.input().focus();
    gui.scrollResultsToTop();
  }
  gui.scrollActiveToCenter();
};
gui.focusNext = () => {
  if (!gui.isOpen()) return;
  const $results = $.results(),
    i = $results.findIndex(($r) => $r === document.activeElement);
  if (document.activeElement === $.input()) {
    $results[0]?.focus({ preventScroll: true });
  } else if (i > -1 && i < $results.length - 1) {
    $results[i + 1]?.focus({ preventScroll: true });
  } else {
    $.input().focus();
    gui.scrollResultsToTop();
  }
  gui.scrollActiveToCenter();
};

// deno-lint-ignore no-explicit-any
const widgets: Record<string, (...args: any) => HTMLElement | string> = {};
widgets.highlight = (str: string, query: string) => {
  const caseInsensitive = `(${
    safe(query).replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")
  })`;
  return str.replace(
    new RegExp(caseInsensitive, "ig"),
    (match) => `<mark class="search-result-highlight">${match}</mark>`,
  );
};
widgets.result = (result: SearchResult, query: string) => {
  const icon = result.type === "page"
    ? "file-text"
    : (result.type === "heading" ? "hash" : "align-left");
  const $result = html`<li>
    <a href="${safe(result.url)}" class="search-result group">
      ${featherIcons.icons[icon].toSvg({ class: "search-result-icon" })}
      <div class="font-medium">
        <p class="text-sm">${widgets.highlight(safe(result.text), query)}</p>
        ${result.page ? `<p class="text-xs">${safe(result.page)}</p>` : ""}
      </div>
    </a>
  </li>`;
  $result.addEventListener("click", gui.close);
  return $result;
};
widgets.section = (section: string, results: SearchResult[], query: string) => {
  const $section = html`<ul>
    <li class="search-result-section">${safe(section)}</li>
  </ul>`;
  for (const result of results) $section.append(widgets.result(result, query));
  return $section;
};

const _indexCache: SearchResult[] = [],
  fetchIndex = async () => {
    if (_indexCache.length) return _indexCache;
    const res = await fetch("/search-index.json");
    _indexCache.push(...(await res.json()));
    return _indexCache;
  };

const _fuzzyCache: Record<string, Record<string, number>> = {},
  fuzzyMatch = (a: string, b: string): number => {
    if (!_fuzzyCache[a]) _fuzzyCache[a] = {};
    if (_fuzzyCache[a][b] === undefined) {
      const fuzzy = FuzzySet();
      fuzzy.add(a);
      _fuzzyCache[a][b] = fuzzy.get(b, [[0]])[0][0];
    }
    return _fuzzyCache[a][b];
  },
  exactMatch = (a: string, b: string): boolean =>
    a.toLowerCase().includes(b.toLowerCase());

const _history = [{
    query: "",
    results: (await fetchIndex()).filter((result) => result.type === "page"),
    time: Date.now(),
  }],
  search = async () => {
    const time = Date.now(),
      query = (<HTMLInputElement> $.input()).value.toLowerCase(),
      historyIndex = _history.findIndex((cached) => cached.query === query);
    let results;
    if (historyIndex < 0) {
      const prev = _history[0],
        index = prev && prev.query && query.startsWith(prev.query)
          ? prev.results
          : (await fetchIndex()),
        exact = index.filter((result) => exactMatch(result.text, query)),
        fuzzy = index.filter((result) => !exact.includes(result))
          .filter((result) => fuzzyMatch(result.text, query))
          .sort((a, b) =>
            fuzzyMatch(a.text, query) - fuzzyMatch(b.text, query)
          );
      results = [...exact, ...fuzzy];
    } else results = _history.splice(historyIndex, 1)[0].results;
    _history.unshift({ query, results, time });

    const grouped = results.reduce((groups, result) => {
      if (!groups[result.section]) groups[result.section] = [];
      groups[result.section].push(result);
      return groups;
    }, {} as Record<string, SearchResult[]>);
    $.resultsList().innerHTML = "";
    for (const section in grouped) {
      if (_history[0]?.time !== time) return;
      $.resultsList().append(widgets.section(section, grouped[section], query));
      await new Promise((res, _rej) => requestIdleCallback(res));
    }
  };

const hotkeys = [
  // toggle
  (event: KeyboardEvent) => {
    const pressed = !event.shiftKey && !event.altKey &&
      (event.metaKey || event.ctrlKey) && !(event.metaKey && event.ctrlKey) &&
      event.key === "k";
    if (pressed) {
      event.preventDefault();
      gui.toggle();
    }
  },
  // navigation
  (event: KeyboardEvent) => {
    if (!gui.isOpen()) return;
    if (event.key === "Escape") gui.close();
    if (event.key === "ArrowUp") {
      event.preventDefault();
      gui.focusPrev();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      gui.focusNext();
    }
    if (event.key === "/" && document.activeElement !== $.input()) {
      event.preventDefault();
      $.input().focus();
    }
    if (event.key === "Enter" && document.activeElement === $.input()) {
      gui.focusNext();
      (<HTMLElement> document.activeElement)?.click();
    }
  },
];

export const initSearch = () => {
  gui.clear();
  gui.close();
  fetchIndex().then(() => {
    if (!(<HTMLInputElement> $.input()).value) search();
  });

  $.triggers().forEach(($t) => {
    $t.removeEventListener("click", gui.open as EventListener);
  });
  $.triggers().forEach(($t) => {
    $t.classList[$.showTrigger($t)]("sm:pointer-events-none", "sm:opacity-0");
    $t.addEventListener("click", gui.open as EventListener);
  });
  $.close().removeEventListener("click", gui.close);
  $.close().addEventListener("click", gui.close);
  $.clear().removeEventListener("click", gui.clear);
  $.clear().addEventListener("click", gui.clear);
  $.input().removeEventListener("input", search);
  $.input().addEventListener("input", search);

  for (const hotkey of hotkeys) {
    document.removeEventListener("keydown", hotkey);
    document.addEventListener("keydown", hotkey);
  }
};
