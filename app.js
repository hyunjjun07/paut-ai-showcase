"use strict";

const media = window.PAUT_DEMO;
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const narrow = matchMedia("(max-width: 47.99rem)");
const hero = document.querySelector("#hero-video");
const heroButton = document.querySelector("#hero-play");
const pin = document.querySelector("#measure-pin");
const pinStage = document.querySelector(".pin-stage");
const wipe = document.querySelector("#wipe");
const measureCaption = document.querySelector("#stage-caption");
const measureSlider = document.querySelector("#frame-slider");
const stepButtons = [...document.querySelectorAll("[data-step]")];
const detail = document.querySelector("#detail-view");
const detailImage = document.querySelector("#detail-image");
const viewers = new Map();
let selectedStep = 0;
let selectedFrame = 0;
let measureGeneration = 0;
let heroVisible = false;
let heroPausedByUser = false;
let pinVisible = false;
let wipeVisible = false;
let scrollQueued = false;
let sceneRaf = 0;
let activeScene = null;
let returnFocus = null;
let detailGeneration = 0;

function showError() {
  document.querySelector("#media-status").textContent = "시연 장면을 불러오지 못했습니다. 페이지를 다시 열어 주세요.";
}

function frameSource(frame, whole = false) {
  if (!whole && narrow.matches) return frame.mobile;
  return innerWidth >= 1024 ? frame.desktop["1440"] : frame.desktop["768"];
}

function assignPicture(figure, frame) {
  const image = figure.querySelector("img");
  const source = figure.querySelector("source");
  if (source) source.srcset = frame.mobile;
  image.srcset = frame.desktop["768"] + " 768w, " + frame.desktop["1440"] + " 1440w";
  image.sizes = "(min-width: 1440px) 1200px, calc(100vw - 40px)";
  image.src = frame.desktop["768"];
  image.alt = frame.caption + " · 실제 앱 2.4.0 / 공개용 합성 입력";
  image.hidden = false;
}

function reflectHero() {
  heroButton.textContent = heroPausedByUser ? "재생" : "일시정지";
  heroButton.setAttribute("aria-pressed", String(heroPausedByUser));
  heroButton.hidden = motion.matches;
}

function syncHero() {
  reflectHero();
  if (motion.matches) {
    hero.pause();
    if (hero.hasAttribute("src")) { hero.removeAttribute("src"); hero.load(); }
    hero.hidden = true;
    return;
  }
  if (!heroVisible || document.hidden || heroPausedByUser || detail.open) { hero.pause(); return; }
  const next = narrow.matches ? media.hero.video["375"] : media.hero.video["1440"];
  if (hero.getAttribute("src") !== next) hero.src = next;
  hero.play().catch(() => { heroPausedByUser = true; reflectHero(); });
}

async function setMeasurement(step, index, manual = false) {
  const sequence = media.measurement.steps[step];
  const bounded = Math.max(0, Math.min(index, sequence.frames.length - 1));
  const next = sequence.frames[bounded];
  const token = ++measureGeneration;
  const decoded = new Image();
  decoded.src = frameSource(next);
  try { await decoded.decode(); } catch { if (token === measureGeneration) showError(); return; }
  if (token !== measureGeneration) return;
  selectedStep = step;
  selectedFrame = bounded;
  assignPicture(document.querySelector(".measurement-figure"), next);
  measureCaption.textContent = next.caption;
  document.querySelector("#measure-delta").textContent = next.deltaText.join(" · ");
  measureSlider.max = String(sequence.frames.length - 1);
  measureSlider.value = String(bounded);
  measureSlider.setAttribute("aria-valuetext", sequence.label + ", " + (bounded + 1) + " / " + sequence.frames.length);
  stepButtons.forEach((button, i) => {
    button.setAttribute("aria-pressed", String(i === step));
    if (i === step) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
    button.classList.toggle("is-past", i < step);
    button.querySelector(".step-mark").hidden = i >= step;
  });
  viewers.set("measurement", { frame: next });
  if (manual) measureCaption.setAttribute("aria-live", "polite");
}

function scrollTick() {
  scrollQueued = false;
  if (motion.matches || document.hidden || detail.open) return;
  if (wipeVisible) {
    const rect = wipe.getBoundingClientRect();
    wipe.style.setProperty("--wipe", String(Math.max(0, Math.min(1, rect.top / innerHeight))));
  }
  if (!pinVisible) return;
  const progress = Math.max(0, Math.min(1, -pin.getBoundingClientRect().top / Math.max(1, pin.offsetHeight - pinStage.offsetHeight)));
  const step = Math.min(2, Math.floor(progress * 3));
  const frames = media.measurement.steps[step].frames;
  const local = Math.min(1, (progress - step / 3) * 3);
  const index = Math.round(local * (frames.length - 1));
  if (step !== selectedStep || index !== selectedFrame) void setMeasurement(step, index);
}

