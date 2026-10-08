"use strict";

const scanViews = {
  a: {
    title: "파형에서 시작하는 확인",
    description: "선택한 위치의 진폭 변화를 파형으로 살펴봅니다. 시간 또는 음로 축의 신호를 다른 스캔의 위치 정보와 연결해 읽습니다.",
    perspective: "A-scan · 파형 관점",
    diagram: "A-scan 파형 관점 개념도",
    detail: "금속 내부의 한 관심 위치를 파형과 연결한 설명용 도해입니다. 모든 선과 신호는 개념 표현입니다.",
    label: "WAVEFORM"
  },
  b: {
    title: "단면으로 이어 보는 신호",
    description: "스캔 위치에 따른 신호를 단면으로 살펴봅니다. 관심 지시가 주변 위치와 어떤 관계로 이어지는지 파형과 함께 확인합니다.",
    perspective: "B-scan · 단면 관점",
    diagram: "B-scan 단면 관점 개념도",
    detail: "금속을 가로지르는 단면에 신호의 연결 관계를 표시한 개념도입니다. 실제 깊이 또는 결함 치수를 나타내지 않습니다.",
    label: "CROSS SECTION"
  },
  c: {
    title: "평면에서 찾는 관심 영역",
    description: "평면에 투영된 신호 분포를 살펴봅니다. 넓은 영역에서 관심 위치를 찾고, 그 위치의 다른 스캔을 함께 검토합니다.",
    perspective: "C-scan · 평면 관점",
    diagram: "C-scan 평면 관점 개념도",
    detail: "금속의 윗면에 관심 영역과 탐색 경로를 표시한 개념도입니다. 실제 검사 분포나 결함 크기를 나타내지 않습니다.",
    label: "PLAN VIEW"
  },
  s: {
    title: "각도를 달리하며 읽는 맥락",
    description: "여러 빔 각도에서 얻은 신호를 부채꼴 관점으로 살펴봅니다. 각도별 지시를 다른 스캔과 연결해 확인합니다.",
    perspective: "S-scan · 각도 관점",
    diagram: "S-scan 각도 관점 개념도",
    detail: "탐촉자에서 퍼지는 여러 빔과 관심 위치를 부채꼴로 표현한 개념도입니다. 실제 음로 또는 교정된 측정 결과가 아닙니다.",
    label: "SECTOR VIEW"
  }
};

const controls = document.querySelector(".scan-controls");
const buttons = [...controls.querySelectorAll("button")];
const explanation = document.querySelector("#scan-explanation");
const diagram = document.querySelector("#scan-diagram");

function selectScan(key, updateUrl = true) {
  const view = scanViews[key];
  buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scan === key)));
  explanation.querySelector("h3").textContent = view.title;
  explanation.querySelector("p").textContent = view.description;
  explanation.querySelector(".scan-perspective").textContent = view.perspective;
  diagram.dataset.view = key;
  diagram.querySelector("title").textContent = view.diagram;
  diagram.querySelector("desc").textContent = view.detail;
  diagram.querySelector("#diagram-view-label").textContent = view.label;
  diagram.querySelectorAll("[data-layer]").forEach(layer => {
    layer.toggleAttribute("hidden", layer.dataset.layer !== key);
  });
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("scan", key);
    window.history.replaceState(null, "", url);
  }
}

buttons.forEach((button, index) => {
  button.addEventListener("click", () => selectScan(button.dataset.scan));
  button.addEventListener("keydown", event => {
    let target;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") target = (index + 1) % buttons.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") target = (index - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = buttons.length - 1;
    if (target === undefined) return;
    event.preventDefault();
    buttons[target].focus({ preventScroll: true });
    selectScan(buttons[target].dataset.scan);
  });
});

const initialScan = new URL(window.location.href).searchParams.get("scan");
if (Object.hasOwn(scanViews, initialScan)) selectScan(initialScan, false);
controls.hidden = false;
