/**
 * @file js/space/index.js
 * @description Three.js 공간 효과 - 통합 모듈 (애니메이션 루프)
 *
 * 초보자 가이드:
 * 1. **주요 개념**: Three.js를 사용해 배경에 3D 터널/워프/오로라 효과 렌더링
 * 2. **사용 방법**: App.Space.init()으로 초기화, App.Space.animate()로 애니메이션 루프 시작
 * 3. **공간 타입**:
 *    - tunnel: 클래식 삼각형/원형 등 다양한 모양의 터널
 *    - warp: 스타워즈 스타일 코스믹 워프 효과
 *    - aurora: 몽환적인 오로라 빛 효과
 * 4. **의존성**: Three.js, GSAP 라이브러리 필요
 *
 * 모듈 구조:
 * - core.js: 초기화, 공유 변수, 기본 함수
 * - tunnel.js: 클래식 터널 효과
 * - warp.js: 코스믹 워프 효과
 * - aurora.js: 오로라 효과
 * - index.js: 애니메이션 루프 및 통합
 */

window.App = window.App || {};
window.App.Space = window.App.Space || {};

(function() {
  'use strict';

  const _i = App.Space._internal;

  /**
   * 메인 애니메이션 루프
   * requestAnimationFrame으로 호출됨
   */
  function animate() {
    requestAnimationFrame(animate);

    // App.State에서 값 읽기 (외부에서 설정한 값 반영)
    const stateTargetSpeed = App.State.targetSpeed || 0;
    const stateGlowIntensity = App.State.glowIntensity || 0;

    // 속도 보간 (더 부드럽게)
    _i.tunnelSpeed += (stateTargetSpeed - _i.tunnelSpeed) * 0.08;

    // 조명 강도 감쇠
    _i.glowIntensity = Math.max(_i.glowIntensity * 0.95, stateGlowIntensity * 0.95);
    App.State.glowIntensity = _i.glowIntensity;

    // App.State에서 공간 타입 읽기
    const currentSpaceType = App.State.spaceType || _i.spaceType;

    if (currentSpaceType === 'warp') {
      App.Space.updateCosmicWarp();
    } else if (currentSpaceType === 'aurora') {
      App.Space.updateAuroraAnimation();
    } else {
      App.Space.updateTunnelAnimation();
    }

    _i.renderer.render(_i.scene, _i.camera);
  }

  // Export
  App.Space.animate = animate;
})();
