/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />

"use strict";

const _routeListeners: Array<() => void> = [];
export const onRouteChange = (handler: () => void) => {
  _routeListeners.push(handler);
};

const promisifyAnimation = (
  $element: HTMLElement,
  animation: [Keyframe[], KeyframeAnimationOptions],
) => {
  return new Promise((res, _rej) => {
    $element.animate(...animation).onfinish = () => res(true);
  });
};

const getScrollParent = ($element: HTMLElement) => {
    const position = getComputedStyle($element).position;
    while ($element.parentElement) {
      if (position === "fixed") break;
      $element = $element.parentElement;
      const style = getComputedStyle($element),
        skipStaticParent = position === "absolute" &&
          style.position === "static",
        scrollContainer = /(auto|scroll)/.test(
          style.overflow + style.overflowY + style.overflowX,
        );
      if (!skipStaticParent && scrollContainer) return $element;
    }
    return document.body;
  },
  scrollTo = (hash: string) => {
    const $target = document.getElementById(hash);
    if ($target) {
      const $scrollParent = getScrollParent($target);
      $scrollParent.scrollTo({ top: $target.offsetTop });
    }
  };

let _currentRoute = location.pathname;
const _responseCache = new Map(),
  _bodyCache = new Map();

export const handlePostRoute = () => {
  _currentRoute = location.pathname;
  _routeListeners.forEach((handler) => handler());
  // remove e.g. success messages from url
  if (location.hash) {
    scrollTo(location.hash.slice(1) as string);
    history.replaceState(null, "", location.hash);
  } else {
    history.replaceState(null, "", location.pathname);
  }
};

const triggerRouteChange = async (
  destination: string,
  res: Promise<Response>,
) => {
  const $progressBar = document.createElement("div");
  document.body.append($progressBar);
  $progressBar.style.position = "absolute";
  $progressBar.style.height = "2px";
  $progressBar.style.width = "0%";
  $progressBar.style.top = "0";
  $progressBar.style.left = "0";
  $progressBar.style.background = "rgba(147,197,253)";
  const animateProgress = async (percentage: number, duration = 500) => {
    await promisifyAnimation($progressBar, [
      [{ width: $progressBar.style.width }, { width: `${percentage}%` }],
      { duration, easing: "ease-out" },
    ]);
    $progressBar.style.width = `${percentage}%`;
  };

  let body = _bodyCache.get(res);
  const animation = body ? 0 : animateProgress(100);
  if (!body) {
    body = await (await res).text();
    _bodyCache.set(res, body);
  }
  history.pushState(null, "", destination);

  (<HTMLElement> document.activeElement)?.blur?.();
  const $destinationDocument = document.implementation.createHTMLDocument();
  $destinationDocument.documentElement.innerHTML = body;
  const $destinationHeader = $destinationDocument.querySelector("header"),
    $destinationMain = $destinationDocument.querySelector("main"),
    $originHeader = document.querySelector("header"),
    $originMain = document.querySelector("main"),
    semanticReplacement = $destinationHeader && $destinationMain &&
      $originHeader && $originMain;
  document.title = $destinationDocument.title;
  if (semanticReplacement) {
    if ($originHeader.innerHTML !== $destinationHeader.innerHTML) {
      $originHeader.replaceWith($destinationHeader);
    }
    if ($originMain.innerHTML !== $destinationMain.innerHTML) {
      $originMain.replaceWith($destinationMain);
    }
  } else document.body.replaceWith($destinationDocument.body);

  requestAnimationFrame(async () => {
    await animation;
    await promisifyAnimation($progressBar, [
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 250, easing: "ease-out" },
    ]);
    $progressBar.remove();
    handlePostRoute();
  });
};

interface MouseRouter {
  selector: string;
  click?: EventListener;
  hover?: EventListener;
}
const mouseRouters: MouseRouter[] = [
  {
    // forms
    selector: 'form [type="submit"]',
    click(event: Event) {
      event.preventDefault();
      const $submit = (<HTMLElement> event.target).closest(this.selector),
        $form = (<HTMLInputElement> $submit).form as HTMLFormElement;
      triggerRouteChange(
        $form.target,
        fetch($form.target, {
          body: new FormData($form),
          method: $form.method,
        }),
      );
    },
  },
  {
    // links
    selector: 'a[href]:not([href^="#"])',
    click(event: Event) {
      if (!event.target) return;
      const $anchor = (<HTMLElement> event.target).closest(this.selector),
        url = new URL((<HTMLAnchorElement> $anchor).href),
        sameOrigin = location.origin === url.origin,
        locationPathname = location.pathname.replace(/\/$/, "") || "/",
        urlPathname = url.pathname.replace(/\/$/, "") || "/",
        samePath = locationPathname === urlPathname,
        sameQuery = location.search === url.search;
      if (sameOrigin) {
        event.preventDefault();
        if (samePath && sameQuery) {
          scrollTo(url.hash.slice(1));
          setTimeout(() => {
            // unfortunately no way in the spec
            // to detect end of scroll yet
            location.hash = url.hash;
          }, 100);
        } else {
          const res = _responseCache.get(urlPathname) ?? fetch(urlPathname);
          triggerRouteChange(url.href, res);
        }
      }
    },
    hover(event: Event) {
      if (!event.target) return;
      const $anchor = (<HTMLElement> event.target).closest(this.selector),
        url = new URL((<HTMLAnchorElement> $anchor).href),
        sameOrigin = location.origin === url.origin,
        locationPathname = location.pathname.replace(/\/$/, "") || "/",
        urlPathname = url.pathname.replace(/\/$/, "") || "/",
        samePath = locationPathname === urlPathname;
      if (sameOrigin && !samePath && !_responseCache.has(urlPathname)) {
        _responseCache.set(urlPathname, fetch(urlPathname));
      }
    },
  },
  {
    // ids
    selector: 'a[href^="#"]',
    click(event: Event) {
      event.preventDefault();
      if (!event.target) return;
      const $anchor = (<HTMLElement> event.target).closest(this.selector),
        hash = (<HTMLElement> $anchor).getAttribute("href")?.slice(1);
      scrollTo(hash as string);
      history.replaceState(null, "", `#${hash}`);
    },
  },
];
for (const router of mouseRouters) {
  if (router.click) router.click = router.click.bind(router);
  if (router.hover) router.hover = router.hover.bind(router);
}

globalThis.addEventListener("popstate", (_event) => {
  if (_currentRoute === location.pathname) {
    scrollTo(location.hash.slice(1) as string);
  } else triggerRouteChange(location.href, fetch(location.href));
});

const documentObserverEvents: MutationRecord[] = [],
  handleDocumentMutations = (queue: MutationRecord[]) => {
    while (queue.length) {
      const mutation = <MutationRecord> queue.shift(),
        $target = mutation.target;
      if ($target instanceof HTMLElement) {
        for (const router of mouseRouters) {
          $target.querySelectorAll(router.selector).forEach(($trigger) => {
            if (router.click) {
              $trigger.removeEventListener("click", router.click);
              $trigger.addEventListener("click", router.click);
            }
            if (router.hover) {
              $trigger.removeEventListener("click", router.hover);
              $trigger.addEventListener("click", router.hover);
            }
          });
        }
      }
    }
  },
  documentObserver = new MutationObserver((list, _observer) => {
    if (!documentObserverEvents.length) {
      requestIdleCallback(() =>
        handleDocumentMutations(documentObserverEvents)
      );
    }
    documentObserverEvents.push(...list);
  });
documentObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
});
