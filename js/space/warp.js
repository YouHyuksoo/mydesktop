/**
 * @file js/space/warp.js
 * @description Three.js 공간 효과 - 코스믹 워프 모듈
 */

window.App = window.App || {};
window.App.Space = window.App.Space || {};

(function() {
  'use strict';

  const _i = App.Space._internal;

  /**
   * 코스믹 워프 효과 생성
   * 스타워즈 하이퍼드라이브 스타일의 별 필드 생성
   */
  function createCosmicWarp() {
    // 기존 요소 제거
    App.Space.clearSpace();

    // App.State에서 테마 읽기
    const currentTheme = App.State.glowTheme || _i.glowTheme;

    const config = App.Config.WARP;

    // 워프 모드용 fog 조정 (더 먼 거리)
    _i.scene.fog = new THREE.Fog(0x050508, 200, 2500);

    const themeColors = App.Config.GLOW_THEMES[currentTheme];
    const themeColor = new THREE.Color(themeColors ? themeColors.primary : '#ffd700');

    // 별들 생성
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.STAR_COUNT * 3);
    const sizes = new Float32Array(config.STAR_COUNT);

    for (let i = 0; i < config.STAR_COUNT; i++) {
      // 원통형 분포로 별 배치 (중앙은 비우고)
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 800;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * config.LIMIT;
      sizes[i] = 1 + Math.random() * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: themeColor,
      size: 2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    _i.starField = new THREE.Points(geometry, material);
    _i.starField.userData.isStarField = true;
    _i.scene.add(_i.starField);

    // 원거리 배경 별들 (고정)
    const bgGeometry = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 1000;
      bgPositions[i * 3] = Math.cos(angle) * radius;
      bgPositions[i * 3 + 1] = Math.sin(angle) * radius;
      bgPositions[i * 3 + 2] = -1500 - Math.random() * 500;
    }
    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));

    const bgMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    const bgStars = new THREE.Points(bgGeometry, bgMaterial);
    bgStars.userData.isBackgroundStar = true;
    _i.scene.add(bgStars);
  }

  /**
   * 코스믹 워프 애니메이션 업데이트
   */
  function updateCosmicWarp() {
    if (!_i.starField) return;

    const config = App.Config.WARP;
    const positions = _i.starField.geometry.attributes.position.array;
    const speed = _i.tunnelSpeed * 2; // 워프는 더 빠르게

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 2] += speed;

      // 별이 카메라를 지나가면 뒤로 재배치
      if (positions[i * 3 + 2] > 100) {
        positions[i * 3 + 2] = -config.LIMIT + Math.random() * 100;
        // 새 위치 랜덤화
        const angle = Math.random() * Math.PI * 2;
        const radius = 50 + Math.random() * 800;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
      }
      if (positions[i * 3 + 2] < -config.LIMIT) {
        positions[i * 3 + 2] = 50;
      }
    }

    _i.starField.geometry.attributes.position.needsUpdate = true;

    // 워프 속도에 따른 별 크기 및 밝기 변화 (하이퍼드라이브 효과)
    const baseSize = 2 + Math.abs(_i.tunnelSpeed) * 0.15;
    const baseOpacity = 0.6 + Math.abs(_i.tunnelSpeed) * 0.02 + _i.glowIntensity * 0.3;
    _i.starField.material.size = Math.min(6, baseSize);
    _i.starField.material.opacity = Math.min(1, baseOpacity);

    // FOV 변화로 워프 느낌 강화
    const targetFov = 75 + Math.abs(_i.tunnelSpeed) * 1.5;
    _i.camera.fov += (targetFov - _i.camera.fov) * 0.1;
    _i.camera.updateProjectionMatrix();
  }

  // Export
  App.Space.createCosmicWarp = createCosmicWarp;
  App.Space.updateCosmicWarp = updateCosmicWarp;
})();
