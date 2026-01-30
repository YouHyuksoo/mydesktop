/**
 * @file js/main.js
 * @description 앱 초기화 및 진입점
 *
 * 초보자 가이드:
 * 1. 이 파일이 가장 마지막에 로드됨
 * 2. 다른 모든 모듈을 초기화
 * 3. DOMContentLoaded 이벤트에서 시작
 */

window.App = window.App || {};

(function() {
  'use strict';

  /**
   * 앱 초기화
   */
  function init() {
    // 데이터 로드
    App.State.shortcuts = App.Storage.loadShortcuts();
    const settings = App.Storage.loadSettings();

    // 설정을 App.State에 적용
    App.State.tunnelShape = settings.tunnelShape;
    App.State.glowTheme = settings.glowTheme;
    App.State.iconColorMode = settings.iconColorMode;
    App.State.cardStyle = settings.cardStyle;
    App.State.spaceType = settings.spaceType;
    App.State.cardLayout = settings.cardLayout;
    App.State.selectedColor = App.Config.COLORS[0];

    // Three.js 초기화
    App.Space.initThreeJS();

    // 공간 타입에 따라 생성
    if (App.State.spaceType === 'warp') {
      App.Space.createCosmicWarp();
    } else {
      App.Space.createTunnel();
    }

    // UI 초기화
    App.Sections.createDepthIndicator();
    App.UI.initColorPicker();
    App.Cards.renderCards();
    App.Events.initEventListeners();

    // 위젯 초기화
    App.Widgets.updateClock();
    setInterval(App.Widgets.updateClock, 1000);
    App.Widgets.initSystemInfo();

    // 메뉴 상태 업데이트
    App.UI.updateSpaceMenu();
    App.UI.updateTunnelMenu();
    App.UI.updateIconColorLabel();
    App.UI.updateCardStyleMenu();
    App.UI.updateCardLayoutLabel();

    // 테마 적용
    App.UI.applyGlowTheme(App.State.glowTheme);

    // 애니메이션 시작
    App.Space.animate();

    // 로딩 화면 숨기기
    setTimeout(() => {
      gsap.to('#loading-screen', {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          document.getElementById('loading-screen').style.display = 'none';
          App.UI.animateEntrance();
          App.Effects.startMeteorShower();
        }
      });
    }, 500);
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
