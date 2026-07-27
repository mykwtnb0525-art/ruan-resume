import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Aperture,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Camera,
  EnvelopeSimple,
  Eye,
  FilmSlate,
  FilmStrip,
  FlowArrow,
  GameController,
  Handshake,
  MagicWand,
  PenNib,
  Phone,
  Play,
  RocketLaunch,
  Sparkle,
  Target,
  Ticket,
  X,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { capabilities, profile, projects, tools } from "./data.js";

gsap.registerPlugin(ScrollTrigger);

const LazyGridScan = lazy(() =>
  import("./components/GridScan.jsx").then((module) => ({
    default: module.GridScan,
  })),
);

function DeferredGridScan(props) {
  const hostRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { rootMargin: "320px" },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="gridscan-deferred" ref={hostRef}>
      {active ? (
        <Suspense fallback={null}>
          <LazyGridScan {...props} />
        </Suspense>
      ) : null}
    </div>
  );
}

function LoadingScreen({ hidden }) {
  return (
    <div className={`loader ${hidden ? "is-hidden" : ""}`} aria-hidden="true">
      <div className="loader__mark">KR / VISUAL ARCHIVE</div>
      <div className="loader__line">
        <span />
      </div>
      <div className="loader__count">00 — 100</div>
    </div>
  );
}

function CustomCursor({ disabled = false }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (disabled) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ringX = x;
    let ringY = y;
    let frame;

    const move = (event) => {
      x = event.clientX;
      y = event.clientY;
      dotRef.current?.style.setProperty("transform", `translate3d(${x}px, ${y}px, 0)`);
    };

    const enter = (event) => {
      const label = event.currentTarget.dataset.cursor || "";
      ringRef.current?.classList.add("is-active");
      if (labelRef.current) labelRef.current.textContent = label;
    };

    const leave = () => {
      ringRef.current?.classList.remove("is-active");
      if (labelRef.current) labelRef.current.textContent = "";
    };

    const animate = () => {
      ringX += (x - ringX) * 0.14;
      ringY += (y - ringY) * 0.14;
      ringRef.current?.style.setProperty(
        "transform",
        `translate3d(${ringX}px, ${ringY}px, 0)`,
      );
      frame = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", move);
    document.querySelectorAll("[data-cursor]").forEach((element) => {
      element.addEventListener("mouseenter", enter);
      element.addEventListener("mouseleave", leave);
    });
    frame = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", move);
      document.querySelectorAll("[data-cursor]").forEach((element) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      });
      cancelAnimationFrame(frame);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef}>
        <span ref={labelRef} />
      </div>
    </>
  );
}

function Navigation() {
  return (
    <header className="navigation">
      <a className="navigation__brand" href="#top" aria-label="返回首页">
        KR
      </a>
      <nav aria-label="主要导航">
        <a href="#projects">WORK</a>
        <a href="#profile">PROFILE</a>
        <a href="#contact">CONTACT</a>
      </nav>
    </header>
  );
}

