import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

const STATUS = {
  IDLE: ["MEMORY SLOT 01", "STATUS: READY", "DIRECTOR MODE: ACTIVE"],
  TRAVEL: [
    "ARCHIVE ROUTE ACTIVE",
    "DISTANCE: REDUCING",
    "TARGET SIGNAL FOUND",
  ],
  TARGET_LOCK: [
    "OBJECT IDENTIFIED",
    "MEMORY DISPENSER",
    "ACCESS: PENDING",
  ],
  BOOTING: ["CORE ONLINE", "ROTATION ACTIVE", "CAPSULE SELECTING"],
  DISPENSING: ["CAPSULE 01", "OUTPUT CHANNEL ACTIVE", "IDENTITY VERIFYING"],
  UNSEALED: ["WORKSITE 01", "MEMORY UNSEALED", "READ ACCESS GRANTED"],
};

const PROMPT = {
  IDLE: "SCROLL TO ENTER",
  TRAVEL: "ROUTE / ACTIVE",
  TARGET_LOCK: "EXPERIENCE IS DISPENSED",
  BOOTING: "SCROLL TO CHARGE",
  DISPENSING: "OUTPUT READY",
  UNSEALED: "ARCHIVE UNSEALED",
};

export function ArchiveHud({ phase, progress, muted, onToggleMuted }) {
  const status = STATUS[phase] || STATUS.IDLE;

  return (
    <div className="archive-hud" aria-live="polite">
      <div className="archive-hud__status">
        {status.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      <div className="archive-hud__target" aria-hidden="true">
        <span className="archive-hud__target-ring" />
        <span className="archive-hud__target-core" />
        <small>MEMORY / LOCK</small>
      </div>

      <div className="archive-hud__phase">
        <span>{String(Math.round(progress * 100)).padStart(3, "0")}%</span>
        <strong>{PROMPT[phase]}</strong>
      </div>

      <button
        className="archive-hud__sound"
        type="button"
        onClick={onToggleMuted}
        aria-label={muted ? "开启档案环境音" : "关闭档案环境音"}
        data-cursor="OPEN"
      >
        {muted ? <SpeakerSlash weight="duotone" /> : <SpeakerHigh weight="duotone" />}
        <span>{muted ? "MUTED" : "SOUND ON"}</span>
      </button>
    </div>
  );
}
