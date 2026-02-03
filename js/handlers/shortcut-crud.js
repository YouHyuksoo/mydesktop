/**
 * @file js/handlers/shortcut-crud.js
 * @description 바로가기 CRUD (생성, 수정, 삭제)
 */

window.App = window.App || {};
window.App.Handlers = window.App.Handlers || {};

(function() {
  'use strict';

  /**
   * 바로가기 저장
   */
  function saveShortcut() {
    const title = document.getElementById('shortcut-title').value.trim();
    const url = document.getElementById('shortcut-url').value.trim();
    const layer = parseInt(document.getElementById('shortcut-layer').value);
    const icon = document.getElementById('shortcut-icon').value.trim();

    if (!title || !url) {
      App.showToast('제목과 URL을 입력해주세요');
      return;
    }

    if (App.State.editingId) {
      // 수정
      const idx = App.State.shortcuts.findIndex(x => x.id === App.State.editingId);
      if (idx >= 0) {
        App.State.shortcuts[idx] = {
          ...App.State.shortcuts[idx],
          title, url, layer, icon,
          color: App.State.selectedColor
        };
      }
    } else {
      // 새로 추가
      App.State.shortcuts.push({
        id: Date.now().toString(),
        title, url, layer, icon,
        color: App.State.selectedColor
      });
    }

    App.saveShortcuts();
    App.Cards.renderCards();
    App.UI.closeModal();
    App.showToast(App.State.editingId ? '수정 완료!' : '추가 완료!');
  }

  /**
   * 바로가기 삭제
   * @param {string} id - 삭제할 바로가기 ID
   */
  async function deleteShortcut(id) {
    const confirmed = await App.showConfirm('삭제할까요?', { title: '바로가기 삭제', danger: true });
    if (confirmed) {
      App.State.shortcuts = App.State.shortcuts.filter(x => x.id !== id);
      App.saveShortcuts();
      App.Cards.renderCards();
      App.UI.closeModal();
      App.showToast('삭제 완료!');
    }
  }

  // Export
  App.Handlers.saveShortcut = saveShortcut;
  App.Handlers.deleteShortcut = deleteShortcut;
})();
