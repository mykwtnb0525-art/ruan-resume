import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

const STATUS = {
  KEY_IDLE: ["IDENTITY / KAICHENG RUAN", "STATUS: READY", "ACCESS KEY: 01"],
  KEY_REVEAL: ["CAPABILITY KEY VERIFIED", "ARCHIVE ROUTE: STANDBY", "06 FILES"],
  ACCESS_GRANTED: ["IDENTITY VERIFIED", "ARCHIVE ACCESS GRANTED", "UNIT 01"],
  SPACE_OPENING: [
    "ARCHIVE ROUTE ACTIVE",
    "DISTANCE: REDUCING",
    "TARGET SIGNAL FOUND",
  ],
  MACHINE_APPROACH: [
    "OBJECT IDENTIFIED",
    "MEMORY DISPENSER",
    "ACCESS: GRANTED",
  ],
  MACHINE_AWAKE: ["ARCHIVE CORE ONLINE", "01 / 06 READY", "AWAITING INPUT"],
  ENVIRONMENT_TAKEOVER: ["CAPSULE 01", "ECO-FUTURE SIGNAL", "PROJECT READY"],
  CAPSULE_IDENTIFY: ["TARGET CAPSULE FOUND", "SIGNATURE VERIFIED", "01 / 06"],
  MACHINE_PRIME: ["CHAMBER LIGHT ONLINE", "MEMORY FILM DETECTED", "PRIMING"],
  MACHINE_ACTIVATE: ["DIAL / +230°", "ROTATION ACTIVE", "CAPSULE SELECTED"],
  CAPSULE_DISPENSE: ["OUTPUT CHANNEL ACTIVE", "CAPSULE IN TRANSIT", "01 / 06"],
  CAPSULE_LAND: ["CAPSULE ON TRAY", "SOFT IMPACT VERIFIED", "SCAN READY"],
  CAPSULE_OPEN: ["MEMBRANE RELEASED", "SHELL OPENING", "ARCHIVE SOURCE FOUND"],
  ARCHIVE_EMERGE: ["PROJECT ARCHIVE 01", "MEMORY UNSEALED", "READ ACCESS"],
  ARCHIVE_READ: ["PROJECT ARCHIVE 01", "DIRECTOR / PRODUCTION", "READ ACCESS"],
  ARCHIVE_CLOSE: ["MEMORY RETURNING", "FILM EDGE DISSOLVING", "COMMITTING"],
  MEMORY_COMMIT: ["01 / 06 ARCHIVED", "CAPSULE COMMITTED", "SYSTEM STABLE"],
  NEXT_CHAPTER_BRIDGE: [
    "ARCHIVE CORE ONLINE",
    "02 / 06 READY",
    "AWAITING INPUT",
  ],
};

const PROMPT = {
  KEY_IDLE: "SCROLL TO ENTER",
  KEY_REVEAL: "VERIFYING ACCESS",
  ACCESS_GRANTED: "ACCESS GRANTED",
  SPACE_OPENING: "TRAVEL / ACTIVE",
  MACHINE_APPROACH: "TARGET LOCKED",
  MACHINE_AWAKE: "SCROLL TO PRIME",
  ENVIRONMENT_TAKEOVER: "CHAPTER 01",
  CAPSULE_IDENTIFY: "CAPSULE FOUND",
  MACHINE_PRIME: "SCROLL TO CHARGE",
  MACHINE_ACTIVATE: "TURNING MEMORY",
  CAPSULE_DISPENSE: "OUTPUT ACTIVE",
  CAPSULE_LAND: "CAPSULE READY",
  CAPSULE_OPEN: "UNSEALING",
  ARCHIVE_EMERGE: "ARCHIVE OPENING",
  ARCHIVE_READ: "READ PROJECT",
  ARCHIVE_CLOSE: "COMMIT MEMORY",
  MEMORY_COMMIT: "01 / 06 ARCHIVED",
  NEXT_CHAPTER_BRIDGE: "NEXT CAPSULE READY",
};

export function ArchiveHud({
  phase,
  progress,
  archivedCount,
  muted,
  onToggleMuted,
  chapterConfig,
}) {
  const currentIndex = String(chapterConfig.index + 1).padStart(2, "0");
  const nextIndex = String(chapterConfig.index + 2).padStart(2, "0");
  const dialDirection =
    chapterConfig.machine.dialMotion.direction === "clockwise" ? "+" : "−";
  const configuredStatus = {
    ...STATUS,
    MACHINE_AWAKE: [
      "ARCHIVE CORE ONLINE",
      `${currentIndex} / 06 READY`,
      "AWAITING INPUT",
    ],
    ENVIRONMENT_TAKEOVER: [
      `CAPSULE ${currentIndex}`,
      "ECO-FUTURE SIGNAL",
      "PROJECT READY",
    ],
    CAPSULE_IDENTIFY: [
      "TARGET CAPSULE FOUND",
      "SIGNATURE VERIFIED",
      `${currentIndex} / 06`,
    ],
    MACHINE_ACTIVATE: [
      `DIAL / ${dialDirection}${chapterConfig.machine.dialMotion.degrees}°`,
      "ROTATION ACTIVE",
      "CAPSULE SELECTED",
    ],
    CAPSULE_DISPENSE: [
      "OUTPUT CHANNEL ACTIVE",
      "CAPSULE IN TRANSIT",
      `${currentIndex} / 06`,
    ],
    ARCHIVE_EMERGE: [
      `PROJECT ARCHIVE ${currentIndex}`,
      "MEMORY UNSEALED",
      "READ ACCESS",
    ],
    ARCHIVE_READ: [
      `PROJECT ARCHIVE ${currentIndex}`,
      "DIRECTOR / PRODUCTION",
      "READ ACCESS",
    ],
    MEMORY_COMMIT: [
      `${currentIndex} / 06 ARCHIVED`,
      "CAPSULE COMMITTED",
      "SYSTEM STABLE",
    ],
    NEXT_CHAPTER_BRIDGE: [
      "ARCHIVE CORE ONLINE",
      `${nextIndex} / 06 READY`,
      "AWAITING INPUT",
    ],
  };
  const status = configuredStatus[phase] || configuredStatus.KEY_IDLE;

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
        <strong>{PROMPT[phase] || PROMPT.KEY_IDLE}</strong>
        <i>{String(archivedCount).padStart(2, "0")} / 06</i>
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
