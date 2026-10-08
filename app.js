"use strict";

const media = window.PAUT_DEMO;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroImage = document.querySelector("#hero-image");
const stageImage = document.querySelector("#stage-image");
const stage = document.querySelector(".product-stage");
const caption = document.querySelector("#stage-caption");
const slider = document.querySelector("#frame-slider");
const position = document.querySelector("#frame-position");
const playButton = document.querySelector("#stage-play");
const heroPlayButton = document.querySelector("#hero-play");
const followButton = document.querySelector("#follow-story");
const status = document.querySelector("#media-status");
const detail = document.querySelector("#detail-view");
const detailImage = document.querySelector("#detail-image");
const detailOpen = document.querySelector("#detail-open");
const sceneButtons = [...document.querySelectorAll("[data-scene]")].filter(element => element.tagName === "BUTTON");
const chapters = [...document.querySelectorAll("[data-chapter]")];
const sceneNames = { scan: "연결 스캔", label: "라벨 검토", volume: "3D 탐색" };
const frameCache = new Map();
const assetUrl = file => `assets/demo/${file}`;
let scene = "scan";
let frame = 0;
let heroFrame = 0;
let generation = 0;
let follow = true;
let playRequested = !reducedMotion.matches;
let heroPlayRequested = !reducedMotion.matches;
let stageVisible = false;
let heroVisible = true;
let raf = 0;
let stageClock = 0;
let heroClock = 0;
let stageLoading = false;
let heroLoading = false;

function loadFrame(file) {
  if (!frameCache.has(file)) {
    const image = new Image();
    image.src = assetUrl(file);
    frameCache.set(file, image.decode().then(() => image));
    if (frameCache.size > 8) frameCache.delete(frameCache.keys().next().value);
  }
  return frameCache.get(file);
}

function reflectPlayback() {
  playButton.textContent = playRequested ? "시연 일시정지" : "장면 재생";
  heroPlayButton.textContent = heroPlayRequested ? "시연 일시정지" : "시연 재생";
  followButton.textContent = follow ? "스크롤 연동 켜짐" : "스크롤 연동 꺼짐";
  followButton.setAttribute("aria-pressed", String(follow));
}

function describeFrame() {
  const section = media.sections[scene];
  const state = section.frameCaptions?.[frame];
  caption.textContent = state || section.caption;
  position.textContent = `장면 ${frame + 1} / ${section.frames.length}`;
  slider.value = String(frame);
  slider.setAttribute("aria-valuetext", `${sceneNames[scene]}, ${frame + 1} / ${section.frames.length}`);
  stageImage.alt = `${sceneNames[scene]} 실제 앱 렌더링, 장면 ${frame + 1}. 합성 데모 입력.`;
}

async function showFrame(index, changingScene = false) {
  const token = ++generation;
  const section = media.sections[scene];
  const next = Math.max(0, Math.min(index, section.frames.length - 1));
  stageLoading = true;
  if (changingScene) stage.classList.add("is-changing");
  try {
    const image = await loadFrame(section.frames[next]);
    if (token !== generation) return;
    stageImage.src = image.src;
    stageImage.width = image.naturalWidth;
    stageImage.height = image.naturalHeight;
    frame = next;
    describeFrame();
    status.textContent = "";
  } catch {
    if (token === generation) {
      playRequested = false;
      status.textContent = "장면을 불러오지 못했습니다. 연결을 확인한 뒤 장면을 다시 선택해 주세요.";
      frameCache.delete(section.frames[next]);
    }
  } finally {
    if (token === generation) {
      stageLoading = false;
      stage.classList.remove("is-changing");
      reflectPlayback();
    }
  }
}

