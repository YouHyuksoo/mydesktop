/**
 * @file js/storage.js
 * @description localStorage를 통한 데이터 영속화 관리
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 브라우저 localStorage를 사용해 사용자 설정과 바로가기를 저장
 * 2. **사용 방법**: App.Storage.loadShortcuts(), App.Storage.saveSettings() 등으로 호출
 * 3. **데이터 구조**:
 *    - shortcuts: 바로가기 배열 (JSON)
 *    - settings: 사용자 설정 객체 (tunnelShape, glowTheme, iconColorMode 등)
 */

// 전역 네임스페이스 초기화
window.App = window.App || {};

/**
 * 스토리지 관리 모듈
 * @namespace App.Storage
 */
App.Storage = (function() {
  'use strict';

  // localStorage 키 상수
  const KEYS = {
    SHORTCUTS: 'mydesktop-tunnel-shortcuts',
    SETTINGS: 'mydesktop-tunnel-settings',
    CATEGORIES: 'mydesktop-tunnel-categories'
  };

  /**
   * 바로가기 목록 불러오기
   * localStorage에 저장된 바로가기가 없으면 기본값 반환
   *
   * @returns {Array} 바로가기 배열
   *
   * @example
   * const shortcuts = App.Storage.loadShortcuts();
   * console.log(shortcuts[0].title); // 'Google'
   */
  function loadShortcuts() {
    try {
      const saved = localStorage.getItem(KEYS.SHORTCUTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load shortcuts:', e);
    }
    // 기본값 반환 (깊은 복사)
    return JSON.parse(JSON.stringify(App.Config.DEFAULT_SHORTCUTS));
  }

  /**
   * 바로가기 목록 저장
   *
   * @param {Array} shortcuts - 저장할 바로가기 배열
   * @returns {boolean} 저장 성공 여부
   *
   * @example
   * const shortcuts = App.Storage.loadShortcuts();
   * shortcuts.push({ id: '99', title: 'New', url: 'https://example.com', color: '#fff', layer: 0 });
   * App.Storage.saveShortcuts(shortcuts);
   */
  function saveShortcuts(shortcuts) {
    try {
      localStorage.setItem(KEYS.SHORTCUTS, JSON.stringify(shortcuts));
      return true;
    } catch (e) {
      console.error('Failed to save shortcuts:', e);
      return false;
    }
  }

  /**
   * 설정 불러오기
   * 저장된 설정이 없으면 기본값 반환
   *
   * @returns {Object} 설정 객체
   * @property {string} tunnelShape - 터널 모양 (triangle, circle, square, hexagon, star, infinity)
   * @property {string} glowTheme - 글로우 테마 (gold, purple, cyan, pink, green, red, blue, white)
   * @property {string} iconColorMode - 아이콘 색상 모드 (brand, white)
   * @property {string} cardStyle - 카드 스타일 (glass, rainbow, gradient, dark, neon, hermes, cyberpunk, apple)
   * @property {string} spaceType - 공간 타입 (tunnel, warp)
   * @property {string} cardLayout - 카드 레이아웃 (grid, carousel)
   *
   * @example
   * const settings = App.Storage.loadSettings();
   * console.log(settings.tunnelShape); // 'triangle'
   */
  function loadSettings() {
    const defaultSettings = {
      tunnelShape: 'triangle',
      glowTheme: 'gold',
      iconColorMode: 'brand',
      cardStyle: 'glass',
      spaceType: 'tunnel',
      cardLayout: 'grid'
    };

    try {
      const saved = localStorage.getItem(KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기본값과 병합 (새 설정 항목 대응)
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return defaultSettings;
  }

  /**
   * 설정 저장
   *
   * @param {Object} settings - 저장할 설정 객체
   * @returns {boolean} 저장 성공 여부
   *
   * @example
   * const settings = App.Storage.loadSettings();
   * settings.glowTheme = 'purple';
   * App.Storage.saveSettings(settings);
   */
  function saveSettings(settings) {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }

  /**
   * 바로가기 초기화 (기본값으로 복원)
   *
   * @returns {Array} 초기화된 바로가기 배열
   *
   * @example
   * const shortcuts = App.Storage.resetShortcuts();
   */
  function resetShortcuts() {
    const defaults = JSON.parse(JSON.stringify(App.Config.DEFAULT_SHORTCUTS));
    saveShortcuts(defaults);
    return defaults;
  }

  /**
   * 사용자 정의 카테고리 불러오기
   * localStorage에 저장된 카테고리가 없으면 빈 배열 반환
   *
   * @returns {Array} 사용자 정의 카테고리 배열
   */
  function loadCategories() {
    try {
      const saved = localStorage.getItem(KEYS.CATEGORIES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
    return [];
  }

  /**
   * 사용자 정의 카테고리 저장
   *
   * @param {Array} categories - 저장할 카테고리 배열
   * @returns {boolean} 저장 성공 여부
   */
  function saveCategories(categories) {
    try {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (e) {
      console.error('Failed to save categories:', e);
      return false;
    }
  }

  /**
   * 모든 데이터 삭제
   * 주의: 이 함수는 모든 저장된 데이터를 삭제합니다
   *
   * @returns {boolean} 삭제 성공 여부
   */
  function clearAll() {
    try {
      localStorage.removeItem(KEYS.SHORTCUTS);
      localStorage.removeItem(KEYS.SETTINGS);
      localStorage.removeItem(KEYS.CATEGORIES);
      return true;
    } catch (e) {
      console.error('Failed to clear storage:', e);
      return false;
    }
  }

  // Public API
  return {
    loadShortcuts: loadShortcuts,
    saveShortcuts: saveShortcuts,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    loadCategories: loadCategories,
    saveCategories: saveCategories,
    resetShortcuts: resetShortcuts,
    clearAll: clearAll,
    KEYS: KEYS
  };
})();

// 편의 alias - App.saveSettings() 같은 직접 호출 지원
App.saveSettings = function() {
  const settings = {
    tunnelShape: App.State.tunnelShape,
    glowTheme: App.State.glowTheme,
    iconColorMode: App.State.iconColorMode,
    cardStyle: App.State.cardStyle,
    spaceType: App.State.spaceType,
    cardLayout: App.State.cardLayout
  };
  return App.Storage.saveSettings(settings);
};

App.saveShortcuts = function() {
  return App.Storage.saveShortcuts(App.State.shortcuts);
};
