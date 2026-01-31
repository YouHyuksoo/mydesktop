/**
 * @file js/state.js
 * @description 전역 상태 관리
 *
 * 초보자 가이드:
 * 1. 모든 전역 변수를 App.State에서 관리
 * 2. 다른 모듈에서 App.State.변수명으로 접근
 */

window.App = window.App || {};

// 대문자/소문자 둘 다 지원
App.state = App.State = {
  // 데이터
  shortcuts: [],

  // 현재 상태
  currentSection: 0,
  tunnelSpeed: 0,
  targetSpeed: 0,
  cameraZ: 0,
  isTransitioning: false,
  editingId: null,
  selectedColor: '#ffd700',
  contextTargetId: null,

  // 설정
  tunnelShape: 'triangle',
  glowIntensity: 0,
  glowTheme: 'gold',
  iconColorMode: 'brand',
  cardStyle: 'glass',
  spaceType: 'tunnel',
  cardLayout: 'grid',
  carouselIndex: 0,

  // Three.js
  scene: null,
  camera: null,
  renderer: null,
  tunnelRings: [],
  starField: null,

  // 상수
  RING_COUNT: 40,
  RING_SPACING: 50,
  TUNNEL_LENGTH: 40 * 50,
  STAR_COUNT: 3000,
  WARP_LIMIT: 2000
};
