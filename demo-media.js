"use strict";

window.PAUT_DEMO = {
  sourceVersion: "1.5.5",
  sourceCommit: "7f7c668a87c60fd0112616bcf6622a8282d40ef1",
  dataKind: "synthetic-demo",
  sections: {
    scan: {
      frames: [
        "scan-00.webp", "scan-01.webp", "scan-02.webp", "scan-03.webp", "scan-04.webp",
        "scan-05.webp", "scan-06.webp", "scan-07.webp", "scan-08.webp", "scan-09.webp"
      ],
      caption: "실제 앱의 선택 위치가 바뀌며 A/B/S 신호와 C-scan의 연결 커서가 갱신됩니다. 합성 데모 입력."
    },
    label: {
      frames: ["label-00.webp", "label-01.webp", "label-02.webp"],
      caption: "실제 앱에서 초안을 생성하고 명시적으로 저장한 장면입니다. 합성 데모 입력.",
      frameCaptions: [
        "편집 전 · 관심 신호를 확인한 실제 앱 화면. 저장된 라벨 없음.",
        "초안 · 실제 피크 제안으로 생성한 영역을 검토 중. 아직 저장하지 않은 상태.",
        "저장 후 · 라벨 1개를 저장하고 다시 열었습니다. 검토 상태는 Draft(미검토)입니다."
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
  }
};
