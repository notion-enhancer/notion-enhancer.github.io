/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/// <reference lib="dom" />
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
if (mouseGlow.enabled) document.body.append($glow);

const offsetTop = ($target: Element | null, offset = 0): number => {
    if (!($target instanceof HTMLElement)) return offset;
    return offsetTop($target.offsetParent, offset + $target.offsetTop);
  },
  offsetLeft = ($target: Element | null, offset = 0): number => {
    if (!($target instanceof HTMLElement)) return offset;
    return offsetLeft($target.offsetParent, offset + $target.offsetLeft);
  };

for (const $tilt of document.querySelectorAll<HTMLElement>("[data-tilt]")) {
  $tilt.addEventListener("mousemove", (ev) => {
    $tilt.style.transitionDuration = "";
    const { width, height } = $tilt.getBoundingClientRect(),
      offsetY = Math.abs(ev.clientY - offsetTop($tilt)),
      offsetX = Math.abs(ev.clientX - offsetLeft($tilt)),
      rotateX = (height / 2 - offsetY) * tiltMultiplier,
      rotateY = (width / 2 - offsetX) * -tiltMultiplier,
      transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    $tilt.style.transform = transform;
  });
  $tilt.addEventListener("mouseleave", (ev) => {
    $tilt.style.transitionDuration = `${returnDuration}ms`;
    $tilt.style.transform = "";
  });

  if (mouseGlow.enabled) {
    $tilt.addEventListener("mousemove", (ev) => {
      $glow.style.transitionDuration = "";
      $glow.style.opacity = "0.1";
      $glow.style.top = `${ev.clientY - mouseGlow.height / 2}px`;
      $glow.style.left = `${ev.clientX - mouseGlow.width / 2}px`;
    });
    $tilt.addEventListener("mouseleave", (ev) => {
      $glow.style.transitionDuration = `${returnDuration}ms`;
      $glow.style.opacity = "0";
    });
  }
}
