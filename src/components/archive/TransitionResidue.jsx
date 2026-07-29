export function TransitionResidue({ config, active }) {
  return (
    <div
      className={`archive-transition-residue ${active ? "is-active" : ""}`}
      data-residue={config.transition.residueId}
      aria-hidden="true"
    >
      <span>{String(config.index + 1).padStart(2, "0")} / 06 ARCHIVED</span>
      <i />
    </div>
  );
}
