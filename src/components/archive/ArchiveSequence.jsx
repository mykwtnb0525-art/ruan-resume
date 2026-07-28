import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowDown } from "@phosphor-icons/react";
import Crosshair from "../Crosshair.jsx";
import { useArchiveProgress } from "../../hooks/useArchiveProgress.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { phaseFromProgress } from "./archiveConfig.js";
import { ArchiveCanvas } from "./ArchiveCanvas.jsx";
import { ArchiveHud } from "./ArchiveHud.jsx";
import { InternshipReveal } from "./InternshipReveal.jsx";
import { ReducedMotionArchive } from "./ReducedMotionArchive.jsx";
import "./archive-sequence.css";

export function ArchiveSequence() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const progressRef = useRef(0);
  const { reducedMotion, compact, tablet } = useReducedMotion();
  const staticMode = reducedMotion || compact;
  const [phase, setPhase] = useState(staticMode ? "TARGET_LOCK" : "IDLE");
  const [displayProgress, setDisplayProgress] = useState(staticMode ? 0.56 : 0);
  const [opened, setOpened] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("kr-archive-muted") !== "false";
    } catch {
      return true;
    }
  });

  const handlePhaseChange = useCallback((nextPhase) => {
    setPhase(nextPhase);
    setDismissed(false);
  }, []);

  const controls = useArchiveProgress({
    sectionRef,
    stageRef,
    progressRef,
    disabled: staticMode,
    tablet,
    onPhaseChange: handlePhaseChange,
  });

  useEffect(() => {
    if (!staticMode) return undefined;
    progressRef.current = opened ? 1 : 0.56;
    const nextPhase = opened ? "UNSEALED" : "TARGET_LOCK";
    setPhase(nextPhase);
    setDisplayProgress(progressRef.current);
    sectionRef.current?.style.setProperty(
      "--reveal-progress",
      opened ? "1" : "0",
    );
    return undefined;
  }, [opened, staticMode]);

  useEffect(() => {
    if (!compact || reducedMotion) return undefined;
    let frame = 0;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const local = Math.min(1, Math.max(0, -rect.top / distance));
      const progress = 0.56 + local * 0.44;
      progressRef.current = progress;
      section.dataset.progress = progress.toFixed(4);
      setDisplayProgress(progress);
      const nextPhase = phaseFromProgress(progress);
      setPhase((current) => (current === nextPhase ? current : nextPhase));
      section.style.setProperty(
        "--reveal-progress",
        progress >= 0.9 ? String((progress - 0.9) / 0.1) : "0",
      );
      if (progress >= 0.985) setOpened(true);
      frame = 0;
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [compact, reducedMotion]);

  useEffect(() => {
    if (staticMode) return undefined;
    let frame = 0;
    const update = () => {
      setDisplayProgress(progressRef.current);
      frame = window.setTimeout(update, 120);
    };
    update();
    return () => window.clearTimeout(frame);
  }, [staticMode]);

  useEffect(() => {
    try {
      localStorage.setItem("kr-archive-muted", String(muted));
    } catch {
      // Storage can be unavailable in private browsing; silence is the fallback.
    }
  }, [muted]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDismissed(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const revealed = opened || phase === "UNSEALED";

  return (
    <section
      ref={sectionRef}
      className={`archive-sequence ${staticMode ? "is-static" : ""}`}
      id="chapter"
      data-phase={phase}
      aria-labelledby="archive-sequence-title"
    >
      <div ref={stageRef} className="archive-sequence__stage">
        <ArchiveCanvas
          progressRef={progressRef}
          staticMode={staticMode}
          compact={compact}
        />
        <div
          className="archive-sequence__atmosphere"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(8,9,11,.78) 0%, rgba(8,9,11,.14) 44%, rgba(8,9,11,.34) 100%), url("${import.meta.env.BASE_URL}assets/archive-dream-corridor.png")`,
          }}
        />

        {!compact && !reducedMotion ? (
          <Crosshair
            containerRef={stageRef}
            color="#ba72ff"
            accent="#9f1e2d"
            cyan="#00d7e8"
          />
        ) : null}

        <div className="archive-sequence__paper" aria-hidden="true" />
        <div className="archive-sequence__grain" aria-hidden="true" />
        <div className="archive-sequence__scanlines" aria-hidden="true" />

        <ArchiveHud
          phase={phase}
          progress={displayProgress}
          muted={muted}
          onToggleMuted={() => setMuted((value) => !value)}
        />

        <div className="archive-sequence__entrance section-shell">
          <div className="archive-sequence__copy">
            <p className="archive-sequence__code">
              &gt; MOUNT /VISUAL_ARCHIVE
              <br />
              &gt; LOAD MEMORY_FRAGMENTS... 100%
              <br />
              &gt; DIRECTOR_MODE: ACTIVE
            </p>
            <p className="eyebrow">CHAPTER 01 / INSERT COIN</p>
            <h2 id="archive-sequence-title" data-crosshair-lock>
              <span>ENTER</span>
              <span>THE ARCHIVE</span>
            </h2>
            <p className="archive-sequence__lead">
              从这里开始，进入镜头、记忆与生成式影像
              <br />
              共同构成的视觉档案。
            </p>
            <button
              className="archive-sequence__continue"
              type="button"
              onClick={staticMode ? () => setOpened(true) : controls.advance}
              data-cursor="ENTER"
            >
              CONTINUE <ArrowDown weight="light" />
            </button>
          </div>

          <figure className="archive-sequence__object">
            <img
              src="/ruan-resume/assets/retro-car.png"
              alt="红色丝绒上的复古绿色玩具汽车"
            />
            <figcaption>
              PLAYER 01
              <span>KAICHENG RUAN</span>
            </figcaption>
          </figure>
        </div>

        <p className="archive-sequence__arrival-copy">
          经历不是陈列，
          <br />
          而是被重新唤醒。
          <span>EXPERIENCE IS NOT STORED. IT IS DISPENSED.</span>
        </p>

        <div
          className="archive-sequence__machine-hotspot"
          data-cursor={phase === "DISPENSING" ? "OPEN" : "TURN"}
          aria-hidden="true"
        />

        <InternshipReveal
          revealed={revealed}
          dismissed={dismissed}
          onDismiss={() => setDismissed(true)}
        />

        {revealed && dismissed ? (
          <button
            className="archive-sequence__reopen"
            type="button"
            onClick={() => setDismissed(false)}
            data-cursor="OPEN"
          >
            REOPEN ARCHIVE
          </button>
        ) : null}

        {staticMode ? (
          <ReducedMotionArchive
            opened={opened}
            onOpen={() => {
              setDismissed(false);
              setOpened(true);
            }}
            reducedMotion={reducedMotion}
          />
        ) : null}

        <button
          className="archive-sequence__skip"
          type="button"
          onClick={staticMode ? () => document.querySelector("#profile")?.scrollIntoView() : controls.skip}
        >
          跳过序章 / SKIP
        </button>

        <div className="archive-sequence__progress" aria-hidden="true">
          <span />
          <b>PRESS / SCROLL TO CONTINUE</b>
        </div>
      </div>
    </section>
  );
}
