export function ArchiveDebugPanel({ snapshot }) {
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
    </aside>
  );
}
