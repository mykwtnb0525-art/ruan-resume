import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ARCHIVE_SCROLL,
  evaluateArchiveNarrative,
} from "../components/archive/archiveNarrative.js";

gsap.registerPlugin(ScrollTrigger);

const RELOAD_PROGRESS_KEY = "kr-archive-reload-progress";

export function useArchiveProgress({
  sectionRef,
  stageRef,
  progressRef,
  snapshotRef,
  disabled,
  tablet,
  onSnapshotChange,
}) {
  const triggerRef = useRef(null);
  const phaseRef = useRef("KEY_IDLE");
  const archivedCountRef = useRef(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || disabled) return undefined;

    const context = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () =>
          `+=${window.innerHeight * (tablet ? 9.4 : ARCHIVE_SCROLL.totalVh / 100)}`,
        pin: stage,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          section.dataset.archiveStart = String(self.start);
          section.dataset.archiveEnd = String(self.end);
        },
        onUpdate: (self) => {
          const progress = self.progress;
          const snapshot = evaluateArchiveNarrative(progress);
          progressRef.current = progress;
          snapshotRef.current = snapshot;
          section.dataset.progress = progress.toFixed(4);
          section.dataset.chapterProgress =
            snapshot.chapterProgress.toFixed(4);
          section.dataset.archived = String(snapshot.archivedCount);

          section.style.setProperty("--archive-progress", progress.toFixed(4));
          section.style.setProperty(
            "--entry-progress",
            snapshot.entryProgress.toFixed(4),
          );
          section.style.setProperty(
            "--chapter-progress",
            snapshot.chapterProgress.toFixed(4),
          );
          section.style.setProperty(
            "--entrance-progress",
            snapshot.entry.entrance.toFixed(4),
          );
          section.style.setProperty(
            "--collage-progress",
            snapshot.entry.collage.toFixed(4),
          );
          section.style.setProperty(
            "--travel-progress",
            snapshot.entry.travel.toFixed(4),
          );
          section.style.setProperty(
            "--arrival-progress",
            snapshot.entry.arrival.toFixed(4),
          );
          section.style.setProperty(
            "--identify-progress",
            snapshot.chapter.identify.toFixed(4),
          );
          section.style.setProperty(
            "--prime-progress",
            snapshot.chapter.prime.toFixed(4),
          );
          section.style.setProperty(
            "--activate-progress",
            snapshot.chapter.activate.toFixed(4),
          );
          section.style.setProperty(
            "--boot-progress",
            Math.max(
              snapshot.chapter.prime,
              snapshot.chapter.activate,
            ).toFixed(4),
          );
          section.style.setProperty(
            "--dispense-progress",
            snapshot.chapter.dispense.toFixed(4),
          );
          section.style.setProperty(
            "--land-progress",
            snapshot.chapter.land.toFixed(4),
          );
          section.style.setProperty(
            "--open-progress",
            snapshot.chapter.open.toFixed(4),
          );
          section.style.setProperty(
            "--archive-emerge-progress",
            snapshot.chapter.emerge.toFixed(4),
          );
          section.style.setProperty(
            "--archive-read-progress",
            snapshot.chapter.read.toFixed(4),
          );
          section.style.setProperty(
            "--archive-close-progress",
            snapshot.chapter.close.toFixed(4),
          );
          section.style.setProperty(
            "--commit-progress",
            snapshot.chapter.commit.toFixed(4),
          );
          section.style.setProperty(
            "--bridge-progress",
            snapshot.chapter.bridge.toFixed(4),
          );
          section.style.setProperty(
            "--reveal-progress",
            snapshot.chapter.archiveVisibility.toFixed(4),
          );

          const snapshotChanged =
            snapshot.phase !== phaseRef.current ||
            snapshot.archivedCount !== archivedCountRef.current;
          if (snapshotChanged) {
            phaseRef.current = snapshot.phase;
            archivedCountRef.current = snapshot.archivedCount;
            section.dataset.phase = snapshot.phase;
            onSnapshotChange(snapshot);
          }
        },
      });
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    const saveReloadProgress = () => {
      try {
        sessionStorage.setItem(
          RELOAD_PROGRESS_KEY,
          String(progressRef.current),
        );
      } catch {
        // Session storage can be unavailable; native browser restoration remains.
      }
    };
    const restoreReloadProgress = () => {
      const navigation = performance.getEntriesByType?.("navigation")?.[0];
      if (navigation?.type !== "reload") return;

      let savedProgress = Number.NaN;
      try {
        savedProgress = Number(sessionStorage.getItem(RELOAD_PROGRESS_KEY));
        sessionStorage.removeItem(RELOAD_PROGRESS_KEY);
      } catch {
        return;
      }
      if (!Number.isFinite(savedProgress) || savedProgress <= 0) return;

      window.requestAnimationFrame(() => {
        refresh();
        window.requestAnimationFrame(() => {
          const trigger = triggerRef.current;
          if (!trigger) return;
          const previousBehavior =
            document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo({
            top: trigger.start + (trigger.end - trigger.start) * savedProgress,
            behavior: "instant",
          });
          ScrollTrigger.update();
          window.requestAnimationFrame(() => {
            document.documentElement.style.scrollBehavior = previousBehavior;
          });
        });
      });
    };
    window.addEventListener("resize", refresh);
    window.addEventListener("beforeunload", saveReloadProgress);
    document.fonts?.ready
      .then(() => {
        refresh();
        restoreReloadProgress();
      })
      .catch(restoreReloadProgress);

    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("beforeunload", saveReloadProgress);
      triggerRef.current?.kill();
      triggerRef.current = null;
      context.revert();
    };
  }, [
    disabled,
    onSnapshotChange,
    progressRef,
    sectionRef,
    snapshotRef,
    stageRef,
    tablet,
  ]);

  return {
    skip() {
      const trigger = triggerRef.current;
      const top = trigger ? trigger.end + 2 : sectionRef.current?.offsetTop || 0;
      window.scrollTo({ top, behavior: "smooth" });
    },
    advance() {
      window.scrollBy({
        top: window.innerHeight * 0.92,
        behavior: "smooth",
      });
    },
  };
}
