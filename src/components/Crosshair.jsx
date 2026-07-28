import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Crosshair.css";

const lerp = (start, end, amount) => (1 - amount) * start + amount * end;

const getPointerPosition = (event, container) => {
  const bounds = container.getBoundingClientRect();
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
};

export default function Crosshair({
  containerRef,
  color = "#7b3ff2",
  accent = "#d12629",
  cyan = "#00b8c8",
}) {
  const rootRef = useRef(null);
  const horizontalRef = useRef(null);
  const verticalRef = useRef(null);
  const reticleRef = useRef(null);
  const filterXRef = useRef(null);
  const filterYRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    const horizontal = horizontalRef.current;
    const vertical = verticalRef.current;
    const reticle = reticleRef.current;
    if (!container || !horizontal || !vertical || !reticle) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2,
      renderedX: container.clientWidth / 2,
      renderedY: container.clientHeight / 2,
    };
    let frame = 0;

    const setHorizontalY = gsap.quickSetter(horizontal, "y", "px");
    const setVerticalX = gsap.quickSetter(vertical, "x", "px");
    const setReticleX = gsap.quickSetter(reticle, "x", "px");
    const setReticleY = gsap.quickSetter(reticle, "y", "px");

    const render = () => {
      const amount = reducedMotion ? 1 : 0.16;
      pointer.renderedX = lerp(pointer.renderedX, pointer.x, amount);
      pointer.renderedY = lerp(pointer.renderedY, pointer.y, amount);
      setHorizontalY(pointer.renderedY);
      setVerticalX(pointer.renderedX);
      setReticleX(pointer.renderedX);
      setReticleY(pointer.renderedY);
      frame = window.requestAnimationFrame(render);
    };

    const show = () => {
      document.body.classList.add("crosshair-active");
      rootRef.current?.classList.add("is-visible");
    };

    const hide = () => {
      document.body.classList.remove("crosshair-active");
      rootRef.current?.classList.remove("is-visible", "is-locked");
    };

    const move = (event) => {
      const next = getPointerPosition(event, container);
      pointer.x = next.x;
      pointer.y = next.y;
      show();
    };

    const resize = () => {
      if (!rootRef.current?.classList.contains("is-visible")) {
        pointer.x = container.clientWidth / 2;
        pointer.y = container.clientHeight / 2;
      }
    };

    const noise = { turbulence: 0 };
    const glitch = gsap
      .timeline({
        paused: true,
        onStart: () => {
          horizontal.style.filter = "url(#acid-crosshair-noise-x)";
          vertical.style.filter = "url(#acid-crosshair-noise-y)";
          rootRef.current?.classList.add("is-locked");
        },
        onUpdate: () => {
          filterXRef.current?.setAttribute("baseFrequency", noise.turbulence);
          filterYRef.current?.setAttribute("baseFrequency", noise.turbulence);
        },
        onComplete: () => {
          horizontal.style.filter = "none";
          vertical.style.filter = "none";
        },
      })
      .to(noise, {
        duration: 0.46,
        ease: "power2.out",
        startAt: { turbulence: 0.9 },
        turbulence: 0,
      });

    const lock = () => glitch.restart();
    const unlock = () => {
      glitch.progress(1).pause();
      rootRef.current?.classList.remove("is-locked");
    };
    const targets = container.querySelectorAll(
      "a, button, [data-crosshair-lock]",
    );

    container.addEventListener("mouseenter", show);
    container.addEventListener("mouseleave", hide);
    container.addEventListener("mousemove", move);
    window.addEventListener("resize", resize);
    targets.forEach((target) => {
      target.addEventListener("mouseenter", lock);
      target.addEventListener("mouseleave", unlock);
    });

    gsap.set(rootRef.current, { opacity: 0.78 });
    frame = window.requestAnimationFrame(render);

    return () => {
      document.body.classList.remove("crosshair-active");
      container.removeEventListener("mouseenter", show);
      container.removeEventListener("mouseleave", hide);
      container.removeEventListener("mousemove", move);
      window.removeEventListener("resize", resize);
      targets.forEach((target) => {
        target.removeEventListener("mouseenter", lock);
        target.removeEventListener("mouseleave", unlock);
      });
      glitch.kill();
      window.cancelAnimationFrame(frame);
    };
  }, [containerRef]);

  return (
    <div
      ref={rootRef}
      className="acid-crosshair"
      style={{
        "--crosshair-color": color,
        "--crosshair-accent": accent,
        "--crosshair-cyan": cyan,
      }}
      aria-hidden="true"
    >
      <svg className="acid-crosshair__filters" focusable="false">
        <defs>
          <filter id="acid-crosshair-noise-x">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
              ref={filterXRef}
            />
            <feDisplacementMap in="SourceGraphic" scale="32" />
          </filter>
          <filter id="acid-crosshair-noise-y">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
              ref={filterYRef}
            />
            <feDisplacementMap in="SourceGraphic" scale="32" />
          </filter>
        </defs>
      </svg>

      <span
        ref={horizontalRef}
        className="acid-crosshair__line acid-crosshair__line--horizontal"
      />
      <span
        ref={verticalRef}
        className="acid-crosshair__line acid-crosshair__line--vertical"
      />

      <span ref={reticleRef} className="acid-crosshair__reticle">
        <span className="acid-crosshair__orbit acid-crosshair__orbit--outer" />
        <span className="acid-crosshair__orbit acid-crosshair__orbit--inner" />
        <span className="acid-crosshair__bracket acid-crosshair__bracket--tl" />
        <span className="acid-crosshair__bracket acid-crosshair__bracket--tr" />
        <span className="acid-crosshair__bracket acid-crosshair__bracket--bl" />
        <span className="acid-crosshair__bracket acid-crosshair__bracket--br" />
        <span className="acid-crosshair__dot" />
        <span className="acid-crosshair__satellite acid-crosshair__satellite--one" />
        <span className="acid-crosshair__satellite acid-crosshair__satellite--two" />
        <span className="acid-crosshair__label">MEMORY / LOCK</span>
      </span>
    </div>
  );
}
