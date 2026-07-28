import { useEffect, useState } from "react";

function readMedia(query) {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

export function useReducedMotion() {
  const [preferences, setPreferences] = useState(() => ({
    reducedMotion: readMedia("(prefers-reduced-motion: reduce)"),
    compact: readMedia("(max-width: 767px)"),
    tablet: readMedia("(max-width: 1023px)"),
  }));

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 767px)");
    const tablet = window.matchMedia("(max-width: 1023px)");
    const update = () =>
      setPreferences({
        reducedMotion: reduced.matches,
        compact: compact.matches,
        tablet: tablet.matches,
      });

    [reduced, compact, tablet].forEach((media) =>
      media.addEventListener("change", update),
    );
    return () => {
      [reduced, compact, tablet].forEach((media) =>
        media.removeEventListener("change", update),
      );
    };
  }, []);

  return preferences;
}
