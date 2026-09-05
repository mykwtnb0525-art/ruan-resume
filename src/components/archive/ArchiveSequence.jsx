import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { useArchiveProgress } from "../../hooks/useArchiveProgress.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { assetUrl } from "../../utils/assetUrl.js";
import {
  ARCHIVE_SCROLL,
  evaluateArchiveNarrative,
  INITIAL_ARCHIVE_SNAPSHOT,
} from "./archiveNarrative.js";
import { ArchiveCanvas } from "./ArchiveCanvas.jsx";
import { ArchiveRenderer } from "./ArchiveRenderer.jsx";
import { ArchiveHud } from "./ArchiveHud.jsx";
import { chapter01 } from "./config/chapter01.ts";
import { getEnvironmentRenderConfig } from "./rigs/EnvironmentRig.js";
import { ReducedMotionArchive } from "./ReducedMotionArchive.jsx";
import { SceneEffects } from "./SceneEffects.jsx";
import { TransitionResidue } from "./TransitionResidue.jsx";
import { resolveVisualDebugMode } from "./visual/visualDebugMode.js";
import "./archive-sequence.css";

const LazyArchiveDebugPanel = import.meta.env.DEV
  ? lazy(() => import("./ArchiveDebugPanel.jsx").then((module) => ({
      default: module.ArchiveDebugPanel,
    })))
  : null;

const loadDebugChapterConfig = import.meta.env.DEV
  ? () =>
      Promise.all([
        import("./config/chapter02.debug.ts"),
        import("./config/validateChapterConfig.ts"),
      ])
  : null;

