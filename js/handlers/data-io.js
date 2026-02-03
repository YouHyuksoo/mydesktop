/**
 * @file js/handlers/data-io.js
 * @description 데이터 내보내기/가져오기 (백업/복원)
 */

window.App = window.App || {};
window.App.Handlers = window.App.Handlers || {};

(function() {
  'use strict';

  /**
   * 데이터 내보내기 (JSON 파일 다운로드)
   */
  function exportData() {
    App.UI.hideSettingsMenu();

    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      shortcuts: App.State.shortcuts,
      categories: App.Storage.loadCategories ? App.Storage.loadCategories() : [],
      settings: {
        tunnelShape: App.State.tunnelShape,
        glowTheme: App.State.glowTheme,
        iconColorMode: App.State.iconColorMode,
        cardStyle: App.State.cardStyle,
        spaceType: App.State.spaceType,
        cardLayout: App.State.cardLayout
      },
      history: JSON.parse(localStorage.getItem('mydesktop-history') || '[]')
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `mydesktop-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    App.showToast('데이터 내보내기 완료!');
  }

  /**
   * 데이터 가져오기 (JSON 파일 복원)
   */
  function importData() {
    App.UI.hideSettingsMenu();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);

          // 버전 확인
          if (!data.version) {
            App.showToast('잘못된 백업 파일입니다');
            return;
          }

          // 확인 메시지
          const confirmed = await App.showConfirm('현재 데이터를 백업 파일로 덮어쓸까요?\n(기존 데이터는 사라집니다)', { title: '데이터 가져오기', danger: true });
          if (!confirmed) {
            return;
          }

          // 데이터 복원
          if (data.shortcuts) {
            App.State.shortcuts = data.shortcuts;
            App.Storage.saveShortcuts(data.shortcuts);
          }

          if (data.categories && App.Storage.saveCategories) {
            App.Storage.saveCategories(data.categories);
            if (App.Categories) App.Categories.load();
          }

          if (data.settings) {
            App.State.tunnelShape = data.settings.tunnelShape || 'triangle';
            App.State.glowTheme = data.settings.glowTheme || 'gold';
            App.State.iconColorMode = data.settings.iconColorMode || 'brand';
            App.State.cardStyle = data.settings.cardStyle || 'glass';
            App.State.spaceType = data.settings.spaceType || 'tunnel';
            App.State.cardLayout = data.settings.cardLayout || 'carousel';
            App.saveSettings();
          }

          if (data.history) {
            localStorage.setItem('mydesktop-history', JSON.stringify(data.history));
            if (App.State.laneData) {
              App.State.laneData.left = data.history;
            }
          }

          // UI 새로고침
          App.Cards.renderCards();
          App.UI.applyGlowTheme(App.State.glowTheme);
          if (App.Categories) App.Categories.updateCategorySelect();

          App.showToast('데이터 가져오기 완료!');

        } catch (err) {
          console.error('Import error:', err);
          App.showToast('파일 읽기 실패');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  // Export
  App.Handlers.exportData = exportData;
  App.Handlers.importData = importData;
})();
