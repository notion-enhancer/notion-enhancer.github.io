/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

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

let _currentRoute = location.pathname;
const _requestCache = new Map(),
  _responseCache = new Map(),
  postRouteCleanup = () => {
    _currentRoute = location.pathname;
    _routeListeners.forEach((handler) => handler());
    // remove e.g. success messages from url
    history.replaceState(null, "", location.pathname);
  },
  triggerRouteChange = async (destination: Promise<Response>) => {
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

    let body = _responseCache.get(destination);
    const animation = body ? 1 : animateProgress(100),
      res = (await destination);
    if (!body) {
      body = await res.text();
      _responseCache.set(destination, body);
    }
    history.pushState(null, "", res.url);

    (<HTMLElement> document.activeElement)?.blur?.();
    const $destinationDocument = document.implementation.createHTMLDocument(),
      $destinationHeader = $destinationDocument.querySelector("header"),
      $destinationMain = $destinationDocument.querySelector("main"),
      $originHeader = document.querySelector("header"),
      $originMain = document.querySelector("main"),
      semanticReplacement = $destinationHeader && $destinationMain &&
        $originHeader && $originMain;
    $destinationDocument.documentElement.innerHTML = body;
    document.title = $destinationDocument.title;
    if (semanticReplacement) {
      $originHeader.replaceWith($destinationHeader);
      $originMain.replaceWith($destinationMain);
    } else document.body.replaceWith($destinationDocument.body);

    requestAnimationFrame(async () => {
      await animation;
      await promisifyAnimation($progressBar, [
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 250, easing: "ease-out" },
      ]);
      $progressBar.remove();
      postRouteCleanup();
    });
  };

interface Router {
  selector: string;
  click?: EventListenerOrEventListenerObject;
  hover?: EventListenerOrEventListenerObject;
}
const routers: Router[] = [
  {
    // forms
    selector: 'form [type="submit"]',
    click: (event: Event) => {
      event.preventDefault();
      const selector = 'form [type="submit"]',
        $submit = (<HTMLElement> event.target).closest(selector),
        $form = (<HTMLInputElement> $submit).form as HTMLFormElement;
      triggerRouteChange(
        fetch($form.target, {
          body: new FormData($form),
          method: $form.method,
        }),
      );
    },
  },
  {
    // links
    selector: 'a[href]:not([href^="#"]):not([href*=":"])',
    click: (event: Event) => {
      event.preventDefault();
      if (!event.target) return;
      const selector = 'a[href]:not([href^="#"]):not([href*=":"])',
        $anchor = (<HTMLElement> event.target).closest(selector),
        href = (<HTMLElement> $anchor).getAttribute("href") as string;
      if (location.pathname !== href) {
        triggerRouteChange(_requestCache.get(href) ?? fetch(href));
      }
    },
    hover: (event: Event) => {
      if (!event.target) return;
      const selector = 'a[href]:not([href^="#"]):not([href*=":"])',
        $anchor = (<HTMLElement> event.target).closest(selector),
        href = (<HTMLElement> $anchor).getAttribute("href") as string;
      if (location.pathname !== href && !_requestCache.has(href)) {
        _requestCache.set(href, fetch(href));
      }
    },
  },
  {
    // ids
    selector: 'a[href^="#"]',
    click: (event: Event) => {
      event.preventDefault();
      if (!event.target) return;
      const selector = 'a[href^="#"]',
        $anchor = (<HTMLElement> event.target).closest(selector),
        hash = (<HTMLElement> $anchor).getAttribute("href")?.slice(1);
      document.getElementById(hash as string)?.scrollIntoView(true);
      history.replaceState(null, "", `#${hash}`);
    },
  },
];

globalThis.addEventListener("popstate", (_event) => {
  if (_currentRoute === location.pathname) {
    if (location.href) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView(true);
    }
    document.documentElement.scrollTop = 0;
  } else triggerRouteChange(fetch(location.href));
});

const documentObserverEvents: MutationRecord[] = [],
  handleDocumentMutations = (queue: MutationRecord[]) => {
    while (queue.length) {
      const mutation = queue.shift() as MutationRecord,
        $target = mutation.target;
      if ($target instanceof HTMLElement) {
        for (const router of routers) {
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

let _readyStateCalled = false;
document.addEventListener("readystatechange", (_ev) => {
  if (document.readyState === "complete" && !_readyStateCalled) {
    requestIdleCallback(postRouteCleanup);
    _readyStateCalled = true;
  }
});