function requestScroll() {
  if (scrollQueued || motion.matches || document.hidden || (!pinVisible && !wipeVisible)) return;
  scrollQueued = true;
  requestAnimationFrame(scrollTick);
}

async function setScene(state, index) {
  const bounded = Math.max(0, Math.min(index, state.frames.length - 1));
  const next = state.frames[bounded];
  const token = ++state.generation;
  const decoded = new Image();
  decoded.src = frameSource(next);
  try { await decoded.decode(); } catch { if (token === state.generation) showError(); return; }
  if (token !== state.generation) return;
  assignPicture(state.figure, next);
  state.figure.querySelector("figcaption").textContent = next.caption;
  state.index = bounded;
  state.frame = next;
  state.slider.value = String(bounded);
  state.slider.setAttribute("aria-valuetext", state.label + ", " + (bounded + 1) + " / " + state.frames.length);
  state.counter.textContent = (bounded + 1) + " / " + state.frames.length;
}

function sceneTick(now) {
  sceneRaf = 0;
  if (document.hidden || motion.matches || detail.open) return;
  const state = activeScene;
  if (!state || !state.play || state.frames.length < 2) return;
  if (now - state.clock >= 2200) {
    state.clock = now;
    void setScene(state, (state.index + 1) % state.frames.length);
  }
  sceneRaf = requestAnimationFrame(sceneTick);
}

function startScenes() {
  if (!sceneRaf && !motion.matches && !document.hidden && !detail.open && activeScene?.play && activeScene.frames.length > 1)
    sceneRaf = requestAnimationFrame(sceneTick);
}

function reflectScene(state) {
  state.playButton.textContent = state.play ? "일시정지" : "장면 재생";
  state.playButton.setAttribute("aria-pressed", String(!state.play));
  state.playButton.hidden = motion.matches || state.frames.length < 2;
}

function initScene(section, entry) {
  const figure = section.querySelector(".scene-figure");
  figure.dataset.mediaChapter = entry.id;
  const controls = section.querySelector(".scene-controls");
  const state = { id: entry.id, label: entry.label, frames: entry.frames, index: 0, frame: entry.frames[0], generation: 0, play: true, ratio: 0, clock: performance.now(), figure };
  assignPicture(figure, state.frame);
  figure.querySelector("figcaption").textContent = state.frame.caption;
  figure.hidden = false;
  const play = document.createElement("button");
  play.type = "button";
  play.addEventListener("click", () => {
    state.play = !state.play;
    if (!state.play) state.generation++;
    state.clock = performance.now();
    reflectScene(state);
    startScenes();
  });
  const label = document.createElement("label");
  label.htmlFor = "scene-slider-" + entry.id;
  label.textContent = entry.label + " 장면";
  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = label.htmlFor;
  slider.min = "0";
  slider.max = String(entry.frames.length - 1);
  slider.value = "0";
  slider.step = "1";
  slider.setAttribute("aria-valuetext", entry.label + ", 1 / " + entry.frames.length);
  slider.addEventListener("input", () => { state.play = false; reflectScene(state); void setScene(state, Number(slider.value)); });
  const counter = document.createElement("span");
  counter.className = "scene-count";
  counter.textContent = "1 / " + entry.frames.length;
  const zoom = document.createElement("button");
  zoom.type = "button";
  zoom.className = "quiet";
  zoom.textContent = "상세 확대";
  zoom.dataset.zoom = entry.id;
  controls.append(play, label, slider, counter, zoom);
  controls.hidden = false;
  Object.assign(state, { playButton: play, slider, counter });
  reflectScene(state);
  viewers.set(entry.id, state);
}

async function openDetail(button) {
  const key = button.dataset.zoom;
  const frame = viewers.get(key)?.frame;
  if (!frame) return;
  const token = ++detailGeneration;
  returnFocus = button;
  measureGeneration++;
  if (activeScene) activeScene.generation++;
  detailImage.hidden = true;
  detailImage.src = key === "measurement" && narrow.matches ? frame.mobile : frame.desktop["1440"];
  detailImage.alt = frame.caption + " · 실제 앱 2.4.0 / 합성 입력";
  document.querySelector("#detail-caption").textContent = "실제 장면을 불러오는 중입니다.";
  detail.setAttribute("aria-busy", "true");
  detail.showModal();
  syncHero();
  try { await detailImage.decode(); } catch {
    if (token === detailGeneration) {
      detail.setAttribute("aria-busy", "false");
      showError();
    }
    return;
  }
  if (token !== detailGeneration || !detail.open) return;
  detailImage.style.width = detailImage.naturalWidth + "px";
  detailImage.hidden = false;
  document.querySelector("#detail-caption").textContent = frame.caption;
  detail.setAttribute("aria-busy", "false");
  const scroll = detail.querySelector(".detail-scroll");
  scroll.scrollTop = 0;
  const focus = { memory: .88, group: .88, band: .14, review: .38, export: 0, volume: .4 }[key] ?? .5;
  scroll.scrollLeft = Math.max(0, detailImage.naturalWidth * focus - scroll.clientWidth / 2);
}

