# Design QA

## Comparison Target

- Hero source visual truth: `D:\Codex\阮-简历\kaicheng-portfolio\approved-hero-reference.png`
- Inner-page UI source visual truth: `D:\Codex\阮-简历\kaicheng-portfolio\approved-inner-ui-reference.png`
- Browser-rendered hero: `D:\Codex\阮-简历\kaicheng-portfolio\implementation-hero-personal.png`
- Browser-rendered profile viewport: `D:\Codex\阮-简历\kaicheng-portfolio\implementation-profile-viewport.png`
- Browser-rendered full profile: `D:\Codex\阮-简历\kaicheng-portfolio\implementation-profile-personal.png`
- Browser-rendered projects: `D:\Codex\阮-简历\kaicheng-portfolio\implementation-projects-archive.png`
- Browser-rendered capability hover: `D:\Codex\阮-简历\kaicheng-portfolio\implementation-capability-hover.png`
- Browser-rendered contact ticket hover: `D:\Codex\阮-简历\kaicheng-portfolio\implementation-contact-ticket-hover.png`
- Browser-rendered mobile capability: `D:\Codex\阮-简历\kaicheng-portfolio\implementation-mobile-capabilities.png`
- Full-view side-by-side evidence: `D:\Codex\阮-简历\kaicheng-portfolio\qa-ui-system-comparison.png`
- Focused icon comparison: `D:\Codex\阮-简历\kaicheng-portfolio\qa-icon-system-detail.png`
- Interaction evidence contact sheet: `D:\Codex\阮-简历\kaicheng-portfolio\qa-interaction-contact-sheet.png`
- Route/state: `/`; deterministic layout captures additionally use `?qa=1` to suppress only loader, cursor and entrance motion.
- Desktop viewport: 1440 × 1024 CSS px, device scale factor 1.
- Mobile viewport: 390 × 844 CSS px, device scale factor 1.
- Inner UI source pixels: 1487 × 1058.
- Profile viewport implementation pixels: 1440 × 1024.
- Density normalization: the source was center-fitted to 1440 × 1024 and paired with the 1440 × 1024 browser capture in one 2880 × 1076 comparison canvas. The icon-focused comparison uses equal 560 × 900 crops.

## Findings

- No actionable P0, P1 or P2 findings remain.
- [P3] The implementation is intentionally less collage-dense than the reference image in content-heavy resume sections.
  - Location: Profile, Projects and Capabilities.
  - Evidence: `qa-ui-system-comparison.png` preserves the paper, catalog rail, accession marks, mixed typography and toy-memory icons while reserving more negative space around resume content.
  - Impact: this improves readability without losing the selected art direction.
  - Follow-up: none required.
- [P3] The handwritten display accent still uses the closest available brush-script treatment.
  - Impact: minor optical difference only.
  - Follow-up: self-host a licensed signature typeface when one is selected.

## Required Fidelity Surfaces

- Fonts and typography: large condensed/geometric display text, Chinese serif copy, mono accession labels and violet handwriting remain clearly separated. Small text is limited to functional catalog metadata.
- Spacing and layout rhythm: the fixed museum guide establishes a stable left rail; profile, project and capability content aligns to the resulting archive grid. Paper frames, stamps and tickets use deliberate rotations and restrained shadows.
- Colors and visual tokens: aged almond paper, tobacco ink, muted rose, stamp green, signal red and controlled violet accents match the selected acid-toy memory museum palette.
- Image quality and asset fidelity: approved personal imagery and project stills remain sharp and correctly cropped. Decorative visuals use supplied/generated raster assets; interface icons use one real Phosphor icon family rather than handcrafted SVG or placeholder glyphs.
- Copy and content: all resume, project, capability and contact information remains unchanged and source-grounded.
- Icons: archive rail, portrait tags, section marks, project focus sensor, capability tracks and contact tickets now form one consistent duotone icon system with accession codes and active states.
- Interaction states: archive guide follows the current section; project images respond to pointer position with restrained tilt/focus; capability rows rotate icons and fill status tracks; tickets lift and rotate; pointer clicks create a dissolving memory ripple.
- Responsiveness and accessibility: decorative marks and the fixed rail are removed on compact screens while core icons and controls remain. At 390 px, `innerWidth` and `scrollWidth` both equal 390, with CONTACT ending at 372 px. Keyboard focus, ARIA labels, reduced-motion handling, Escape-to-close and semantic controls remain present.