function Hero({ onOpen }) {
  const railProjects = projects.slice(0, 5);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <Navigation />
      <img
        className="hero__collage"
        src="/assets/hero-collage.png"
        alt="人物投影、旧游戏机、铁皮火箭、红风筝与玻璃弹珠组成的超现实拼贴"
      />
      <img
        className="hero__persona"
        src="/assets/hero-kaicheng-approved.png"
        alt="阮凯城红黑复古质感个人肖像"
      />
      <img
        className="hero__objects-right"
        src="/assets/hero-collage.png"
        alt=""
        aria-hidden="true"
      />
      <div className="hero__wash" />

      <a
        className="hero__archive-link"
        href="#chapter"
        data-cursor="GO"
        aria-label="进入作品档案"
      >
        <span className="hero__archive-icon">
          <ArrowRight weight="light" />
        </span>
        <span>ENTER ARCHIVE</span>
      </a>

      <div className="memory-rail" aria-label="精选项目快速导航">
        {railProjects.map((project) => (
          <a
            href={`#${project.id}`}
            key={project.id}
            className="memory-rail__item"
            data-cursor="VIEW"
            aria-label={`查看 ${project.title}`}
          >
            <img src={project.image} alt="" />
          </a>
        ))}
      </div>

      <div className="hero__copy">
        <p className="eyebrow">GENERATE / THE UNSEEN</p>
        <h1 id="hero-title">
          <span>KAICHENG</span>
          <span>RUAN</span>
        </h1>
        <p className="hero__script" aria-label="dream in frames">
          dream in frames
        </p>
        <p className="hero__role">具有导演思维的 AIGC 视觉创作者</p>
      </div>

      <button
        className="hero-reel"
        type="button"
        onClick={() => onOpen(projects[2])}
        data-cursor="PLAY"
        aria-label="打开精选影片《我们还有多少时间》"
      >
        <img src="/assets/project-time.png" alt="" />
        <span className="hero-reel__shade" />
        <span className="hero-reel__play">
          <Play weight="fill" />
        </span>
        <span className="hero-reel__label">SELECTED FILM</span>
        <span className="hero-reel__name">我们还有多少时间</span>
      </button>

      <a className="hero__scroll" href="#chapter" aria-label="继续向下浏览">
        <ArrowDown weight="light" />
      </a>
    </section>
  );
}

function ChapterPortal() {
  return (
    <section className="chapter-portal" id="chapter" aria-labelledby="chapter-title">
      <div className="chapter-portal__grid" aria-hidden="true">
        <DeferredGridScan
          sensitivity={0.68}
          lineThickness={1}
          linesColor="#312832"
          gridScale={0.115}
          lineStyle="dashed"
          lineJitter={0.14}
          scanColor="#D12629"
          scanOpacity={0.52}
          scanDirection="pingpong"
          scanGlow={0.7}
          scanSoftness={2.5}
          scanDuration={2.6}
          scanDelay={1.2}
          scanOnClick
          enablePost
          bloomIntensity={0.55}
          bloomThreshold={0.08}
          bloomSmoothing={0.7}
          chromaticAberration={0.0015}
          noiseIntensity={0.018}
        />
      </div>
      <div className="chapter-portal__veil" aria-hidden="true" />

      <div className="chapter-portal__hud" aria-hidden="true">
        <span>KR_OS / BUILD 0708</span>
        <span>MEMORY SLOT 01</span>
        <span>STATUS: READY</span>
      </div>

      <div className="chapter-portal__content section-shell">
        <div className="chapter-portal__copy">
          <p className="chapter-portal__code">
            &gt; MOUNT /VISUAL_ARCHIVE
            <br />
            &gt; LOAD MEMORY_FRAGMENTS... 100%
            <br />
            &gt; DIRECTOR_MODE: ACTIVE
          </p>
          <p className="eyebrow">CHAPTER 01 / INSERT COIN</p>
          <h2 id="chapter-title">
            ENTER
            <span>THE ARCHIVE</span>
          </h2>
          <p className="chapter-portal__lead">
            从这里开始，进入镜头、记忆与生成式影像共同构成的视觉档案。
          </p>
          <a href="#profile" className="chapter-portal__continue" data-cursor="ENTER">
            <span>CONTINUE</span>
            <ArrowDown weight="light" />
          </a>
        </div>

        <figure className="chapter-portal__object">
          <img
            className="chapter-portal__car"
            src="/assets/retro-car.png"
            alt="红色丝绒上的复古绿色玩具汽车"
          />
          <figcaption>
            PLAYER 01
            <span>KAICHENG RUAN</span>
          </figcaption>
        </figure>
      </div>

      <div className="chapter-portal__progress" aria-hidden="true">
        <span />
        <b>PRESS / SCROLL TO CONTINUE</b>
      </div>
    </section>
  );
}

