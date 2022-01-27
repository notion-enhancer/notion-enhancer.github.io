/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const _routeListeners: Array<() => void> = [],
  onRouteChange = (handler: () => void) => _routeListeners.push(handler);

const normalisePathname = (pathname: string) =>
    pathname.replace(/\/$/, "") +
    (pathname.split("/").reverse()[0].includes(".") ? "" : "/"),
  normaliseRoute = (url: URL) => normalisePathname(url.pathname) + url.search,
  matchesOrigin = (url: URL) => location.origin === url.origin,
  matchesPathname = (url: URL) =>
    normalisePathname(location.pathname) === normalisePathname(url.pathname),
  matchesQuery = (url: URL) => location.search === url.search,
  isHtmlPage = (url: URL) => {
    const path = normalisePathname(url.pathname);
    return path.endsWith("/") || path.endsWith(".html");
  },
  isSamePage = (url: URL) =>
    matchesOrigin(url) && matchesPathname(url) && matchesQuery(url),
  isRoutablePage = (url: URL) => isHtmlPage(url) && matchesOrigin(url),
  hasCachedRes = (url: URL) =>
    _responseCache.has(normalisePathname(url.pathname)),
  hasCachedBody = (res: Response) => _bodyCache.has(res);

const _responseCache = new Map(),
  _bodyCache = new Map(),
  getRoutableRes = (url: URL) => {
    if (!isRoutablePage(url)) return null;
    const route = normaliseRoute(url);
    if (!hasCachedRes(url)) _responseCache.set(route, fetch(route));
    return _responseCache.get(route);
  },
  getRoutableBody = async (url: URL) => {
    if (!isRoutablePage(url)) return null;
    const res = getRoutableRes(url);
    if (!hasCachedBody(res)) _bodyCache.set(res, await (await res).text());
    return _bodyCache.get(res);
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

const promisifyAnimation = (
    $element: HTMLElement,
    animation: [Keyframe[], KeyframeAnimationOptions],
  ) => {
    return new Promise((res, _rej) => {
      $element.animate(...animation).onfinish = () => res(true);
    });
  },
  animateProgress = (
    start: number,
    end: number,
    duration: number,
  ) => {
    const $progressBar = document.createElement("div");
    $progressBar.style.position = "absolute";
    $progressBar.style.height = "2px";
    $progressBar.style.width = `${start}%`;
    $progressBar.style.top = "0";
    $progressBar.style.left = "0";
    $progressBar.style.background = "rgba(147,197,253)";
    return {
      $progressBar,
      animationFinished: promisifyAnimation($progressBar, [
        [{ width: `${start}%` }, { width: `${end}%` }],
        { duration, easing: "ease-out" },
      ]).then(() => $progressBar.style.width = `${end}%`),
    };
  },
  animateFadeOut = async ($element: HTMLElement, duration: number) => {
    await promisifyAnimation($element, [
      [{ opacity: 1 }, { opacity: 0 }],
      { duration, easing: "ease-out" },
    ]);
    $element.remove();
  };

let _currentRoute = normaliseRoute(new URL(location.href));
const navigateToRoute = async (url: URL) => {
  const { $progressBar, animationFinished } = animateProgress(0, 100, 500);
  document.body.append($progressBar);

  (<HTMLElement> document.activeElement)?.blur?.();
  const $destinationDocument = document.implementation.createHTMLDocument();
  $destinationDocument.documentElement.innerHTML = await getRoutableBody(url);
  document.title = $destinationDocument.title;
  document.body.replaceWith($destinationDocument.body);
  document.body.append($progressBar);

  await animationFinished;
  requestAnimationFrame(() => animateFadeOut($progressBar, 250));

  if (url.hash) scrollTo(url.hash.slice(1));
  _currentRoute = normaliseRoute(url);
  _routeListeners.forEach((handler) => handler());
};

const findAnchor = (event: MouseEvent) => {
    const path = event.composedPath(),
      $a = path.find(($) => $ instanceof Element && $.matches("a[href]"));
    return <HTMLAnchorElement | undefined> $a;
  },
  mousemoveListener = (event: MouseEvent) => {
    // cache potential destinations
    const $a = findAnchor(event);
    if ($a) {
      const url = new URL($a.href);
      getRoutableRes(url);
    }
  },
  clickListener = (event: MouseEvent) => {
    // route internal links
    const $a = findAnchor(event);
    if ($a) {
      const openInNewTab = event.ctrlKey;
      if (openInNewTab) return;
      const url = new URL($a.href);
      if (isRoutablePage(url)) {
        event.preventDefault();
        if (!isSamePage(url)) {
          history.pushState(null, "", url);
          navigateToRoute(url);
        } else if (url.hash) {
          history.replaceState(null, "", url);
          scrollTo(url.hash.slice(1));
        }
      }
    }
  },
  popstateListener = () => {
    if (_currentRoute === location.pathname) {
      scrollTo(location.hash.slice(1));
    } else navigateToRoute(new URL(location.href));
  };

const initRouter = () => {
    _routeListeners.forEach((handler) => handler());
    globalThis.addEventListener("popstate", popstateListener);
    document.addEventListener("mousemove", mousemoveListener);
    document.addEventListener("click", clickListener);
    popstateListener();
  },
  deinitRouter = () => {
    globalThis.removeEventListener("popstate", popstateListener);
    document.removeEventListener("mousemove", mousemoveListener);
    document.removeEventListener("click", clickListener);
  };

export { deinitRouter, initRouter, onRouteChange };
