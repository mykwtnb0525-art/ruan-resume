import { ArrowDown, X } from "@phosphor-icons/react";
import { internshipData } from "../../data/internshipData.js";

export function InternshipReveal({ revealed, dismissed, onDismiss }) {
  const visible = revealed && !dismissed;

  return (
    <section
      className={`internship-reveal ${visible ? "is-visible" : ""}`}
      aria-labelledby="internship-reveal-title"
      aria-hidden={!visible}
    >
      <div className="internship-reveal__heading">
        <span>CAPSULE 01 / WORK EXPERIENCE</span>
        <strong>IDENTITY VERIFIED</strong>
      </div>

      <div className="internship-reveal__cards">
        <article className="internship-card internship-card--worksite" data-cursor="READ">
          <span className="internship-card__index">WORKSITE 01</span>
          <p className="internship-card__company-en">{internshipData.companyEn}</p>
          <h2 id="internship-reveal-title">{internshipData.company}</h2>
          <div className="internship-card__meta">
            <span>{internshipData.role}</span>
            <span>{internshipData.period}</span>
            <span>{internshipData.location}</span>
          </div>
          <p className="internship-card__intro">{internshipData.intro}</p>
        </article>

        <article className="internship-card internship-card--process" data-cursor="READ">
          <span className="internship-card__index">PROCESS LOG</span>
          <div className="internship-card__keywords">
            {internshipData.keywords.map((keyword, index) => (
              <span key={keyword}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {keyword}
              </span>
            ))}
          </div>
          <div className="internship-card__tasks">
            {internshipData.tasks.map((task, index) => (
              <p key={task}>
                <span>LOG / {String(index + 1).padStart(2, "0")}</span>
                {task}
              </p>
            ))}
          </div>
        </article>

        <article className="internship-card internship-card--learned" data-cursor="READ">
          <span className="internship-card__index">WHAT I LEARNED</span>
          <p>{internshipData.learned}</p>
          <span className="internship-card__stamp">ARCHIVE / VERIFIED</span>
        </article>
      </div>

      <a
        className="internship-reveal__continue"
        href="#profile"
        data-cursor="ENTER"
      >
        CONTINUE TO PROFILE <ArrowDown weight="light" />
      </a>

      <button
        className="internship-reveal__close"
        type="button"
        onClick={onDismiss}
        aria-label="收起实习经历档案"
      >
        <X />
      </button>
    </section>
  );
}
