"use strict";

// Recorded by the 2.1.0 capture tool (assets/demo/manifest.json): every frame is a real
// PAUT app render of synthetic demo input; readouts are the app's own instrument-bar text.
window.PAUT_DEMO = {
  sourceVersion: "2.1.0",
  sourceCommit: "4a5c268c4ac1d2e374aeca9f7ffdd6ea3898c08d",
  dataKind: "synthetic-demo",
  sections: {
    scan: {
      frames: [
        "scan-00.webp", "scan-01.webp", "scan-02.webp", "scan-03.webp", "scan-04.webp",
        "scan-05.webp", "scan-06.webp", "scan-07.webp", "scan-08.webp", "scan-09.webp"
      ],
      caption: "선택 위치가 바뀌면 A/B/S 화면과 C-scan의 연결 커서, 계기줄 판독값이 함께 갱신됩니다. 합성 데모 입력.",
      readouts: [["23 / 96", "21 / 41", "12.60 µs", "55.0°", "ND"], ["31 / 96", "21 / 41", "12.53 µs", "55.0°", "ND"], ["39 / 96", "21 / 41", "12.53 µs", "55.0°", "ND"], ["44 / 96", "21 / 41", "12.45 µs", "55.0°", "ND"], ["47 / 96", "21 / 41", "12.53 µs", "55.0°", "ND"], ["52 / 96", "21 / 41", "12.60 µs", "55.0°", "ND"], ["60 / 96", "21 / 41", "12.60 µs", "55.0°", "ND"], ["69 / 96", "21 / 41", "10.42 µs", "55.0°", "ND"], ["75 / 96", "21 / 41", "12.60 µs", "55.0°", "ND"], ["82 / 96", "21 / 41", "12.60 µs", "55.0°", "ND"]]
    },
    label: {
      frames: ["label-00.webp", "label-01.webp", "label-02.webp"],
      caption: "실제 앱에서 초안을 만들고 명시적으로 저장한 장면입니다. 합성 데모 입력.",
      frameCaptions: [
        "편집 전 · 새 라벨 파일을 연결한 상태. 저장된 라벨 없음.",
        "초안 · 실제 피크 제안으로 만든 영역을 검토 중. 아직 저장하지 않은 상태.",
        "저장 후 · 라벨 1개를 추가·저장했습니다. 계기줄에 저장됨, 검토 상태는 미검토."
      ]
    },
    volume: {
      frames: [
        "volume-00.webp", "volume-01.webp", "volume-02.webp", "volume-03.webp",
        "volume-04.webp", "volume-05.webp", "volume-06.webp", "volume-07.webp",
        "volume-08.webp", "volume-09.webp", "volume-10.webp", "volume-11.webp"
      ],
      caption: "실제 3D 렌더러가 카메라 각도를 바꿔 생성한 장면입니다. 합성 신호와 시편·용접 형상."
    }
  },
  themes: [["theme-dark.webp", "Dark"], ["theme-light.webp", "LightHybrid"]]
};
