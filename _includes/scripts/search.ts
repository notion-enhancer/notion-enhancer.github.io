/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

import { html, safe } from "./utils.ts";
import FuzzySet from "https://cdn.skypack.dev/fuzzyset.js";

const openSearchSel = '[data-action="open-search"]',
  searchBubbleSel = 'aside[aria-label="search"]',
  inputSel = `${searchBubbleSel} input[type="search"]`,
  clearSearchSel = `${searchBubbleSel} [data-action="clear-search"]`,
  closeSearchSel = `${searchBubbleSel} [data-action="close-search"]`,
  resultsListSel = `${searchBubbleSel} [aria-label="results"]`;

const isOpen = () => {
    const $searchBubble = <HTMLElement> document.querySelector(searchBubbleSel);
    return !$searchBubble.classList.contains("opacity-0");
  },
  open = () => {
    const $searchBubble = <HTMLElement> document.querySelector(searchBubbleSel),
      $searchInput = <HTMLElement> document.querySelector(inputSel);
    $searchBubble.classList.remove("pointer-events-none");
    $searchBubble.classList.remove("opacity-0");
    $searchInput.focus();
  },
  close = () => {
    const $searchBubble = <HTMLElement> document.querySelector(searchBubbleSel),
      $searchInput = <HTMLElement> document.querySelector(inputSel);
    $searchBubble.classList.add("pointer-events-none");
    $searchBubble.classList.add("opacity-0");
    $searchInput.blur();
  },
  toggle = () => {
    if (isOpen()) {
      close();
    } else open();
  },
  clear = () => {
    const $searchInput = <HTMLInputElement> document.querySelector(inputSel),
      $resultsList = <HTMLElement> document.querySelector(resultsListSel);
    $searchInput.value = "";
    $resultsList.innerHTML = "";
  };

const callToggleHotkey = (event: KeyboardEvent) => {
    const hotkey: Partial<KeyboardEvent> = {
      metaKey: false,
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      key: "k",
    };
    for (const prop in hotkey) {
      const key = <keyof KeyboardEvent> prop;
      if (event[key] !== hotkey[key]) return;
    }
    event.preventDefault();
    toggle();
  },
  callEscapeHotkey = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen()) close();
  },
  callNavigationHotkey = (event: KeyboardEvent) => {
    const $searchInput = <HTMLInputElement> document.querySelector(inputSel),
      $resultsList = <HTMLElement> document.querySelector(resultsListSel),
      activeElement = (<HTMLElement> document.activeElement),
      searchActive = $resultsList.contains(activeElement) ||
        activeElement === $searchInput;
    if (!searchActive) return;
    let $destination: HTMLElement | undefined | null;
    if (event.key === "ArrowUp") {
      if (activeElement === $searchInput) {
        $destination = $resultsList.lastElementChild?.querySelector("a");
      } else {
        const $focused = activeElement.closest("li"),
          $next = $focused?.previousElementSibling?.querySelector("a");
        $destination = $next || $searchInput;
      }
    }
    if (event.key === "ArrowDown") {
      if (activeElement === $searchInput) {
        $destination = $resultsList.querySelector("a");
      } else {
        const $focused = activeElement.closest("li"),
          $next = $focused?.nextElementSibling?.querySelector("a");
        $destination = $next || $resultsList.querySelector("a");
      }
    }
    if ($destination) {
      $destination.focus();
      requestAnimationFrame(() => {
        (<HTMLElement> $destination).scrollIntoView();
      });
    }
  };
document.addEventListener("keydown", (event) => {
  callToggleHotkey(event);
  callEscapeHotkey(event);
  callNavigationHotkey(event);
});

interface SearchResult {
  url: string;
  type: "page" | "heading" | "inline";
  section: string;
  page?: string;
  text: string;
}

const _indexCache: SearchResult[] = [],
  fetchIndex = async () => {
    if (_indexCache.length) return _indexCache;
    const res = await fetch("/search-index.json");
    _indexCache.push(...(await res.json()));
    return _indexCache;
  };

