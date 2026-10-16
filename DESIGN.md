# Ultramarine Field Notes

This file is the single design source for this static presentation site. The app's own appearance is preserved inside actual screenshots.

## Intent and structure

Korean inspection engineers follow an actual workflow from linked scans through measurement, human labeling and review, to explicit saving and export. Mode: Experience. Macrostructure: Narrative Workflow. Dials: V7 M9 D4. Navigation: N1 wordmark and two links. Footer: Ft2.

The signature is the actual app in an ultramarine hero, followed by one measurement scrub and a restrained surface wipe. No invented scan graphics, browser chrome, customer proof, model scores or download promises.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| paper | oklch(97.15% .0079 253.85) | Main surface |
| ink | oklch(26.56% .0495 255.21) | Primary copy, dark chapters |
| muted | oklch(45.53% .0484 249.99) | Secondary copy and control outlines |
| line | oklch(81.02% .0327 251.17) | Decorative separators only |
| anchor | oklch(40.59% .1792 267.60) | Hero, export chapter, focus on paper |
| accent | oklch(85.43% .1331 86.69) | Whole second title line, active step, controls on anchor |

Components reference named CSS tokens. Amber is not body copy on paper. Text on ink and anchor becomes paper; their focus rings become amber. The page has one theme; the app's Light/Dark pair is evidence, not a page theme switch.

## Type and layout

Field Notes Display is a locally subset and renamed derivative of IBM Plex Sans KR Bold. Its OFL is in `assets/fonts/OFL.txt`. No external font requests. System Korean sans is the body face; system mono is reserved for numeric context.

Five roles: display48–72px, section32–48px, sub24px, body16/18px, meta14px. Display weight700, body400; display line-height1.16 and tracking−.065em. Body line-height1.6, copy measure64ch.

Spacing:4/8/12/20/32/48/80/128px. Maximum content1200px. All-sharp surfaces. One hero shadow. Controls have44px targets and visible focus. Left-aligned, asymmetric5/7 hero; single-column mobile. Breakpoints375/768/1024/1440, with320/414 checks. Native app bitmaps may be enlarged to read detail.

## Media and motion

- Hero: actual app2.4 frames, at least75 distinct frames and15fps over4–6seconds. No interpolation or crossfade between readouts. Frame and source have the same16:10 ratio.
- Title mask:420ms,40ms stagger, once. Chapter entry:420ms translate/opacity, once. Controls:120ms. Detail view:220ms.
- Measurement: one pinned stage, three actual-frame sequences. Progress only selects a recorded frame. One passive scroll handler, at most one rAF update while the stage or wipe is visible.
- Exactly one current measurement step has amber fill and `aria-current="step"`. Past steps have a check and outline. Mobile stage aligns near the top without a large blank lead-in.
- Chapter playback: actual frames, one visible chapter at a time. Hidden tabs, offscreen media and an open detail dialog suspend playback. Explicit user pause is preserved.
- Reduced motion: no auto video request, playback, pin, scrub, wipe or spatial entry motion. Static scene buttons and sliders remain. Runtime preference changes are honored.

## Content and performance

Every figure is an actual app render of public synthetic input, not parser or defect-performance proof. Human review, memory edits and explicit file saving remain distinct. AI is optional research assistance, not automatic judgment, approval or label saving. Physical, unfolded and native P/L/S meanings stay separate.

Use local responsive WebP and WebM. First navigation including HTML/CSS/JS/font/poster/video must stay below5,000,000bytes. Deferred scenes load lazily. Hero budgets are500KiB mobile and900KiB desktop; font subset stays below300KiB.

Keep `#product-tour`, `#principles`, `#faq` and the legacy scan/label/volume query routes meaningful. No-JS retains the copy, first actual figure, principles and FAQ. Public assets contain no private data, paths, people, institutions or model details.

## Review

Render375/1440 and overflow checks at320/414/768/1024. Verify current-step semantics, pause and offscreen/hidden behavior, reduced-motion startup and changes, keyboard/zoom/focus return, asset/link integrity, contrast, first-load bytes and layout shift. Run design-kit scanning and interface guidelines. Lighthouse is measured by the separate W3 reviewer; do not invent a score.
