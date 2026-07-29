export type Vec3 = [number, number, number];
export type PhaseRange = [number, number];

export type LightStep = {
  target:
    | "ivory"
    | "wine"
    | "glassTransmission"
    | "baseStatus"
    | "chamber"
    | "trayPoint"
    | "trayScan"
    | "statusRed"
    | "statusCyan"
    | "statusGreen";
  progress: "identify" | "prime" | "activate" | "dispense";
  blend?: "set" | "add";
  start: number;
  duration: number;
  from: number;
  to: number;
  color?: string;
};

export type DialMotion = {
  direction: "clockwise" | "counterclockwise";
  degrees: number;
  resistancePoint: number;
  reboundDegrees: number;
  ease: string;
};

export type RotorMotion = {
  identifyDegrees: number;
  activeTurns: number;
  idleAmplitude: number;
  idleFrequency: number;
  wobbleAmplitude: number;
  wobbleFrequency: number;
};

export type TrayMotion = {
  activationStart: number;
  doorAngle: number;
  extension: number;
};

export type MotionConfig = {
  offset: Vec3;
  rotationDeg: Vec3;
  duration: number;
  hoverAmplitude?: number;
};

export type LandingConfig = {
  bounces: number;
  bounceHeight: number;
  lateralSlide: number;
  lift: number;
  depth: number;
  finalRotationDeg: Vec3;
};

export type OpeningType =
  | "membrane-split"
  | "hinged-lid"
  | "four-panel"
  | "ritual-frame"
  | "twist-lock"
  | "seal-fracture";

export type OpeningParams = {
  topLift?: number;
  bottomDrop?: number;
  topRotationDeg?: Vec3;
  bottomRotationDeg?: Vec3;
  membraneOffset?: number;
  membraneRotationDeg?: number;
  panelAngles?: number[];
  stagger?: number;
};

export type ArchivePieceConfig = {
  id: string;
  kind: "main" | "lyric" | "storyboard" | "palette" | "method";
  label?: string;
  content?: string;
  media?: string;
  alt?: string;
  items?: string[];
  colors?: string[];
};

export type CloseMotion = {
  type: "film-dissolve" | "fold-back" | "scan-collapse";
  blurPx: number;
  saturation: number;
  reconnectToCapsule: boolean;
};

export type ChapterConfig = {
  id: string;
  index: number;
  title: string;
  titleEn?: string;
  year?: string;
  role?: string;
  projectType?: string;
  description?: string;
  keywords?: string[];
  scrollLengthVh: number;

  phases: {
    takeover: PhaseRange;
    identify: PhaseRange;
    prime: PhaseRange;
    activate: PhaseRange;
    dispense: PhaseRange;
    land: PhaseRange;
    open: PhaseRange;
    emerge: PhaseRange;
    read: PhaseRange;
    close: PhaseRange;
    commit: PhaseRange;
    bridge: PhaseRange;
  };

  environment: {
    palette: string[];
    brightness: number;
    saturation: number;
    fogDensity: number;
    residueFromPrevious: number;
  };

  machine: {
    lightSequence: LightStep[];
    dialMotion: DialMotion;
    rotorMotion?: RotorMotion;
    trayMotion?: TrayMotion;
  };

  capsule: {
    materialPreset: string;
    size: number;
    identifyMotion: MotionConfig;
    releasePath: Vec3[];
    landing: LandingConfig;
    openingType: OpeningType;
    openingParams: OpeningParams;
  };

  archive: {
    layoutId: string;
    anchorMode: "capsule" | "viewport";
    pieces: ArchivePieceConfig[];
    readLengthVh: number;
    closeMotion: CloseMotion;
  };

  transition: {
    residueId: string;
    nextPreviewStart: number;
  };
};

export type NarrativeMap = {
  entryLengthVh: number;
  totalLengthVh: number;
  chapters: ChapterConfig[];
};

export type NarrativeSnapshot = {
  globalProgress: number;
  entryProgress: number;
  chapterIndex: number;
  chapterId: string | null;
  chapterProgress: number;
  phase: string;
  archivedCount: number;
  activeCapsule: number;
  nextChapterReady: boolean;
  entry: Record<string, number>;
  chapter: Record<string, number>;
};
