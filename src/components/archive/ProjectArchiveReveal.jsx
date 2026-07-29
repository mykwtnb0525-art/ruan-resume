import { archiveChapterOne } from "../../data/archiveChapterData.js";

export function ProjectArchiveReveal({ active }) {
  return (
    <section
      className={`project-archive-reveal ${active ? "is-active" : ""}`}
      aria-labelledby="project-archive-title"
      aria-hidden={!active}
    >
      <div className="project-archive-reveal__origin" aria-hidden="true">
        <span />
        <i>PROJECT FILE / 01</i>
      </div>

      <header className="project-archive-reveal__heading">
        <span>CAPSULE 01 / PROJECT ARCHIVE</span>
        <strong>01 / 06 · MEMORY UNSEALED</strong>
      </header>

      <div className="project-archive-reveal__field">
        <article
          className="project-archive-piece project-archive-piece--main"
          data-cursor="READ"
        >
          <span className="project-archive-piece__index">
            PROJECT FILE / {archiveChapterOne.index}
          </span>
          <p className="project-archive-piece__en">
            {archiveChapterOne.titleEn}
          </p>
          <h2 id="project-archive-title">
            <span>我们还有多少时间</span>
            <small>— 王艺洁</small>
          </h2>
          <div className="project-archive-piece__meta">
            <span>{archiveChapterOne.year}</span>
            <span>{archiveChapterOne.role}</span>
            <span>{archiveChapterOne.type}</span>
          </div>
          <p className="project-archive-piece__description">
            {archiveChapterOne.description}
          </p>
          <div className="project-archive-piece__keywords">
            {archiveChapterOne.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </article>

        <article
          className="project-archive-piece project-archive-piece--lyric"
          aria-label="项目标题残页"
        >
          <span>LYRIC / MEMORY FRAGMENT</span>
          <strong>我们还有多少时间</strong>
          <em>HOW MUCH TIME DO WE HAVE</em>
        </article>

        <figure className="project-archive-piece project-archive-piece--storyboard">
          <img src={archiveChapterOne.image} alt="《我们还有多少时间》项目影像静帧" />
          <figcaption>STORYBOARD / FRAME 03</figcaption>
        </figure>

        <article className="project-archive-piece project-archive-piece--palette">
          <span>FADED ECO-FUTURE / COLOR MEMORY</span>
          <div>
            {archiveChapterOne.palette.map((color) => (
              <i key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
          <p>褪色生态未来主义 / 复古未来主义 / 超现实梦境</p>
        </article>

        <article className="project-archive-piece project-archive-piece--method">
          <span>DIRECTOR LOG / METHOD</span>
          {archiveChapterOne.methods.map((method, index) => (
            <p key={method}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {method}
            </p>
          ))}
        </article>
      </div>

      <p className="project-archive-reveal__continue" aria-hidden="true">
        SCROLL TO COMMIT · 02 / 06 NEXT
      </p>
    </section>
  );
}
