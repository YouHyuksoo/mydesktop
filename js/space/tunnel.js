/**
 * @file js/space/tunnel.js
 * @description Three.js 공간 효과 - 클래식 터널 모듈
 */

window.App = window.App || {};
window.App.Space = window.App.Space || {};

(function() {
  'use strict';

  const _i = App.Space._internal;

  /**
   * 터널 모양에 따른 버텍스 좌표 계산
   * @param {string} shape - 모양 타입
   * @param {number} radius - 반지름
   * @param {number} index - 링 인덱스
   * @returns {Array<number>} 버텍스 좌표 배열
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
   */
  function createTunnel() {
    // 기존 요소 제거
    App.Space.clearSpace();

    // App.State에서 설정 읽기
    const currentShape = App.State.tunnelShape || _i.tunnelShape;
    const currentTheme = App.State.glowTheme || _i.glowTheme;

    const config = App.Config.TUNNEL;

    // 터널 모드용 fog
    _i.scene.fog = new THREE.Fog(0x050508, 100, 1500);

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

      _i.scene.add(ring);
      _i.tunnelRings.push(ring);
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
    _i.scene.add(particles);
  }

  /**
   * 터널 애니메이션 업데이트
   */
  function updateTunnelAnimation() {
    const config = App.Config.TUNNEL;

    // 링 이동
    _i.tunnelRings.forEach(function(ring) {
      ring.position.z += _i.tunnelSpeed;
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
      const glowBoost = _i.glowIntensity * (1 - dist / 1500) * 0.5;
      ring.material.opacity = Math.min(1, baseOpacity + glowBoost);
    });

    // 파티클 이동
    _i.scene.children.forEach(function(child) {
      if (child.userData.isParticle) {
        const positions = child.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 2] += _i.tunnelSpeed;
          if (positions[i * 3 + 2] > 100) {
            positions[i * 3 + 2] -= config.LENGTH;
          }
          if (positions[i * 3 + 2] < -config.LENGTH + 100) {
            positions[i * 3 + 2] += config.LENGTH;
          }
        }
        child.geometry.attributes.position.needsUpdate = true;

        // 파티클 밝기도 휠에 반응
        child.material.opacity = 0.5 + _i.glowIntensity * 0.3;
      }
    });
  }

  /**
   * 터널 링에 펄스 효과 적용
   */
  function pulseRings() {
    _i.tunnelRings.forEach(function(ring, i) {
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

  // Export
  App.Space.createTunnel = createTunnel;
  App.Space.updateTunnelAnimation = updateTunnelAnimation;
  App.Space.pulseRings = pulseRings;
  App.Space.getShapeVertices = getShapeVertices;
})();
