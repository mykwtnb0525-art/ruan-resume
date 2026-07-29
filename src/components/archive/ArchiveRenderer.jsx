import { getArchiveLayout } from "./config/ArchiveLayout.ts";

const indexLabel = (index) => String(index + 1).padStart(2, "0");

export function ArchiveRenderer({ active, config }) {
  const layout = getArchiveLayout(config.archive.layoutId);
  const pieces = Object.fromEntries(
    config.archive.pieces.map((piece) => [piece.kind, piece]),
  );
  const [mainTitle, author] = config.title.split("—");
  const currentIndex = indexLabel(config.index);
  const nextIndex = indexLabel(config.index + 1);

  return (
    <section
      className={`project-archive-reveal ${layout?.className || ""} ${
        active ? "is-active" : ""
      }`}
      aria-labelledby="project-archive-title"
      aria-hidden={!active}
      data-layout={config.archive.layoutId}
      data-anchor-mode={config.archive.anchorMode}
    >
      <div className="project-archive-reveal__origin" aria-hidden="true">
        <span />
        <i>{pieces.main?.label || `PROJECT FILE / ${currentIndex}`}</i>
      </div>

      <header className="project-archive-reveal__heading">
        <span>CAPSULE {currentIndex} / PROJECT ARCHIVE</span>
        <strong>{currentIndex} / 06 · MEMORY UNSEALED</strong>
      </header>

      <div className="project-archive-reveal__field">
        <article
          className="project-archive-piece project-archive-piece--main"
          data-cursor="READ"
        >
          <span className="project-archive-piece__index">
            {pieces.main?.label || `PROJECT FILE / ${currentIndex}`}
          </span>
          <p className="project-archive-piece__en">{config.titleEn}</p>
          <h2 id="project-archive-title">
            <span>{mainTitle}</span>
            {author ? <small>— {author}</small> : null}
          </h2>
          <div className="project-archive-piece__meta">
            <span>{config.year}</span>
            <span>{config.role}</span>
            <span>{config.projectType}</span>
          </div>
          <p className="project-archive-piece__description">
            {config.description}
          </p>
          <div className="project-archive-piece__keywords">
            {config.keywords?.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </article>

        <article
          className="project-archive-piece project-archive-piece--lyric"
          aria-label="项目标题残页"
        >
          <span>{pieces.lyric?.label}</span>
          <strong>{pieces.lyric?.content}</strong>
          <em>{config.titleEn}</em>
        </article>

        <figure className="project-archive-piece project-archive-piece--storyboard">
          <img src={pieces.storyboard?.media} alt={pieces.storyboard?.alt || ""} />
          <figcaption>{pieces.storyboard?.label}</figcaption>
        </figure>

        <article className="project-archive-piece project-archive-piece--palette">
          <span>{pieces.palette?.label}</span>
          <div>
            {pieces.palette?.colors?.map((color) => (
              <i key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
          <p>{pieces.palette?.content}</p>
        </article>

        <article className="project-archive-piece project-archive-piece--method">
          <span>{pieces.method?.label}</span>
          {pieces.method?.items?.map((method, index) => (
            <p key={method}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {method}
            </p>
          ))}
        </article>
      </div>

      <p className="project-archive-reveal__continue" aria-hidden="true">
        SCROLL TO COMMIT · {nextIndex} / 06 NEXT
      </p>
    </section>
  );
}