if (media?.sourceVersion === "2.4.0") {
  document.querySelector(".transport").hidden = false;
  document.querySelector('[data-zoom="hero"]').hidden = false;
  viewers.set("hero", { frame: { desktop: media.hero.poster, mobile: media.hero.poster["375"], caption: "연결 커서가 움직이는 실제 앱 화면" } });
  hero.addEventListener("playing", () => { hero.hidden = false; });
  heroButton.addEventListener("click", () => { heroPausedByUser = !heroPausedByUser; syncHero(); });
  const visible = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target.classList.contains("hero-frame")) { heroVisible = entry.isIntersecting; syncHero(); }
      if (entry.target === pin) { pinVisible = entry.isIntersecting; if (pinVisible) requestScroll(); }
      if (entry.target === wipe) { wipeVisible = entry.isIntersecting; requestScroll(); }
      if (entry.target.dataset.mediaChapter) {
        const state = viewers.get(entry.target.dataset.mediaChapter);
        if (state) {
          if (state.ratio <= .15 && entry.intersectionRatio > .15) state.clock = performance.now();
          state.ratio = entry.intersectionRatio;
        }
      }
    }
    activeScene = [...viewers.values()].filter(state => state.ratio > .15).sort((a, b) => b.ratio - a.ratio)[0] || null;
    startScenes();
  }, { threshold: [0, .15, .35, .6, 1] });
  visible.observe(document.querySelector(".hero-frame"));
  visible.observe(pin);
  visible.observe(wipe);
  media.chapters.forEach(entry => {
    const section = document.querySelector('[data-media-chapter="' + entry.id + '"]');
    if (!section) return;
    initScene(section, entry);
    visible.observe(section.querySelector(".scene-figure"));
  });
  for (const key of ["light", "dark"]) {
    const figure = document.querySelector('[data-theme="' + key + '"]');
    const frame = media.themes[key];
    figure.querySelector("img").src = frameSource(frame, true);
    figure.querySelector("img").alt = frame.caption;
    figure.hidden = false;
    viewers.set("theme-" + key, { frame });
  }
  stepButtons.forEach((button, i) => {
    button.addEventListener("click", () => {
      const frames = media.measurement.steps[i].frames;
      if (motion.matches) {
        void setMeasurement(i, frames.length - 1, true);
      } else {
        const span = Math.max(1, pin.offsetHeight - pinStage.offsetHeight);
        const top = scrollY + pin.getBoundingClientRect().top + (i / 3 + .01) * span;
        scrollTo({ top, behavior: "smooth" });
      }
    });
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (i + 1) % stepButtons.length;
      if (event.key === "ArrowLeft") next = (i + stepButtons.length - 1) % stepButtons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = stepButtons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      stepButtons[next].focus({ preventScroll: true });
      stepButtons[next].click();
    });
  });
  measureSlider.addEventListener("input", () => { void setMeasurement(selectedStep, Number(measureSlider.value), true); });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-zoom]");
    if (button) void openDetail(button);
  });
  document.querySelector("#detail-close").addEventListener("click", () => detail.close());
  detail.addEventListener("close", () => {
    detailGeneration++;
    detail.setAttribute("aria-busy", "false");
    returnFocus?.focus({ preventScroll: true });
    if (activeScene) activeScene.clock = performance.now();
    syncHero();
    startScenes();
  });
  document.addEventListener("visibilitychange", () => {
    if (activeScene) {
      activeScene.generation++;
      activeScene.clock = performance.now();
    }
    syncHero();
    requestScroll();
    startScenes();
  });
  addEventListener("scroll", requestScroll, { passive: true });
  addEventListener("resize", requestScroll);
  narrow.addEventListener("change", () => { syncHero(); void setMeasurement(selectedStep, selectedFrame); });
  motion.addEventListener("change", () => {
    syncHero();
    if (motion.matches) measureGeneration++;
    for (const state of viewers.values()) if (state.playButton) {
      if (motion.matches) state.generation++;
      state.clock = performance.now();
      reflectScene(state);
    }
    if (motion.matches) document.querySelectorAll(".reveal-pending").forEach(element => element.classList.remove("reveal-pending"));
    requestScroll();
    startScenes();
  });
  void setMeasurement(0, 0);
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.remove("reveal-pending");
    entry.target.classList.add("reveal-arrived");
    reveal.unobserve(entry.target);
  }), { threshold: .15 });
  document.querySelectorAll("[data-reveal]").forEach(element => {
    if (!motion.matches) element.classList.add("reveal-pending");
    reveal.observe(element);
  });
  const route = new URL(location.href).searchParams.get("scene");
  const destination = { scan: "product-tour", label: "memory", volume: "volume" }[route];
  if (destination) requestAnimationFrame(() => document.getElementById(destination).scrollIntoView({ behavior: "instant" }));
}