function selectScene(key, manual = false) {
  if (manual) follow = false;
  scene = key;
  stage.dataset.scene = key;
  slider.max = String(media.sections[key].frames.length - 1);
  sceneButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scene === key)));
  chapters.forEach(chapter => chapter.classList.toggle("is-current", chapter.dataset.chapter === key));
  stageClock = 0;
  showFrame(0, true);
  reflectPlayback();
  const url = new URL(location.href);
  url.searchParams.set("scene", key);
  history.replaceState(null, "", url);
  if (manual) {
    const chapter = chapters.find(item => item.dataset.chapter === key);
    const inset = innerWidth < 768 ? document.querySelector(".stage-dock").offsetHeight + 16 : 32;
    window.scrollTo({
      top: window.scrollY + chapter.getBoundingClientRect().top - inset,
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  }
  startClock();
}

function syncStory() {
  const marker = innerWidth < 768
    ? Math.min(innerHeight * .85, document.querySelector(".stage-dock").offsetHeight + 48)
    : innerHeight * .5;
  const nearest = chapters.map(chapter => {
    const bounds = chapter.getBoundingClientRect();
    return { chapter, distance: Math.max(bounds.top - marker, marker - bounds.bottom, 0) };
  }).sort((a, b) => a.distance - b.distance)[0].chapter;
  if (nearest.dataset.chapter !== scene) selectScene(nearest.dataset.chapter);
}

async function advanceHero() {
  heroLoading = true;
  const frames = media.sections.scan.frames;
  const next = (heroFrame + 1) % frames.length;
  try {
    const image = await loadFrame(frames[next]);
    if (!heroPlayRequested) return;
    heroImage.src = image.src;
    heroImage.width = image.naturalWidth;
    heroImage.height = image.naturalHeight;
    heroFrame = next;
  } catch {
    heroPlayRequested = false;
    reflectPlayback();
  } finally {
    heroLoading = false;
  }
}

function tick(now) {
  raf = 0;
  if (document.hidden) return;
  if (heroVisible && heroPlayRequested && !heroLoading && now - heroClock > 380) {
    heroClock = now;
    advanceHero();
  }
  if (stageVisible && playRequested && !stageLoading) {
    const interval = scene === "label" ? 1500 : scene === "volume" ? 180 : 480;
    if (now - stageClock > interval) {
      stageClock = now;
      showFrame((frame + 1) % media.sections[scene].frames.length);
    }
  }
  if ((heroVisible && heroPlayRequested) || (stageVisible && playRequested)) raf = requestAnimationFrame(tick);
}

function startClock() {
  if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
}

if (media) {
  document.querySelector(".scene-tabs").hidden = false;
  document.querySelector(".transport").hidden = false;
  heroPlayButton.hidden = false;
  detailOpen.hidden = false;
  const initial = new URL(location.href).searchParams.get("scene");
  if (initial && Object.hasOwn(sceneNames, initial)) {
    follow = false;
    selectScene(initial);
  } else {
    slider.max = String(media.sections.scan.frames.length - 1);
    showFrame(0);
  }
  sceneButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectScene(button.dataset.scene, true));
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % sceneButtons.length;
      if (event.key === "ArrowLeft") next = (index + sceneButtons.length - 1) % sceneButtons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = sceneButtons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      sceneButtons[next].focus({ preventScroll: true });
      selectScene(sceneButtons[next].dataset.scene, true);
    });
  });
  slider.addEventListener("input", () => {
    follow = false;
    playRequested = false;
    showFrame(Number(slider.value));
    reflectPlayback();
  });
  playButton.addEventListener("click", () => {
    playRequested = !playRequested;
    reflectPlayback();
    startClock();
  });
  heroPlayButton.addEventListener("click", () => {
    heroPlayRequested = !heroPlayRequested;
    reflectPlayback();
    startClock();
  });
  followButton.addEventListener("click", () => {
    follow = !follow;
    if (follow) syncStory();
    reflectPlayback();
  });
  detailOpen.addEventListener("click", async () => {
    playRequested = false;
    heroPlayRequested = false;
    follow = false;
    reflectPlayback();
    detailImage.src = stageImage.src;
    detailImage.alt = stageImage.alt;
    detail.showModal();
    await detailImage.decode();
    await new Promise(requestAnimationFrame);
    if (!detail.open) return;
    const viewport = document.querySelector(".detail-scroll");
    const focus = scene === "label" ? .9 : scene === "scan" ? .81 : .4;
    viewport.scrollLeft = Math.max(0, viewport.scrollWidth * focus - viewport.clientWidth / 2);
    viewport.scrollTop = 0;
  });
  document.querySelector("#detail-close").addEventListener("click", () => detail.close());
  const chapterObserver = new IntersectionObserver(() => {
    if (follow) syncStory();
  }, { rootMargin: "-35% 0px -15% 0px", threshold: [0, .1, .3, .6] });
  chapters.forEach(chapter => chapterObserver.observe(chapter));
  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === heroImage) heroVisible = entry.isIntersecting;
      if (entry.target === stageImage) stageVisible = entry.isIntersecting;
    });
    startClock();
  }, { threshold: .1 });
  visibilityObserver.observe(heroImage);
  visibilityObserver.observe(stageImage);
  document.addEventListener("visibilitychange", startClock);
  reducedMotion.addEventListener("change", event => {
    if (event.matches) {
      playRequested = false;
      heroPlayRequested = false;
      reflectPlayback();
    }
  });
  reflectPlayback();
  startClock();
}
