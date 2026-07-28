import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ARCHIVE_CONFIG,
  phaseFromProgress,
  rangeProgress,
} from "../components/archive/archiveConfig.js";

gsap.registerPlugin(ScrollTrigger);

export function useArchiveProgress({
  sectionRef,
  stageRef,
  progressRef,
  disabled,
  tablet,
  onPhaseChange,
}) {
  const triggerRef = useRef(null);
  const phaseRef = useRef("IDLE");

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || disabled) return undefined;

    const context = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * (tablet ? 4.8 : 6.8)}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          section.dataset.archiveStart = String(self.start);
          section.dataset.archiveEnd = String(self.end);
        },
        onUpdate: (self) => {
          const progress = self.progress;
          progressRef.current = progress;
          section.dataset.progress = progress.toFixed(4);

          const entrance = rangeProgress(
            progress,
            ...ARCHIVE_CONFIG.ranges.collage,
          );
          const collage = rangeProgress(
            progress,
            ...ARCHIVE_CONFIG.ranges.collage,
          );
          const travel = rangeProgress(
            progress,
            ...ARCHIVE_CONFIG.ranges.travel,
          );
          const arrival = rangeProgress(
            progress,
            ...ARCHIVE_CONFIG.ranges.arrival,
          );
          const boot = rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.boot);
          const dispense = rangeProgress(
            progress,
            ...ARCHIVE_CONFIG.ranges.dispense,
          );
          const reveal = rangeProgress(
            progress,
            ...ARCHIVE_CONFIG.ranges.reveal,
          );

          section.style.setProperty("--archive-progress", progress.toFixed(4));
          section.style.setProperty(
            "--entrance-progress",
            entrance.toFixed(4),
          );
          section.style.setProperty(
            "--collage-progress",
            collage.toFixed(4),
          );
          section.style.setProperty("--travel-progress", travel.toFixed(4));
          section.style.setProperty("--arrival-progress", arrival.toFixed(4));
          section.style.setProperty("--boot-progress", boot.toFixed(4));
          section.style.setProperty(
            "--dispense-progress",
            dispense.toFixed(4),
          );
          section.style.setProperty("--reveal-progress", reveal.toFixed(4));

          const nextPhase = phaseFromProgress(progress);
          if (nextPhase !== phaseRef.current) {
            phaseRef.current = nextPhase;
            section.dataset.phase = nextPhase;
            onPhaseChange(nextPhase);
          }
        },
      });
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener("resize", refresh);
      triggerRef.current?.kill();
      triggerRef.current = null;
      context.revert();
    };
  }, [
    disabled,
    onPhaseChange,
    progressRef,
    sectionRef,
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