## Comparison History

1. Earlier hero pass: [P2] the hero portrait did not represent the owner.
   - Fix: integrated the approved personal identity portrait and restored the original right-side kite, film frames, glass marble and chrome hand.
   - Evidence: `implementation-hero-personal.png`.
2. Earlier inner-page pass: [P2] dark sections did not harmonize with the nostalgic museum reference.
   - Fix: introduced the aged-paper archive surface, asymmetric photo frames, accession tags and catalog spacing.
   - Evidence: `qa-ui-system-comparison.png`.
3. Current icon pass: [P2] icons and decoration were present but not designed as a coherent system.
   - Fix: created a single duotone museum language across fixed navigation, section collection marks, portrait memory tags, project focus sensors, capability tracks and contact tickets.
   - Post-fix evidence: `qa-icon-system-detail.png`, `implementation-profile-personal.png` and `qa-interaction-contact-sheet.png`.
4. Current interaction pass: [P2] the site relied mainly on entrance reveals and basic hover color changes.
   - Fix: added active section tracking, pointer tilt/focus, memory ripples, capability track progression, icon rotation and ticket lift/tear feedback.
   - Initial automated finding: pointer tilt and hover transforms were sampled while scroll reveals were still moving.
   - Fix: added mouse-enter and CSS hover fallbacks and verified after the reveal duration.
   - Post-fix measurements: project tilt class active with non-zero X/Y transforms; capability icon transform is non-identity and signal width expands to 104 px; ticket transform includes an approximately 8 px upward translation; ripple count is 1.
5. Responsive pass: [P2] rich desktop decoration could have crowded the mobile narrative.
   - Fix: hide the fixed rail, floating section marks, portrait tags and focus sensor below 780 px while preserving the capability icons and ticket interactions.
   - Evidence: `implementation-mobile-profile.png`, `implementation-mobile-capabilities.png` and `implementation-mobile-contact.png`; no horizontal overflow.

## Primary Interactions Tested

- Active museum guide reports `#profile` in Profile and `#projects` in Projects.
- Project pointer focus activates with non-zero tilt variables and 3D transform.
- Capability hover rotates/scales the icon and fills the status line.
- Contact ticket hover translates and rotates the ticket.
- Pointer-down creates one memory ripple.
- Project detail modal opens with `大禹之解封食铁兽` and closes successfully.
- WORK, PROFILE and CONTACT anchors work.
- Email resolves to `mailto:wulai_0708@qq.com`.
- Phone resolves to `tel:18479030393`.
- Browser console and page errors checked: none.
- Desktop and 390 px mobile browser rendering checked.
- Production build completed successfully.

## Implementation Checklist

- [x] Preserve the approved hero and paper museum direction.
- [x] Establish a coherent decorative icon system.
- [x] Add active and hover/focus states to the archive guide.
- [x] Add restrained pointer-focus movement to project imagery.
- [x] Add capability track and icon feedback.
- [x] Upgrade contact links to interactive archive tickets.
- [x] Add click memory ripple and enhanced crosshair cursor.
- [x] Preserve reduced-motion and compact-screen fallbacks.
- [x] Verify primary interactions, desktop/mobile layout and console state.

## Open Questions

- None blocking handoff.

## Follow-up Polish

- Optional P3: add project-specific ambient audio only after final film audio assets are available.
- Optional P3: replace remaining generated project stills with production masters.

final result: passed