export function ArchiveSequence({ embedded = false }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const progressRef = useRef(0);
  const snapshotRef = useRef(INITIAL_ARCHIVE_SNAPSHOT);
  const { reducedMotion, compact, tablet } = useReducedMotion();
  const staticMode = reducedMotion;
  const [phase, setPhase] = useState(
    staticMode ? "MACHINE_AWAKE" : "KEY_IDLE",
  );
  const [archivedCount, setArchivedCount] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(staticMode ? 0.51 : 0);
  const [opened, setOpened] = useState(false);
  const [debugTestConfig, setDebugTestConfig] = useState(null);
  const chapterConfig = chapter01;
  const environmentConfig = getEnvironmentRenderConfig(
    chapterConfig,
    compact,
  );
  const requestedLightingPass =
    !import.meta.env.DEV || typeof window === "undefined"
      ? "final"
      : new URLSearchParams(window.location.search).get("lightingPass");
  const lightingPass = [
    "base",
    "environment",
    "ground",
    "atmosphere",
    "final",
  ].includes(requestedLightingPass)
    ? requestedLightingPass
    : "final";
  const visualDebugMode = resolveVisualDebugMode();
  const showNarrativeDebug =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugNarrative");
  const showDebugChapter =
    showNarrativeDebug &&
    new URLSearchParams(window.location.search).get("debugChapter") === "2";
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("kr-archive-muted") !== "false";
    } catch {
      return true;
    }
  });

  const handleSnapshotChange = useCallback((snapshot) => {
    setPhase(snapshot.phase);
    setArchivedCount(snapshot.archivedCount);
  }, []);

  const controls = useArchiveProgress({
    sectionRef,
    stageRef,
    progressRef,
    snapshotRef,
    disabled: staticMode,
    tablet,
    onSnapshotChange: handleSnapshotChange,
  });

  useEffect(() => {
    if (!showDebugChapter || !loadDebugChapterConfig) return undefined;
    let cancelled = false;
    loadDebugChapterConfig().then(
      ([debugModule, validatorModule]) => {
        validatorModule.validateChapterRegistry([
          chapterConfig,
          debugModule.chapter02Debug,
        ]);
        if (!cancelled) setDebugTestConfig(debugModule.chapter02Debug);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [chapterConfig, showDebugChapter]);

  useEffect(() => {
    if (!staticMode) return undefined;
    const entryWeight = ARCHIVE_SCROLL.entryVh / ARCHIVE_SCROLL.totalVh;
    const progress = opened
      ? entryWeight + (1 - entryWeight) * 0.82
      : entryWeight;
    const snapshot = evaluateArchiveNarrative(progress);
    progressRef.current = progress;
    snapshotRef.current = snapshot;
    setPhase(snapshot.phase);
    setArchivedCount(snapshot.archivedCount);
    setDisplayProgress(progress);
    const section = sectionRef.current;
    section?.style.setProperty("--entrance-progress", "1");
    section?.style.setProperty("--collage-progress", "1");
    section?.style.setProperty("--travel-progress", "1");
    section?.style.setProperty("--arrival-progress", "1");
    section?.style.setProperty("--prime-progress", opened ? "1" : "0");
    section?.style.setProperty("--activate-progress", opened ? "1" : "0");
    section?.style.setProperty("--boot-progress", opened ? "1" : "0");
    section?.style.setProperty("--dispense-progress", opened ? "1" : "0");
    section?.style.setProperty("--land-progress", opened ? "1" : "0");
    section?.style.setProperty("--open-progress", opened ? "1" : "0");
    section?.style.setProperty("--reveal-progress", opened ? "1" : "0");
    section?.style.setProperty(
      "--archive-emerge-progress",
      opened ? "1" : "0",
    );
    section?.style.setProperty("--archive-read-progress", opened ? "0.5" : "0");
    return undefined;
  }, [opened, staticMode]);

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

  const archiveActive =
    opened ||
    [
      "ARCHIVE_EMERGE",
      "ARCHIVE_READ",
      "ARCHIVE_CLOSE",
      "MEMORY_COMMIT",
      "NEXT_CHAPTER_BRIDGE",
    ].includes(phase);
  const debugSnapshot = showNarrativeDebug
    ? evaluateArchiveNarrative(displayProgress)
    : null;
  const Root = embedded ? "div" : "section";

  return (
    <Root
      ref={sectionRef}
      className={`archive-sequence ${staticMode ? "is-static" : ""}`}
      id={embedded ? undefined : "chapter"}
      data-phase={phase}
      data-chapter={chapterConfig.id}
      data-lighting-pass={lightingPass}
      data-visual-debug-mode={visualDebugMode}
      aria-labelledby="archive-sequence-title"
      style={environmentConfig.cssVariables}
    >
      <div ref={stageRef} className="archive-sequence__stage">
        <ArchiveCanvas
          snapshotRef={snapshotRef}
          staticMode={staticMode}
          compact={compact}
          lightingPass={lightingPass}
          visualDebugMode={visualDebugMode}
          chapterConfig={chapterConfig}
        />
        <div
          className="archive-sequence__atmosphere"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${assetUrl(
              "assets/archive-dream-corridor.png",
            )}")`,
          }}
        />
        <div className="archive-sequence__portal-depth" aria-hidden="true" />
        <div
          className="archive-sequence__collage-field"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${assetUrl(
              "assets/archive-dream-corridor.png",
            )}")`,
          }}
        />
        <div className="archive-sequence__memory-fragments" aria-hidden="true">
          <figure className="archive-memory archive-memory--portrait">
            <img
              src={assetUrl("assets/kaicheng-portrait.png")}
              alt=""
            />
            <figcaption>MEMORY / 01</figcaption>
          </figure>
          <figure className="archive-memory archive-memory--mist">
            <img
              src={assetUrl("assets/project-mist.png")}
              alt=""
            />
            <figcaption>FRAME / LOST</figcaption>
          </figure>
          <figure className="archive-memory archive-memory--time">
            <img
              src={assetUrl("assets/project-time.png")}
              alt=""
            />
            <figcaption>TIME / REMAINS</figcaption>
          </figure>
          <figure className="archive-memory archive-memory--dayu">
            <img
              src={assetUrl("assets/project-dayu.png")}
              alt=""
            />
            <figcaption>ARCHIVE / FILM</figcaption>
          </figure>
          <span className="archive-memory archive-memory--stamp">
            KR / MEMORY UNIT
            <b>2024—2028</b>
          </span>
        </div>

        <SceneEffects />

        <ArchiveHud
          phase={phase}
          progress={displayProgress}
          archivedCount={archivedCount}
          muted={muted}
          onToggleMuted={() => setMuted((value) => !value)}
          chapterConfig={chapterConfig}
        />

        <div className="archive-sequence__entrance section-shell">
          <div className="archive-sequence__copy">
            <p className="archive-sequence__code">
              &gt; IDENTITY / KAICHENG RUAN
              <br />
              &gt; ACCESS KEY... VERIFIED
              <br />
              &gt; SIX PROJECT ARCHIVES DETECTED
            </p>
            <p className="eyebrow">ACCESS SEQUENCE / MEMORY UNIT 01</p>
            <h2 id="archive-sequence-title" data-crosshair-lock>
              <span>ENTER</span>
              <span>THE ARCHIVE</span>
            </h2>
            <p className="archive-sequence__lead">
              身份确认完成。继续向内，唤醒被封存在镜头里的项目记忆。
              <br />
              第一枚胶囊：艺人合作 AIGC MV。
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
              src={assetUrl("assets/retro-car.png")}
              alt="红色丝绒上的复古绿色玩具汽车"
            />
            <figcaption>
              PLAYER 01
              <span>KAICHENG RUAN</span>
            </figcaption>
          </figure>
        </div>

        <p className="archive-sequence__arrival-copy">
          项目不是陈列，
          <br />
          而是被重新唤醒。
          <span>THE PROJECT IS NOT STORED. IT IS DISPENSED.</span>
        </p>

        <div
          className="archive-sequence__machine-hotspot"
          data-cursor={
            ["CAPSULE_LAND", "CAPSULE_OPEN"].includes(phase)
              ? "OPEN"
              : "TURN"
          }
          aria-hidden="true"
        />

        <ArchiveRenderer active={archiveActive} config={chapterConfig} />
        <TransitionResidue
          config={chapterConfig}
          active={phase === "NEXT_CHAPTER_BRIDGE"}
        />
        {showNarrativeDebug && LazyArchiveDebugPanel ? (
          <Suspense fallback={null}>
            <LazyArchiveDebugPanel
              snapshot={debugSnapshot}
              testConfig={debugTestConfig}
            />
          </Suspense>
        ) : null}

        {staticMode ? (
          <ReducedMotionArchive
            opened={opened}
            onOpen={() => {
              setOpened(true);
            }}
            reducedMotion={reducedMotion}
          />
        ) : null}

        <button
          className="archive-sequence__skip"
          type="button"
          onClick={
            staticMode
              ? () => document.querySelector("#profile")?.scrollIntoView()
              : controls.skip
          }
        >
          跳过序章 / SKIP
        </button>

        <div className="archive-sequence__progress" aria-hidden="true">
          <span />
          <b>PRESS / SCROLL TO CONTINUE</b>
        </div>
      </div>
    </Root>
  );
}
