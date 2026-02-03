/**
 * @file js/space/core.js
 * @description Three.js 공간 효과 - 코어 모듈 (초기화, 공유 변수, 기본 함수)
 */

window.App = window.App || {};
window.App.Space = window.App.Space || {};

(function() {
  'use strict';

  /**
   * 내부 공유 변수 (다른 space 모듈에서 접근)
   */
  App.Space._internal = {
    // Three.js 객체들
    scene: null,
    camera: null,
    renderer: null,

    // 터널 관련
    tunnelRings: [],

    // 코스믹 워프 관련
    starField: null,

    // 오로라 관련
    auroraMesh: null,
    auroraParticles: null,
    auroraTime: 0,

    // 애니메이션 상태
    tunnelSpeed: 0,
    targetSpeed: 0,
    glowIntensity: 0,

    // 설정
    spaceType: 'tunnel',
    tunnelShape: 'triangle',
    glowTheme: 'gold'
  };

  const _i = App.Space._internal;

  /**
   * Three.js 초기화
   * scene, camera, renderer 생성 및 DOM에 추가
   */
  function init() {
    _i.scene = new THREE.Scene();
    _i.scene.fog = new THREE.Fog(0x050508, 100, 1500);

    _i.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    _i.camera.position.z = 0;

    _i.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    _i.renderer.setSize(window.innerWidth, window.innerHeight);
    _i.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById('canvas-container');
    if (container) {
      container.appendChild(_i.renderer.domElement);
    }
  }

  /**
   * 공간 클리어 (터널/워프/오로라 요소 제거)
   */
  function clearSpace() {
    // 터널 링 제거
    _i.tunnelRings.forEach(function(ring) {
      _i.scene.remove(ring);
    });
    _i.tunnelRings = [];

    // 파티클 제거
    _i.scene.children.filter(function(c) {
      return c.userData.isParticle;
    }).forEach(function(p) {
      _i.scene.remove(p);
    });

    // 별 필드 제거
    if (_i.starField) {
      _i.scene.remove(_i.starField);
      _i.starField = null;
    }

    // 오로라 파티클 제거 (레거시)
    if (_i.auroraParticles) {
      _i.scene.remove(_i.auroraParticles);
      _i.auroraParticles = null;
    }

    // 오로라 스프라이트들 제거
    _i.scene.children.filter(function(c) {
      return c.userData.isAuroraGlow || c.userData.isAuroraSmall ||
             c.userData.isAuroraBackground || c.userData.isAuroraSphere;
    }).forEach(function(s) {
      _i.scene.remove(s);
    });

    // 배경 별 제거
    _i.scene.children.filter(function(c) {
      return c.userData.isBackgroundStar;
    }).forEach(function(s) {
      _i.scene.remove(s);
    });
  }

  /**
   * 창 크기 변경 처리
   */
  function handleResize() {
    if (!_i.camera || !_i.renderer) return;

    _i.camera.aspect = window.innerWidth / window.innerHeight;
    _i.camera.updateProjectionMatrix();
    _i.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 공간 타입 변경
   * @param {string} type - 'tunnel', 'warp', 또는 'aurora'
   */
  function setSpaceType(type) {
    _i.spaceType = type;
    if (type === 'warp') {
      App.Space.createCosmicWarp();
    } else if (type === 'aurora') {
      App.Space.createAurora();
    } else {
      App.Space.createTunnel();
    }
  }

  /**
   * 터널 모양 변경
   * @param {string} shape - triangle, circle, square, hexagon, star, infinity
   */
  function setShape(shape) {
    _i.tunnelShape = shape;
    if (_i.spaceType === 'tunnel') {
      App.Space.createTunnel();
    }
  }

  /**
   * 글로우 테마 변경 시 색상 업데이트
   * @param {string} theme - 테마 이름
   */
  function updateThemeColors(theme) {
    _i.glowTheme = theme;
    const themeColors = App.Config.GLOW_THEMES[theme];
    if (!themeColors) return;

    const threeColor = new THREE.Color(themeColors.primary);

    // 터널 링 색상
    _i.tunnelRings.forEach(function(ring) {
      ring.material.color = threeColor;
    });

    // 파티클 색상 업데이트
    _i.scene.children.forEach(function(child) {
      if (child.userData.isParticle) {
        child.material.color = threeColor;
      }
    });

    // 코스믹 워프 별 색상 업데이트
    if (_i.starField) {
      _i.starField.material.color = threeColor;
    }
  }

  /**
   * 속도 설정
   * @param {number} speed - 목표 속도
   */
  function setTargetSpeed(speed) {
    _i.targetSpeed = speed;
  }

  /**
   * 글로우 강도 설정
   * @param {number} intensity - 강도 (0~1)
   */
  function setGlowIntensity(intensity) {
    _i.glowIntensity = Math.min(1.5, intensity);
  }

  /**
   * 글로우 강도 증가
   * @param {number} amount - 증가량
   */
  function addGlowIntensity(amount) {
    _i.glowIntensity = Math.min(1.5, _i.glowIntensity + amount);
  }

  // Export
  App.Space.init = init;
  App.Space.clearSpace = clearSpace;
  App.Space.handleResize = handleResize;
  App.Space.setSpaceType = setSpaceType;
  App.Space.setShape = setShape;
  App.Space.updateThemeColors = updateThemeColors;
  App.Space.setTargetSpeed = setTargetSpeed;
  App.Space.setGlowIntensity = setGlowIntensity;
  App.Space.addGlowIntensity = addGlowIntensity;

  // Getter
  App.Space.getScene = function() { return _i.scene; };
  App.Space.getCamera = function() { return _i.camera; };
  App.Space.getRenderer = function() { return _i.renderer; };
  App.Space.getTunnelRings = function() { return _i.tunnelRings; };
  App.Space.getStarField = function() { return _i.starField; };
  App.Space.getSpaceType = function() { return _i.spaceType; };
  App.Space.getTunnelShape = function() { return _i.tunnelShape; };
  App.Space.getGlowIntensity = function() { return _i.glowIntensity; };
  App.Space.getTunnelSpeed = function() { return _i.tunnelSpeed; };
})();
