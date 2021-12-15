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
const postRouteCleanup = () => {
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
    const animateProgress = async (percentage: number) => {
      await promisifyAnimation($progressBar, [
        [{ width: $progressBar.style.width }, { width: `${percentage}%` }],
        { duration: 500, easing: "ease-out" },
      ]);
      $progressBar.style.width = `${percentage}%`;
    };
    await animateProgress(10);

    (<HTMLElement> document.activeElement)?.blur?.();
    const res = (await destination);
    history.pushState(null, "", res.url);

    const reader = (res.body as ReadableStream<Uint8Array>).getReader(),
      contentLength = +(res.headers.get("Content-Length") || 0),
      receivedChunks = new Uint8Array(contentLength);
    let position = 0;
    while (contentLength) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedChunks.set(value, position);
        position += value.length;
      }
      await animateProgress((position / contentLength) * 100);
    }

    const $destinationDocument = document.implementation.createHTMLDocument();
    $destinationDocument.documentElement.innerHTML = new TextDecoder("utf-8")
      .decode(receivedChunks);
    document.title = $destinationDocument.title;
    await promisifyAnimation($progressBar, [
      [{ opacity: 1 }, { opacity: 0.5 }],
      { duration: 250, easing: "ease-out" },
    ]);
    $progressBar.style.opacity = "0.5";
    (document.querySelector("#root") || document.body).replaceWith(
      $destinationDocument.querySelector("#root") || $destinationDocument.body,
    );

    requestAnimationFrame(async () => {
      await promisifyAnimation($progressBar, [
        [{ opacity: 0.5 }, { opacity: 0 }],
        { duration: 250, easing: "ease-out" },
      ]);
      $progressBar.remove();
      postRouteCleanup();
    });
  };

const routers = [
  {
    // forms
    selector: 'form [type="submit"]',
    handler: (event: Event) => {
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
    handler: (event: Event) => {
      event.preventDefault();
      if (!event.target) return;
      const selector = 'a[href]:not([href^="#"]):not([href*=":"])',
        $anchor = (<HTMLElement> event.target).closest(selector),
        href = (<HTMLElement> $anchor).getAttribute("href") as string;
      if (location.pathname !== href) triggerRouteChange(fetch(href));
    },
  },
  {
    // ids
    selector: 'a[href^="#"]',
    handler: (event: Event) => {
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
            $trigger.removeEventListener("click", router.handler);
            $trigger.addEventListener("click", router.handler);
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

postRouteCleanup();