const renderResultBubble = (result: SearchResult, query: string) => {
    const icon = result.type === "page"
        ? "file-text"
        : (result.type === "heading" ? "hash" : "align-left"),
      regex = new RegExp(
        `(${safe(query).replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")})`,
        "ig",
      ),
      text = safe(result.text).replace(
        regex,
        (match) => `<mark class="search-result-highlight">${match}</mark>`,
      ),
      page = result.page ? `<p class="text-xs">${safe(result.page)}</p>` : "";
    const $resultBubble = html`<li>
      <a href="${safe(result.url)}" class="search-result group">
        <svg class="search-result-icon">
          <use href="/dep/feather-sprite.svg#${icon}"/>
        </svg>
        <div class="font-medium">
          <p class="text-sm">${text}</p> ${page}
        </div>
      </a>
    </li>`;
    $resultBubble.addEventListener("click", () => close());
    return $resultBubble;
  },
  renderSection = (section: string, results: SearchResult[], query: string) => {
    const $section = html`<ul></ul>`,
      $title = html`<li class="search-result-section">${safe(section)}</li>`;
    $section.append($title);
    for (const result of results) {
      $section.append(renderResultBubble(result, query));
    }
    return $section;
  };

const _fuzzycache: Record<string, Record<string, number>> = {},
  fuzzymatch = (a: string, b: string): number => {
    if (!_fuzzycache[a]) _fuzzycache[a] = {};
    if (_fuzzycache[a][b] === undefined) {
      const fuzzy = FuzzySet();
      fuzzy.add(a);
      _fuzzycache[a][b] = fuzzy.get(b, [[0]])[0][0];
    }
    return _fuzzycache[a][b];
  };

const prevSearch = {
    query: "",
    matches: [] as SearchResult[],
  },
  search = () => {
    const $searchInput = <HTMLInputElement> document.querySelector(inputSel),
      $resultsList = <HTMLElement> document.querySelector(resultsListSel);
    const query = $searchInput.value.toLowerCase(),
      index = query
        ? (prevSearch.matches.length && query.startsWith(prevSearch.query)
          ? prevSearch.matches
          : _indexCache)
        : _indexCache.filter((result) => result.type === "page"),
      exact = index.filter((result) =>
        result.text.toLowerCase().includes(query)
      ),
      fuzzy = index.filter((result) => fuzzymatch(result.text, query))
        .sort((a, b) => fuzzymatch(a.text, query) - fuzzymatch(b.text, query)),
      matches = [...(new Set([...exact, ...fuzzy]))],
      grouped = matches.reduce((groups, result) => {
        if (!groups[result.section]) groups[result.section] = [];
        groups[result.section].push(result);
        return groups;
      }, {} as Record<string, SearchResult[]>);
    prevSearch.query = query;
    prevSearch.matches = matches;

    $resultsList.innerHTML = "";
    for (const section in grouped) {
      $resultsList.append(renderSection(section, grouped[section], query));
    }
  };

export const initSearch = () => {
  clear();
  close();
  fetchIndex().then(() => {
    const $searchInput = <HTMLInputElement> document.querySelector(inputSel);
    if (!$searchInput.value) search();
  });

  const $openSearch = <HTMLElement> document.querySelector(openSearchSel),
    $searchInput = <HTMLElement> document.querySelector(inputSel),
    $clearSearch = <HTMLElement> document.querySelector(clearSearchSel),
    $closeSearch = <HTMLElement> document.querySelector(closeSearchSel);

  $openSearch.removeEventListener("click", open);
  $openSearch.addEventListener("click", open);
  $closeSearch.removeEventListener("click", close);
  $closeSearch.addEventListener("click", close);
  $clearSearch.removeEventListener("click", clear);
  $clearSearch.addEventListener("click", clear);
  $searchInput.removeEventListener("input", search);
  $searchInput.addEventListener("input", search);
};
