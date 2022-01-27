/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom.iterable" />

const scale = 1.01,
  tiltMultiplier = 0.008,
  returnDuration = 300,
  mouseGlow = {
    enabled: true,
    width: 64,
    height: 64,
  };

const $glow = document.createElement("div");
$glow.style.width = `${mouseGlow.width}px`;
$glow.style.height = `${mouseGlow.height}px`;
$glow.style.position = "absolute";
$glow.style.borderRadius = "100%";
$glow.style.filter = "blur(5rem)";
$glow.style.backgroundColor = "white";
$glow.style.pointerEvents = "none";
$glow.style.opacity = "0";

const offsetTop = ($target: Element | null, offset = 0): number => {
    if (!($target instanceof HTMLElement)) return offset;
    return offsetTop($target.offsetParent, offset + $target.offsetTop);
  },
  offsetLeft = ($target: Element | null, offset = 0): number => {
    if (!($target instanceof HTMLElement)) return offset;
    return offsetLeft($target.offsetParent, offset + $target.offsetLeft);
  };

const getTilt = (event: MouseEvent) => {
    return (<HTMLElement> event.target).closest("[data-tilt]") as HTMLElement;
  },
  mousemoveTilt = (event: MouseEvent) => {
    const $tilt = getTilt(event);
    $tilt.style.transitionDuration = "";
    const { width, height } = $tilt.getBoundingClientRect(),
      offsetY = Math.abs(event.clientY - offsetTop($tilt)),
      offsetX = Math.abs(event.clientX - offsetLeft($tilt)),
      rotateX = (height / 2 - offsetY) * tiltMultiplier,
      rotateY = (width / 2 - offsetX) * -tiltMultiplier,
      transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    $tilt.style.transform = transform;
  },
  mouseleaveTilt = (event: MouseEvent) => {
    const $tilt = getTilt(event);
    $tilt.style.transitionDuration = `${returnDuration}ms`;
    $tilt.style.transform = "";
  },
  mousemoveGlow = (event: MouseEvent) => {
    $glow.style.transitionDuration = "";
    $glow.style.opacity = "0.1";
    $glow.style.top = `${event.clientY - mouseGlow.height / 2}px`;
    $glow.style.left = `${event.clientX - mouseGlow.width / 2}px`;
  },
  mouseleaveGlow = (_event: MouseEvent) => {
    $glow.style.transitionDuration = `${returnDuration}ms`;
    $glow.style.opacity = "0";
  };

const tiltElements = () => {
  for (const $tilt of document.querySelectorAll<HTMLElement>("[data-tilt]")) {
    $tilt.removeEventListener("mousemove", mousemoveTilt);
    $tilt.removeEventListener("mouseleave", mouseleaveTilt);
    $tilt.addEventListener("mousemove", mousemoveTilt);
    $tilt.addEventListener("mouseleave", mouseleaveTilt);

    if (mouseGlow.enabled) {
      $tilt.removeEventListener("mousemove", mousemoveGlow);
      $tilt.removeEventListener("mouseleave", mouseleaveGlow);
      $tilt.addEventListener("mousemove", mousemoveGlow);
      $tilt.addEventListener("mouseleave", mouseleaveGlow);
      document.body.append($glow);
    }
  }
};

export { tiltElements };
