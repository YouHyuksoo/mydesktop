/**
 * @file js/space.js
 * @description Three.js 기반 3D 공간 효과 (터널, 코스믹 워프)
 *
 * 초보자 가이드:
 * 1. **주요 개념**: Three.js를 사용해 배경에 3D 터널/워프 효과 렌더링
 * 2. **사용 방법**: App.Space.init()으로 초기화, App.Space.animate()로 애니메이션 루프 시작
 * 3. **공간 타입**:
 *    - tunnel: 클래식 삼각형/원형 등 다양한 모양의 터널
 *    - warp: 스타워즈 스타일 코스믹 워프 효과
 * 4. **의존성**: Three.js 라이브러리 필요
 */

// 전역 네임스페이스 초기화
window.App = window.App || {};

/**
 * 3D 공간 효과 모듈
 * @namespace App.Space
 */
App.Space = (function() {
  'use strict';

  // Three.js 객체들
  let scene = null;
  let camera = null;
  let renderer = null;

  // 터널 관련
  let tunnelRings = [];

  // 코스믹 워프 관련
  let starField = null;

  // 애니메이션 상태
  let tunnelSpeed = 0;
  let targetSpeed = 0;
  let glowIntensity = 0;

  // 설정 (외부에서 변경 가능)
  let spaceType = 'tunnel';
  let tunnelShape = 'triangle';
  let glowTheme = 'gold';

  /**
   * Three.js 초기화
   * scene, camera, renderer 생성 및 DOM에 추가
   *
   * @example
   * App.Space.init();
   */
  function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050508, 100, 1500);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 0;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById('canvas-container');
    if (container) {
      container.appendChild(renderer.domElement);
    }
  }

  /**
   * 터널 모양에 따른 버텍스 좌표 계산
   *
   * @param {string} shape - 모양 타입 (triangle, circle, square, hexagon, star, infinity)
   * @param {number} radius - 반지름
   * @param {number} index - 링 인덱스 (사용하지 않지만 확장성을 위해 유지)
   * @returns {Array<number>} 버텍스 좌표 배열 [x1, y1, z1, x2, y2, z2, ...]
   */
  function getShapeVertices(shape, radius, index) {
    const vertices = [];
    let sides, rotation;

    switch (shape) {
      case 'triangle':
        sides = 3;
        rotation = -Math.PI / 2;
        break;
      case 'square':
        sides = 4;
        rotation = Math.PI / 4;
        break;
      case 'hexagon':
        sides = 6;
        rotation = 0;
        break;
      case 'circle':
        sides = 32;
        rotation = 0;
        break;
      case 'star':
        // 별 모양 - 5개 꼭지점
        for (let j = 0; j <= 10; j++) {
          const angle = (j / 10) * Math.PI * 2 - Math.PI / 2;
          const r = j % 2 === 0 ? radius : radius * 0.5;
          vertices.push(Math.cos(angle) * r, Math.sin(angle) * r, 0);
        }
        return vertices;
      case 'infinity':
        // 무한대 모양 (8자)
        for (let j = 0; j <= 64; j++) {
          const t = (j / 64) * Math.PI * 2;
          const scale = radius * 0.6;
          const x = scale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
          const y = scale * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
          vertices.push(x * 1.8, y * 1.5, 0);
        }
        return vertices;
      default:
        sides = 3;
        rotation = -Math.PI / 2;
    }

    for (let j = 0; j <= sides; j++) {
      const angle = (j / sides) * Math.PI * 2 + rotation;
      vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }
    return vertices;
  }

  /**
   * 클래식 터널 생성
   * 현재 설정된 tunnelShape에 따라 터널 링 생성
   *
   * @example
   * App.Space.setShape('hexagon');
   * App.Space.createTunnel();
   */
  function createTunnel() {
    // 기존 요소 제거
    clearSpace();

    // App.State에서 설정 읽기
    const currentShape = App.State.tunnelShape || tunnelShape;
    const currentTheme = App.State.glowTheme || glowTheme;

    const config = App.Config.TUNNEL;

    // 터널 모드용 fog
    scene.fog = new THREE.Fog(0x050508, 100, 1500);

    const themeColors = App.Config.GLOW_THEMES[currentTheme];
    const primaryColor = new THREE.Color(themeColors ? themeColors.primary : '#ffd700');

    for (let i = 0; i < config.RING_COUNT; i++) {
      const radius = 300 + Math.sin(i * 0.3) * 50;
      const vertices = getShapeVertices(currentShape, radius, i);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const material = new THREE.LineBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0.6
      });

      const ring = new THREE.LineLoop(geometry, material);
      ring.position.z = -i * config.RING_SPACING;
      ring.rotation.z = i * 0.05;
      ring.userData.baseZ = ring.position.z;

      scene.add(ring);
      tunnelRings.push(ring);
    }

    // 파티클 추가
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 100 + Math.random() * 200;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * config.LENGTH;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: primaryColor,
      size: 2,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.userData.isParticle = true;
    scene.add(particles);
  }

  /**
   * 코스믹 워프 효과 생성
   * 스타워즈 하이퍼드라이브 스타일의 별 필드 생성
   *
   * @example
   * App.Space.createCosmicWarp();
   */
  function createCosmicWarp() {
    // 기존 요소 제거
    clearSpace();

    // App.State에서 테마 읽기
    const currentTheme = App.State.glowTheme || glowTheme;

    const config = App.Config.WARP;

    // 워프 모드용 fog 조정 (더 먼 거리)
    scene.fog = new THREE.Fog(0x050508, 200, 2500);

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

    starField = new THREE.Points(geometry, material);
    starField.userData.isStarField = true;
    scene.add(starField);

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
    scene.add(bgStars);
  }

  /**
   * 공간 클리어 (터널/워프 요소 제거)
   *
   * @example
   * App.Space.clearSpace();
   */
  function clearSpace() {
    // 터널 링 제거
    tunnelRings.forEach(function(ring) {
      scene.remove(ring);
    });
    tunnelRings = [];

    // 파티클 제거
    scene.children.filter(function(c) {
      return c.userData.isParticle;
    }).forEach(function(p) {
      scene.remove(p);
    });

    // 별 필드 제거
    if (starField) {
      scene.remove(starField);
      starField = null;
    }

    // 배경 별 제거
    scene.children.filter(function(c) {
      return c.userData.isBackgroundStar;
    }).forEach(function(s) {
      scene.remove(s);
    });
  }

  /**
   * 터널 애니메이션 업데이트
   * animate() 내부에서 호출됨
   */
  function updateTunnelAnimation() {
    const config = App.Config.TUNNEL;

    // 링 이동
    tunnelRings.forEach(function(ring) {
      ring.position.z += tunnelSpeed;
      ring.rotation.z += 0.002;

      // 링이 카메라 뒤로 가면 앞으로 이동
      if (ring.position.z > 100) {
        ring.position.z -= config.LENGTH;
      }
      if (ring.position.z < -config.LENGTH + 100) {
        ring.position.z += config.LENGTH;
      }

      // 거리에 따른 밝기 + 휠 반응
      const dist = Math.abs(ring.position.z);
      const baseOpacity = Math.max(0.1, 0.8 - dist / 1500);
      const glowBoost = glowIntensity * (1 - dist / 1500) * 0.5;
      ring.material.opacity = Math.min(1, baseOpacity + glowBoost);
    });

    // 파티클 이동
    scene.children.forEach(function(child) {
      if (child.userData.isParticle) {
        const positions = child.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 2] += tunnelSpeed;
          if (positions[i * 3 + 2] > 100) {
            positions[i * 3 + 2] -= config.LENGTH;
          }
          if (positions[i * 3 + 2] < -config.LENGTH + 100) {
            positions[i * 3 + 2] += config.LENGTH;
          }
        }
        child.geometry.attributes.position.needsUpdate = true;

        // 파티클 밝기도 휠에 반응
        child.material.opacity = 0.5 + glowIntensity * 0.3;
      }
    });
  }

  /**
   * 코스믹 워프 애니메이션 업데이트
   * animate() 내부에서 호출됨
   */
  function updateCosmicWarp() {
    if (!starField) return;

    const config = App.Config.WARP;
    const positions = starField.geometry.attributes.position.array;
    const speed = tunnelSpeed * 2; // 워프는 더 빠르게

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

    starField.geometry.attributes.position.needsUpdate = true;

    // 워프 속도에 따른 별 크기 및 밝기 변화 (하이퍼드라이브 효과)
    const baseSize = 2 + Math.abs(tunnelSpeed) * 0.15;
    const baseOpacity = 0.6 + Math.abs(tunnelSpeed) * 0.02 + glowIntensity * 0.3;
    starField.material.size = Math.min(6, baseSize);
    starField.material.opacity = Math.min(1, baseOpacity);

    // FOV 변화로 워프 느낌 강화
    const targetFov = 75 + Math.abs(tunnelSpeed) * 1.5;
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();
  }

  /**
   * 메인 애니메이션 루프
   * requestAnimationFrame으로 호출됨
   *
   * @example
   * App.Space.animate();
   */
  function animate() {
    requestAnimationFrame(animate);

    // App.State에서 값 읽기 (외부에서 설정한 값 반영)
    const stateTargetSpeed = App.State.targetSpeed || 0;
    const stateGlowIntensity = App.State.glowIntensity || 0;

    // 속도 보간 (더 부드럽게)
    tunnelSpeed += (stateTargetSpeed - tunnelSpeed) * 0.08;

    // 조명 강도 감쇠
    glowIntensity = Math.max(glowIntensity * 0.95, stateGlowIntensity * 0.95);
    App.State.glowIntensity = glowIntensity;

    // App.State에서 공간 타입 읽기
    const currentSpaceType = App.State.spaceType || spaceType;

    if (currentSpaceType === 'warp') {
      updateCosmicWarp();
    } else {
      updateTunnelAnimation();
    }

    renderer.render(scene, camera);
  }

  /**
   * 창 크기 변경 처리
   *
   * @example
   * window.addEventListener('resize', App.Space.handleResize);
   */
  function handleResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 공간 타입 변경 (tunnel <-> warp)
   *
   * @param {string} type - 'tunnel' 또는 'warp'
   *
   * @example
   * App.Space.setSpaceType('warp');
   */
  function setSpaceType(type) {
    spaceType = type;
    if (type === 'warp') {
      createCosmicWarp();
    } else {
      createTunnel();
    }
  }

  /**
   * 터널 모양 변경
   *
   * @param {string} shape - triangle, circle, square, hexagon, star, infinity
   *
   * @example
   * App.Space.setShape('hexagon');
   */
  function setShape(shape) {
    tunnelShape = shape;
    if (spaceType === 'tunnel') {
      createTunnel();
    }
  }

  /**
   * 글로우 테마 변경 시 색상 업데이트
   *
   * @param {string} theme - 테마 이름 (gold, purple, cyan 등)
   *
   * @example
   * App.Space.updateThemeColors('purple');
   */
  function updateThemeColors(theme) {
    glowTheme = theme;
    const themeColors = App.Config.GLOW_THEMES[theme];
    if (!themeColors) return;

    const threeColor = new THREE.Color(themeColors.primary);

    // 터널 링 색상
    tunnelRings.forEach(function(ring) {
      ring.material.color = threeColor;
    });

    // 파티클 색상 업데이트
    scene.children.forEach(function(child) {
      if (child.userData.isParticle) {
        child.material.color = threeColor;
      }
    });

    // 코스믹 워프 별 색상 업데이트
    if (starField) {
      starField.material.color = threeColor;
    }
  }

  /**
   * 속도 설정 (휠/터치 반응용)
   *
   * @param {number} speed - 목표 속도
   *
   * @example
   * App.Space.setTargetSpeed(15);
   */
  function setTargetSpeed(speed) {
    targetSpeed = speed;
  }

  /**
   * 글로우 강도 설정
   *
   * @param {number} intensity - 강도 (0~1)
   */
  function setGlowIntensity(intensity) {
    glowIntensity = Math.min(1.5, intensity);
  }

  /**
   * 글로우 강도 증가
   *
   * @param {number} amount - 증가량
   */
  function addGlowIntensity(amount) {
    glowIntensity = Math.min(1.5, glowIntensity + amount);
  }

  /**
   * 터널 링에 펄스 효과 적용
   * 클릭 이펙트 등에서 사용
   *
   * @example
   * App.Space.pulseRings();
   */
  function pulseRings() {
    tunnelRings.forEach(function(ring, i) {
      const delay = i * 0.02;
      gsap.to(ring.material, {
        opacity: 1,
        duration: 0.1,
        delay: delay,
        onComplete: function() {
          gsap.to(ring.material, {
            opacity: 0.6,
            duration: 0.5
          });
        }
      });
    });
  }

  // Public API
  return {
    // 초기화
    init: init,

    // 공간 생성
    createTunnel: createTunnel,
    createCosmicWarp: createCosmicWarp,
    clearSpace: clearSpace,

    // 애니메이션
    animate: animate,

    // 설정
    setSpaceType: setSpaceType,
    setShape: setShape,
    updateThemeColors: updateThemeColors,
    setTargetSpeed: setTargetSpeed,
    setGlowIntensity: setGlowIntensity,
    addGlowIntensity: addGlowIntensity,

    // 이벤트 핸들러
    handleResize: handleResize,
    pulseRings: pulseRings,

    // Getter (읽기 전용 접근)
    getScene: function() { return scene; },
    getCamera: function() { return camera; },
    getRenderer: function() { return renderer; },
    getTunnelRings: function() { return tunnelRings; },
    getStarField: function() { return starField; },
    getSpaceType: function() { return spaceType; },
    getTunnelShape: function() { return tunnelShape; },
    getGlowIntensity: function() { return glowIntensity; },
    getTunnelSpeed: function() { return tunnelSpeed; }
  };
})();
