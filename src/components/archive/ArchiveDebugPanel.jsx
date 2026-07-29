export function ArchiveDebugPanel({ snapshot, testConfig }) {
  if (!snapshot) return null;

  return (
    <aside className="archive-debug-panel" aria-label="Archive narrative debug">
      <strong>NARRATIVE SNAPSHOT</strong>
      <span>globalProgress {snapshot.globalProgress.toFixed(4)}</span>
      <span>chapterIndex {snapshot.chapterIndex}</span>
      <span>chapterProgress {snapshot.chapterProgress.toFixed(4)}</span>
      <span>phase {snapshot.phase}</span>
      <span>archivedCount {snapshot.archivedCount}</span>
      <span>
        activeCapsule {String(snapshot.activeCapsule + 1).padStart(2, "0")}
      </span>
      {testConfig ? (
        <>
          <strong>DEBUG CONFIG / NOT RENDERED</strong>
          <span>id {testConfig.id}</span>
          <span>
            dial {testConfig.machine.dialMotion.direction}{" "}
            {testConfig.machine.dialMotion.degrees}°
          </span>
          <span>opening {testConfig.capsule.openingType}</span>
          <span>layout {testConfig.archive.layoutId}</span>
        </>
      ) : null}
    </aside>
  );
}