function Profile() {
  const stats = [
    ["80%+", "院线电影视效镜头覆盖"],
    ["20", "视效团队协同人数"],
    ["40%", "核心镜头效率提升"],
    ["7+", "影视与商业项目"],
  ];

  return (
    <section className="profile archive-surface" id="profile">
      <div className="profile__inner section-shell">
        <div className="section-kicker">
          <span>01 / PROFILE</span>
          <span>BEHIND THE IMAGE</span>
        </div>
        <MuseumMark
          icon={Eye}
          code="OBJECT / 001"
          label="LOOK CLOSER"
          tone="red"
        />

        <div className="profile__grid">
          <div className="profile__visual reveal-image" data-tilt>
            <img
              src="/assets/kaicheng-fullbody.png"
              alt="阮凯城红色背景全身个人形象照"
            />
            <span className="profile__frame-label">PORTRAIT / FILE 0708</span>
            <div className="profile__artifact-stamps" aria-hidden="true">
              <span><GameController weight="duotone" /> MEMORY / 02</span>
              <span><RocketLaunch weight="duotone" /> DREAM / 03</span>
              <span><Aperture weight="duotone" /> FRAME / 04</span>
            </div>
          </div>

          <div className="profile__content">
            <p className="eyebrow">THE METHOD BEFORE THE IMAGE</p>
            <h2>
              我不只生成画面，
              <em>我设计画面为什么出现。</em>
            </h2>
            <p className="profile__intro">{profile.intro}</p>

            <div className="profile__facts">
              <article>
                <span>EDUCATION</span>
                <strong>四川传媒学院</strong>
                <p>数字媒体艺术 · 本科 · 2024—2028</p>
              </article>
              <article>
                <span>INTERNSHIP</span>
                <strong>四川中视米卡文化传媒公司</strong>
                <p>AIGC 视觉制作与技术测试 · 2025.07—12</p>
              </article>
            </div>
          </div>
        </div>

        <div className="stats" aria-label="项目数据">
          {stats.map(([value, label]) => (
            <div className="stat" key={label}>
              <strong data-count={value}>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MuseumMark({ icon: Icon, code, label, tone = "violet" }) {
  return (
    <div className={`museum-mark museum-mark--${tone}`} aria-hidden="true">
      <span className="museum-mark__icon">
        <Icon weight="duotone" />
      </span>
      <span className="museum-mark__copy">
        <small>{code}</small>
        <strong>{label}</strong>
      </span>
      <Sparkle className="museum-mark__spark" weight="fill" />
    </div>
  );
}

function ArchiveGuide() {
  const items = [
    ["PROFILE", "001", RocketLaunch, "#profile"],
    ["PROJECTS", "002", FilmStrip, "#projects"],
    ["TOOLS", "003", GameController, "#capabilities"],
    ["CONTACT", "004", Sparkle, "#contact"],
  ];
  const [activeHref, setActiveHref] = useState("#profile");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = items
      .map(([, , , href]) => document.querySelector(href))
      .filter(Boolean);
    let frame = 0;

    const update = () => {
      const marker = window.innerHeight * 0.42;
      const current =
        sections.find((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= marker && rect.bottom > marker;
        }) || sections[0];
      const profileTop = document.querySelector("#profile")?.getBoundingClientRect().top;
      const contactTop = document.querySelector("#contact")?.getBoundingClientRect().top;

      if (current) setActiveHref(`#${current.id}`);
      setVisible(
        typeof profileTop === "number" &&
          typeof contactTop === "number" &&
          profileTop < window.innerHeight * 0.72 &&
          contactTop > window.innerHeight * 0.38,
      );
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <aside
      className={`archive-guide ${visible ? "is-visible" : ""}`}
      aria-label="记忆博物馆目录"
      aria-hidden={!visible}
    >
      <div className="archive-guide__identity">
        <strong>KR</strong>
        <span>ACID TOY MEMORY MUSEUM</span>
        <small>ACCESSION / 0708</small>
      </div>
      <p>MUSEUM GUIDE</p>
      <nav>
        {items.map(([label, index, Icon, href]) => (
          <a
            href={href}
            key={label}
            className={activeHref === href ? "is-current" : ""}
            aria-current={activeHref === href ? "page" : undefined}
            tabIndex={visible ? 0 : -1}
            data-cursor="GO"
          >
            <Icon weight="duotone" />
            <span>{label}</span>
            <small>{index}</small>
          </a>
        ))}
      </nav>
      <em>COLLECT THE UNSEEN.</em>
    </aside>
  );
}

function Projects({ onOpen }) {
  return (
    <section className="projects archive-surface" id="projects">
      <div className="projects__inner section-shell">
        <div className="section-kicker">
          <span>02 / SELECTED WORK</span>
          <span>2025 — 2026</span>
        </div>
        <MuseumMark
          icon={FilmSlate}
          code="CATALOG / 002"
          label="MOVING IMAGES"
          tone="green"
        />
        <header className="projects__header">
          <h2>
            IMAGES
            <span>WITH A REASON.</span>
          </h2>
          <p>从脚本、分镜和视觉设定出发，让每个项目拥有自己的影像世界。</p>
        </header>

        <div className="projects__list">
          {projects.map((project, index) => (
            <article
              className={`project-card ${index === 0 ? "project-card--feature" : ""}`}
              id={project.id}
              key={project.id}
            >
              <button
                className="project-card__image reveal-image"
                type="button"
                onClick={() => onOpen(project)}
                data-cursor="VIEW"
                data-tilt
                aria-label={`查看项目 ${project.title}`}
              >
                <img src={project.image} alt={`${project.title} 项目视觉封面`} />
                <span className="project-card__index">{project.index}</span>
                <span className="project-card__sensor" aria-hidden="true">
                  <Target weight="duotone" />
                  MOVE / FOCUS
                </span>
                <span className="project-card__open">
                  <ArrowUpRight weight="light" />
                </span>
              </button>
              <div className="project-card__meta">
                <div>
                  <span>{project.type}</span>
                  <span>{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.role}</p>
                <button
                  type="button"
                  onClick={() => onOpen(project)}
                  data-cursor="OPEN"
                >
                  VIEW CASE <ArrowRight weight="light" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="capabilities" id="capabilities">
      <div className="section-shell">
        <div className="section-kicker">
          <span>03 / CAPABILITIES</span>
          <span>FROM IDEA TO FINAL FRAME</span>
        </div>
        <MuseumMark
          icon={GameController}
          code="SYSTEM / 003"
          label="PLAYER SKILLS"
          tone="violet"
        />
        <header className="capabilities__header">
          <h2>
            CREATIVE
            <span>WORKFLOW</span>
          </h2>
          <p>{profile.statement}</p>
        </header>

        <div className="capability-tracks">
          {capabilities.map((capability, index) => {
            const Icon = [Aperture, MagicWand, PenNib, Camera, FlowArrow][index];
            return (
            <article className="capability" key={capability.index} tabIndex="0">
              <span>{capability.index}</span>
              <span className="capability__icon" aria-hidden="true">
                <Icon weight="duotone" />
              </span>
              <div>
                <p>{capability.english}</p>
                <h3>{capability.title}</h3>
              </div>
              <p>{capability.description}</p>
              <span className="capability__signal" aria-hidden="true">
                <i />
                TRACK READY
              </span>
            </article>
            );
          })}
        </div>
      </div>

      <div className="tool-tape" aria-label="常用工具">
        <div className="tool-tape__track">
          {[...tools, ...tools].map((tool, index) => (
            <span key={`${tool}-${index}`}>{tool}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <img src="/assets/project-gala.png" alt="" className="contact__image" />
      <div className="contact__veil" />
      <div className="contact__content section-shell">
        <MuseumMark
          icon={Handshake}
          code="ADMIT / 004"
          label="OPEN CHANNEL"
          tone="red"
        />
        <p className="eyebrow">AVAILABLE FOR CREATIVE COLLABORATION</p>
        <h2>
          LET’S MAKE
          <span>IMAGES MOVE.</span>
        </h2>
        <p className="contact__script">start with an unseen frame</p>
        <p className="contact__lead">
          让下一次合作，从一个尚未出现的画面开始。
        </p>

        <div className="contact__actions">
          <a
            href={`mailto:${profile.email}`}
            data-cursor="OPEN"
            aria-label="发送邮件"
          >
            <span className="contact__action-icon"><EnvelopeSimple weight="duotone" /></span>
            <span>
              EMAIL
              <strong>{profile.email}</strong>
            </span>
            <span className="contact__action-open"><ArrowUpRight weight="light" /></span>
          </a>
          <a
            href={profile.portfolio}
            target="_blank"
            rel="noreferrer"
            data-cursor="OPEN"
            aria-label="打开作品集"
          >
            <span className="contact__action-icon"><Ticket weight="duotone" /></span>
            <span>
              PORTFOLIO
              <strong>VIEW FULL ARCHIVE</strong>
            </span>
            <span className="contact__action-open"><ArrowUpRight weight="light" /></span>
          </a>
          <a
            href={`tel:${profile.phone}`}
            data-cursor="OPEN"
            aria-label="电话联系"
          >
            <span className="contact__action-icon"><Phone weight="duotone" /></span>
            <span>
              PHONE
              <strong>{profile.phone}</strong>
            </span>
            <span className="contact__action-open"><ArrowUpRight weight="light" /></span>
          </a>
        </div>

        <footer>
          <span>KAICHENG RUAN / AIGC VISUAL DESIGNER</span>
          <span>JIANGXI / CHINA</span>
          <a href="#top">REWIND TO 00:00</a>
        </footer>
      </div>
    </section>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return undefined;
    document.body.classList.add("modal-open");
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="project-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <button
        type="button"
        className="project-modal__backdrop"
        onClick={onClose}
        aria-label="关闭项目详情"
      />
      <aside className="project-modal__panel">
        <button
          className="project-modal__close"
          type="button"
          onClick={onClose}
          aria-label="关闭"
        >
          <X />
        </button>
        <div className="project-modal__visual">
          <img src={project.image} alt={`${project.title} 项目画面`} />
          <span>{project.index} / 06</span>
        </div>
        <div className="project-modal__body">
          <p className="eyebrow">{project.type}</p>
          <h2 id="project-modal-title">{project.title}</h2>
          <p className="project-modal__english">{project.englishTitle}</p>
          <div className="project-modal__info">
            <span>{project.year}</span>
            <span>{project.role}</span>
          </div>
          {project.award ? <p className="project-modal__award">{project.award}</p> : null}
          {project.client ? (
            <p className="project-modal__award">{project.client}</p>
          ) : null}
          <p className="project-modal__description">{project.description}</p>
          <div className="project-modal__metrics">
            {project.metrics.map((metric) => (
              <span key={metric}>{metric}</span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export function App() {
  const rootRef = useRef(null);
  const qaMode = new URLSearchParams(window.location.search).has("qa");
  const [loaded, setLoaded] = useState(qaMode);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (qaMode) return undefined;
    const timer = window.setTimeout(() => setLoaded(true), 1100);
    return () => window.clearTimeout(timer);
  }, [qaMode]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (qaMode || reduced) return undefined;

    const tiltTargets = [...document.querySelectorAll("[data-tilt]")];
    const cleanups = [];

    tiltTargets.forEach((element) => {
      const enter = () => {
        element.style.setProperty("--tilt-x", "0.75deg");
        element.style.setProperty("--tilt-y", "-0.45deg");
        element.classList.add("is-tilting");
      };
      const move = (event) => {
        const rect = element.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        element.style.setProperty("--pointer-x", `${x * 100}%`);
        element.style.setProperty("--pointer-y", `${y * 100}%`);
        element.style.setProperty("--tilt-x", `${(x - 0.5) * 3.2}deg`);
        element.style.setProperty("--tilt-y", `${(0.5 - y) * 2.6}deg`);
        element.classList.add("is-tilting");
      };
      const leave = () => {
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
        element.classList.remove("is-tilting");
      };
      element.addEventListener("mouseenter", enter);
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
      });
    });

    const ripple = (event) => {
      if (!event.target.closest("a, button, [data-tilt]")) return;
      const memoryRipple = document.createElement("span");
      memoryRipple.className = "memory-ripple";
      memoryRipple.style.left = `${event.clientX}px`;
      memoryRipple.style.top = `${event.clientY}px`;
      document.body.appendChild(memoryRipple);
      memoryRipple.addEventListener("animationend", () => memoryRipple.remove(), {
        once: true,
      });
    };

    document.addEventListener("pointerdown", ripple);
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      document.removeEventListener("pointerdown", ripple);
      document.querySelectorAll(".memory-ripple").forEach((element) => element.remove());
    };
  }, [qaMode]);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || qaMode) return undefined;

    const context = gsap.context(() => {
      gsap.from(".hero__copy h1 span", {
        yPercent: 112,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        delay: 1.05,
      });
      gsap.from(".hero__script", {
        opacity: 0,
        x: -80,
        duration: 0.8,
        ease: "power3.out",
        delay: 1.5,
      });
      gsap.to(".hero__collage", {
        scale: 1.08,
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".hero__persona", {
        scale: 1.035,
        yPercent: 3,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".hero__copy", {
        yPercent: 18,
        opacity: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "40% top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray(".reveal-image").forEach((element) => {
        gsap.fromTo(
          element,
          { filter: "blur(14px) saturate(.35)", opacity: 0, y: 70 },
          {
            filter: "blur(0px) saturate(1)",
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            onComplete: () => gsap.set(element, { clearProps: "transform" }),
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          },
        );
      });

      gsap.fromTo(
        ".chapter-portal__car",
        { xPercent: 12, yPercent: 8, rotate: 1.5 },
        {
          xPercent: -4,
          yPercent: -5,
          rotate: -1,
          ease: "none",
          scrollTrigger: {
            trigger: ".chapter-portal",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      gsap.from(".chapter-portal__copy > *", {
        opacity: 0,
        x: -45,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".chapter-portal__copy",
          start: "top 76%",
          once: true,
        },
      });

      gsap.utils.toArray(".project-card").forEach((card, index) => {
        gsap.from(card.querySelector(".project-card__meta"), {
          opacity: 0,
          x: index % 2 ? -55 : 55,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 72%",
            once: true,
          },
        });
        gsap.from(card.querySelector(".project-card__sensor"), {
          opacity: 0,
          scale: 0.6,
          rotate: index % 2 ? 12 : -12,
          duration: 0.65,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 70%",
            once: true,
          },
        });
      });

      gsap.from(".capability", {
        y: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".capability-tracks",
          start: "top 78%",
          once: true,
        },
      });

      gsap.utils.toArray(".museum-mark").forEach((mark) => {
        gsap.from(mark, {
          opacity: 0,
          scale: 0.72,
          rotate: -8,
          duration: 0.7,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: mark,
            start: "top 88%",
            once: true,
          },
        });
        gsap.to(mark.querySelector(".museum-mark__icon"), {
          rotate: 28,
          ease: "none",
          scrollTrigger: {
            trigger: mark.closest("section"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, rootRef);

    return () => context.revert();
  }, [qaMode]);

  return (
    <div ref={rootRef}>
      <LoadingScreen hidden={loaded} />
      <CustomCursor disabled={qaMode} />
      <main>
        <Hero onOpen={setSelectedProject} />
        <ChapterPortal />
        <ArchiveGuide />
        <Profile />
        <Projects onOpen={setSelectedProject} />
        <Capabilities />
        <Contact />
      </main>
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
