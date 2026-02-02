/**
 * @file js/categories.js
 * @description 카테고리 관리 모듈 - CRUD 및 UI 렌더링
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 기본 카테고리 + 사용자 정의 카테고리 통합 관리
 * 2. **사용 방법**: App.Categories.getAll(), App.Categories.add(name, subtitle, icon) 등
 * 3. **데이터 구조**:
 *    - 기본 카테고리: id 0~99 (App.Config.DEFAULT_CATEGORIES)
 *    - 사용자 정의: id 100+ (localStorage에 저장)
 */

window.App = window.App || {};

App.Categories = (function() {
  'use strict';

  // 사용자 정의 카테고리 시작 ID
  const CUSTOM_ID_START = 100;

  // 메모리에 캐시된 사용자 정의 카테고리
  let customCategories = [];

  /**
   * 사용자 정의 카테고리 로드
   * @returns {Array} 사용자 정의 카테고리 배열
   */
  function load() {
    customCategories = App.Storage.loadCategories();
    return customCategories;
  }

  /**
   * 사용자 정의 카테고리 저장
   * @returns {boolean} 저장 성공 여부
   */
  function save() {
    return App.Storage.saveCategories(customCategories);
  }

  /**
   * 모든 카테고리 반환 (기본 + 사용자 정의)
   * @returns {Array} 전체 카테고리 배열
   */
  function getAll() {
    const defaults = App.Config.DEFAULT_CATEGORIES || App.Config.SECTIONS;
    return [...defaults, ...customCategories];
  }

  /**
   * 기본 카테고리만 반환
   * @returns {Array} 기본 카테고리 배열
   */
  function getDefaults() {
    return App.Config.DEFAULT_CATEGORIES || App.Config.SECTIONS;
  }

  /**
   * 사용자 정의 카테고리만 반환
   * @returns {Array} 사용자 정의 카테고리 배열
   */
  function getCustom() {
    return customCategories;
  }

  /**
   * ID로 카테고리 찾기
   * @param {number} id - 카테고리 ID
   * @returns {Object|null} 카테고리 객체 또는 null
   */
  function getById(id) {
    return getAll().find(cat => cat.id === id) || null;
  }

  /**
   * 새 카테고리 추가
   * @param {string} name - 카테고리 이름
   * @param {string} subtitle - 부제목 (선택)
   * @param {string} icon - 이모지 아이콘 (선택)
   * @returns {Object} 추가된 카테고리 객체
   */
  function add(name, subtitle = '', icon = '📁') {
    // 새 ID 생성 (기존 최대값 + 1)
    const maxId = customCategories.length > 0
      ? Math.max(...customCategories.map(c => c.id))
      : CUSTOM_ID_START - 1;

    const newCategory = {
      id: maxId + 1,
      name: name.toUpperCase(),
      subtitle: subtitle || `Custom category`,
      icon: icon
    };

    customCategories.push(newCategory);
    save();

    return newCategory;
  }

  /**
   * 카테고리 수정
   * @param {number} id - 수정할 카테고리 ID
   * @param {Object} data - 수정할 데이터 { name, subtitle, icon }
   * @returns {boolean} 수정 성공 여부
   */
  function update(id, data) {
    // 기본 카테고리는 수정 불가
    if (id < CUSTOM_ID_START) {
      console.warn('Cannot update default categories');
      return false;
    }

    const idx = customCategories.findIndex(c => c.id === id);
    if (idx === -1) return false;

    if (data.name) customCategories[idx].name = data.name.toUpperCase();
    if (data.subtitle !== undefined) customCategories[idx].subtitle = data.subtitle;
    if (data.icon) customCategories[idx].icon = data.icon;

    save();
    return true;
  }

  /**
   * 카테고리 삭제
   * @param {number} id - 삭제할 카테고리 ID
   * @returns {boolean} 삭제 성공 여부
   */
  function remove(id) {
    // 기본 카테고리는 삭제 불가
    if (id < CUSTOM_ID_START) {
      console.warn('Cannot delete default categories');
      return false;
    }

    const idx = customCategories.findIndex(c => c.id === id);
    if (idx === -1) return false;

    customCategories.splice(idx, 1);
    save();

    // 해당 카테고리의 바로가기들을 첫 번째 카테고리로 이동
    if (App.State && App.State.shortcuts) {
      App.State.shortcuts.forEach(shortcut => {
        if (shortcut.layer === id) {
          shortcut.layer = 0;
        }
      });
      App.saveShortcuts();
    }

    return true;
  }

  /**
   * 카테고리 관리 모달 열기
   */
  function openManager() {
    const modal = document.getElementById('category-modal');
    if (!modal) return;

    renderManagerList();
    modal.classList.add('active');
  }

  /**
   * 카테고리 관리 모달 닫기
   */
  function closeManager() {
    const modal = document.getElementById('category-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * 카테고리 관리 목록 렌더링
   */
  function renderManagerList() {
    const list = document.getElementById('category-list');
    if (!list) return;

    const categories = getAll();
    list.innerHTML = '';

    categories.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'category-item';
      item.dataset.id = cat.id;

      const isDefault = cat.id < CUSTOM_ID_START;

      item.innerHTML = `
        <span class="category-icon">${cat.icon || '📁'}</span>
        <div class="category-info">
          <div class="category-name">${cat.name}</div>
          <div class="category-subtitle">${cat.subtitle}</div>
        </div>
        ${isDefault ? '<span class="category-badge">기본</span>' : `
          <div class="category-actions">
            <button class="category-edit-btn" title="수정">✏️</button>
            <button class="category-delete-btn" title="삭제">🗑️</button>
          </div>
        `}
      `;

      // 수정 버튼 이벤트
      const editBtn = item.querySelector('.category-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openEditDialog(cat);
        });
      }

      // 삭제 버튼 이벤트
      const deleteBtn = item.querySelector('.category-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const confirmed = await App.showConfirm(`"${cat.name}" 카테고리를 삭제할까요?\n해당 카테고리의 바로가기는 FAVORITES로 이동됩니다.`, { title: '카테고리 삭제', danger: true });
          if (confirmed) {
            remove(cat.id);
            renderManagerList();
            refreshUI();
            App.showToast('카테고리 삭제됨');
          }
        });
      }

      list.appendChild(item);
    });
  }

  /**
   * 카테고리 편집 다이얼로그 열기
   * @param {Object} category - 편집할 카테고리 (null이면 새 카테고리)
   */
  function openEditDialog(category = null) {
    const nameInput = document.getElementById('category-name-input');
    const subtitleInput = document.getElementById('category-subtitle-input');
    const iconInput = document.getElementById('category-icon-input');
    const dialog = document.getElementById('category-edit-dialog');
    const title = document.getElementById('category-edit-title');

    if (!dialog) return;

    if (category) {
      title.textContent = '카테고리 수정';
      nameInput.value = category.name;
      subtitleInput.value = category.subtitle;
      iconInput.value = category.icon || '📁';
      dialog.dataset.editId = category.id;
    } else {
      title.textContent = '새 카테고리';
      nameInput.value = '';
      subtitleInput.value = '';
      iconInput.value = '📁';
      delete dialog.dataset.editId;
    }

    dialog.classList.add('active');
    nameInput.focus();
  }

  /**
   * 카테고리 편집 다이얼로그 닫기
   */
  function closeEditDialog() {
    const dialog = document.getElementById('category-edit-dialog');
    if (dialog) {
      dialog.classList.remove('active');
    }
  }

  /**
   * 카테고리 저장 (추가 또는 수정)
   */
  function saveFromDialog() {
    const dialog = document.getElementById('category-edit-dialog');
    const nameInput = document.getElementById('category-name-input');
    const subtitleInput = document.getElementById('category-subtitle-input');
    const iconInput = document.getElementById('category-icon-input');

    const name = nameInput.value.trim();
    if (!name) {
      App.showToast('카테고리 이름을 입력해주세요');
      return;
    }

    const editId = dialog.dataset.editId;
    if (editId) {
      // 수정
      update(parseInt(editId), {
        name: name,
        subtitle: subtitleInput.value.trim(),
        icon: iconInput.value.trim() || '📁'
      });
      App.showToast('카테고리 수정됨');
    } else {
      // 추가
      add(name, subtitleInput.value.trim(), iconInput.value.trim() || '📁');
      App.showToast('카테고리 추가됨');
    }

    closeEditDialog();
    renderManagerList();
    refreshUI();
  }

  /**
   * UI 새로고침 (깊이 인디케이터, 카드, 셀렉트 등)
   */
  function refreshUI() {
    // 깊이 인디케이터 재생성
    const depthIndicator = document.getElementById('depth-indicator');
    if (depthIndicator) {
      depthIndicator.innerHTML = '';
      App.Sections.createDepthIndicator();
    }

    // 모달의 카테고리 셀렉트 업데이트
    updateCategorySelect();

    // 카드 재렌더링
    if (App.Cards && App.Cards.renderCards) {
      App.Cards.renderCards();
    }
  }

  /**
   * 바로가기 모달의 카테고리 셀렉트 옵션 업데이트
   */
  function updateCategorySelect() {
    const select = document.getElementById('shortcut-layer');
    if (!select) return;

    const categories = getAll();
    select.innerHTML = '';

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.icon || ''} ${cat.name}`;
      select.appendChild(option);
    });
  }

  // Public API
  return {
    load: load,
    save: save,
    getAll: getAll,
    getDefaults: getDefaults,
    getCustom: getCustom,
    getById: getById,
    add: add,
    update: update,
    remove: remove,
    openManager: openManager,
    closeManager: closeManager,
    renderManagerList: renderManagerList,
    openEditDialog: openEditDialog,
    closeEditDialog: closeEditDialog,
    saveFromDialog: saveFromDialog,
    refreshUI: refreshUI,
    updateCategorySelect: updateCategorySelect,
    CUSTOM_ID_START: CUSTOM_ID_START
  };
})();
