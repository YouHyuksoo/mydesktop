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
    // 카테고리 먼저 로드 (다른 모듈에서 사용하므로)
    if (App.Categories) {
      App.Categories.load();
    }

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
    App.Space.init();

    // 공간 타입에 따라 생성
    if (App.State.spaceType === 'warp') {
      App.Space.createCosmicWarp();
    } else if (App.State.spaceType === 'aurora') {
      App.Space.createAurora();
    } else {
      App.Space.createTunnel();
    }

    // UI 초기화
    App.Sections.createDepthIndicator();
    App.Events.initColorPicker();
    App.Cards.renderCards();
    App.Events.initEventListeners();

    // 레인 시스템 초기화
    if (App.Lanes) {
      App.Lanes.init();
    }

    // 위젯 초기화
    App.Widgets.updateClock();
    setInterval(App.Widgets.updateClock, 1000);
    App.Widgets.initSystemInfo();
    App.Widgets.initWeather();

    // 북마크 드래그앤드롭 초기화
    if (App.Bookmarks) {
      App.Bookmarks.initDropzone();
      App.Bookmarks.initGlobalDrop();
    }

    // 카테고리 셀렉트 업데이트
    if (App.Categories) {
      App.Categories.updateCategorySelect();
    }

    // 메뉴 상태 업데이트
    App.UI.updateSpaceMenu();
    App.UI.updateTunnelMenu();
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

          // 모든 이펙트 시스템 초기화 (분리된 모듈 사용)
          if (App.Effects && App.Effects.init) {
            App.Effects.init();
          }

          // URL 파라미터로 전달된 바로가기 처리
          if (App.Events && App.Events.handleUrlParams) {
            App.Events.handleUrlParams();
          }
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
