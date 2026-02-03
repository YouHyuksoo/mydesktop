/**
 * @file js/handlers/settings-handler.js
 * @description 설정 변경 핸들러 (아이콘 색상, 공간 타입, 터널 모양, 카드 스타일)
 */

window.App = window.App || {};
window.App.Handlers = window.App.Handlers || {};

(function() {
  'use strict';

  /**
   * 아이콘 색상 모드 전환
   */
  function toggleIconColor() {
    App.State.iconColorMode = App.State.iconColorMode === 'brand' ? 'white' : 'brand';
    App.saveSettings();
    App.Cards.renderCards();
    App.showToast(App.State.iconColorMode === 'brand' ? '🎨 브랜드 색상' : '⚪ 흰색 아이콘');
  }

  /**
   * 공간 타입 전환 (tunnel -> warp -> aurora -> tunnel)
   */
  function changeSpaceType() {
    // 3가지 타입 순환
    const spaceTypes = ['tunnel', 'warp', 'aurora'];
    const currentIndex = spaceTypes.indexOf(App.State.spaceType);
    const newIndex = (currentIndex + 1) % spaceTypes.length;
    const newType = spaceTypes[newIndex];

    App.State.spaceType = newType;
    App.saveSettings();

    App.Space.clearSpace();
    if (newType === 'warp') {
      App.Space.createCosmicWarp();
    } else if (newType === 'aurora') {
      App.Space.createAurora();
    } else {
      App.Space.createTunnel();
    }

    App.UI.updateSpaceMenu();

    const toastMessages = {
      tunnel: '🔺 클래식 터널',
      warp: '🌌 코스믹 워프',
      aurora: '✨ 오로라'
    };
    App.showToast(toastMessages[newType]);
    App.UI.hideSettingsMenu();
  }

  /**
   * 터널 모양 변경
   * @param {string} shape - 터널 모양
   */
  function changeTunnelShape(shape) {
    App.State.tunnelShape = shape;
    App.saveSettings();

    if (App.State.spaceType === 'tunnel') {
      App.Space.clearSpace();
      App.Space.createTunnel();
    }

    App.UI.updateTunnelMenu();
    App.UI.hideTunnelSubmenu();

    const shapeNames = {
      triangle: '🔺 삼각형',
      circle: '⭕ 원형',
      square: '⬜ 사각형',
      hexagon: '⬡ 육각형',
      star: '⭐ 별',
      infinity: '∞ 무한'
    };
    App.showToast(shapeNames[shape] || shape);
  }

  /**
   * 카드 스타일 변경
   * @param {string} style - 카드 스타일
   */
  function changeCardStyle(style) {
    App.State.cardStyle = style;
    App.saveSettings();
    App.Cards.renderCards();
    App.UI.updateCardStyleMenu();
    App.UI.hideCardStyleSubmenu();

    const styleNames = {
      glass: '🔮 글래스',
      rainbow: '🌈 무지개',
      gradient: '🎨 그라데이션',
      dark: '🌑 다크',
      neon: '💡 네온',
      hermes: '🧡 헤르메스',
      cyberpunk: '🤖 사이버펑크',
      apple: '🍎 애플',
      luxury: '💎 럭셔리'
    };
    App.showToast(styleNames[style] || style);
  }

  // Export
  App.Handlers.toggleIconColor = toggleIconColor;
  App.Handlers.changeSpaceType = changeSpaceType;
  App.Handlers.changeTunnelShape = changeTunnelShape;
  App.Handlers.changeCardStyle = changeCardStyle;
})();
