/**
 * @file js/ui.js
 * @description UI 관련 함수들 - 모달, 토스트, 컨텍스트 메뉴, 설정 메뉴 등
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 사용자 인터페이스 조작 함수들
 * 2. **사용 방법**: App.UI.openModal(), App.UI.showToast() 등으로 호출
 * 3. **의존성**: App 네임스페이스, App.State, App.Config가 필요
 */

(function() {
  'use strict';

  // App 네임스페이스 확인
  window.App = window.App || {};

  /**
   * 모달 열기
   * @param {string|null} id - 수정할 바로가기 ID (null이면 새로 추가)
   */
  function openModal(id = null) {
    App.State.editingId = id;
    const modal = document.getElementById('shortcut-modal');
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('modal-delete');

    // 카테고리 셀렉트 업데이트
    if (App.Categories && App.Categories.updateCategorySelect) {
      App.Categories.updateCategorySelect();
    }

    if (id) {
      const s = App.State.shortcuts.find(x => x.id === id);
      if (s) {
        title.textContent = 'Edit Shortcut';
        document.getElementById('shortcut-title').value = s.title;
        document.getElementById('shortcut-url').value = s.url;
        document.getElementById('shortcut-layer').value = s.layer;
        document.getElementById('shortcut-icon').value = s.icon || '';
        App.State.selectedColor = s.color;
        deleteBtn.style.display = 'block';
      }
    } else {
      title.textContent = 'Add Shortcut';
      document.getElementById('shortcut-title').value = '';
      document.getElementById('shortcut-url').value = '';
      // 현재 섹션의 카테고리 ID로 설정
      const sections = App.Categories ? App.Categories.getAll() : App.Config.SECTIONS;
      const currentCategory = sections[App.State.currentSection];
      document.getElementById('shortcut-layer').value = currentCategory ? currentCategory.id : 0;
      document.getElementById('shortcut-icon').value = '';
      App.State.selectedColor = App.Config.COLORS[0];
      deleteBtn.style.display = 'none';
    }

    document.querySelectorAll('.color-option').forEach(opt => {
      opt.classList.toggle('selected', opt.style.background === App.State.selectedColor);
    });

    modal.classList.add('active');
  }

  /**
   * 모달 닫기
   */
  function closeModal() {
    document.getElementById('shortcut-modal').classList.remove('active');
    App.State.editingId = null;
  }

  /**
   * 토스트 메시지 표시
   * @param {string} message - 표시할 메시지
   */
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2000);
  }

  /**
   * 컨텍스트 메뉴 표시
   * @param {MouseEvent} e - 마우스 이벤트
   * @param {string} id - 대상 바로가기 ID
   */
  function showContextMenu(e, id) {
    const menu = document.getElementById('context-menu');
    App.State.contextTargetId = id;
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.add('active');
  }

  /**
   * 컨텍스트 메뉴 숨기기
   */
  function hideContextMenu() {
    document.getElementById('context-menu').classList.remove('active');
  }

  /**
   * 설정 메뉴 토글
   */
  function toggleSettingsMenu() {
    document.getElementById('settings-menu').classList.toggle('active');
  }

  /**
   * 설정 메뉴 숨기기
   */
  function hideSettingsMenu() {
    document.getElementById('settings-menu').classList.remove('active');
  }

  /**
   * 터널 서브메뉴 표시
   */
  function showTunnelSubmenu() {
    document.getElementById('tunnel-submenu').classList.add('active');
  }

  /**
   * 터널 서브메뉴 숨기기
   */
  function hideTunnelSubmenu() {
    document.getElementById('tunnel-submenu').classList.remove('active');
  }

  /**
   * 터널 서브메뉴 토글
   */
  function toggleTunnelSubmenu() {
    document.getElementById('tunnel-submenu').classList.toggle('active');
  }

  /**
   * 카드 스타일 서브메뉴 표시
   */
  function showCardStyleSubmenu() {
    document.getElementById('card-style-submenu').classList.add('active');
  }

  /**
   * 카드 스타일 서브메뉴 숨기기
   */
  function hideCardStyleSubmenu() {
    document.getElementById('card-style-submenu').classList.remove('active');
  }

  /**
   * 카드 스타일 서브메뉴 토글
   */
  function toggleCardStyleSubmenu() {
    document.getElementById('card-style-submenu').classList.toggle('active');
  }

  /**
   * 터널 메뉴 업데이트 (현재 선택된 모양 표시)
   */
  function updateTunnelMenu() {
    document.querySelectorAll('.tunnel-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.shape === App.State.tunnelShape);
    });
  }

  /**
   * 공간 타입 메뉴 레이블 업데이트
   */
  function updateSpaceMenu() {
    const label = document.getElementById('space-type-label');
    if (label) {
      label.textContent = App.State.spaceType === 'warp' ? '공간: 코스믹 워프' : '공간: 클래식 터널';
    }
  }

  /**
   * 카드 스타일 메뉴 업데이트
   */
  function updateCardStyleMenu() {
    document.querySelectorAll('.card-style-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.style === App.State.cardStyle);
    });
  }

  /**
   * 아이콘 색상 레이블 업데이트
   */
  function updateIconColorLabel() {
    const label = document.getElementById('icon-color-label');
    label.textContent = App.State.iconColorMode === 'brand' ? '아이콘: 브랜드 색상' : '아이콘: 흰색';
  }

  /**
   * 카드 레이아웃 레이블 업데이트
   */
  function updateCardLayoutLabel() {
    const label = document.getElementById('card-layout-label');
    if (label) {
      label.textContent = App.State.cardLayout === 'carousel' ? '배치: 캐러셀' : '배치: 그리드';
    }
  }

  /**
   * 초기 등장 애니메이션
   */
  function animateEntrance() {
    gsap.fromTo('#section-info',
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    );
    gsap.fromTo('#clock-widget',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6 }
    );
    gsap.fromTo('.depth-dot',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.3 }
    );
    gsap.fromTo('.bottom-buttons',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, delay: 0.5, ease: 'back.out(1.7)' }
    );

    // 현재 섹션 카드들 등장 애니메이션
    const activeSection = document.querySelector('.section-cards.active');
    if (activeSection) {
      const cards = activeSection.querySelectorAll('.shortcut-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { scale: 0.3, opacity: 0, z: -200 },
          { scale: 1, opacity: 1, z: 0, duration: 0.6, delay: 0.2 + i * 0.08, ease: 'back.out(1.7)' }
        );
      });
    }
  }

  /**
   * 캐러셀 UI 업데이트
   */
  function updateCarouselUI() {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection) return;

    const cards = activeSection.querySelectorAll('.shortcut-card');
    const dotsContainer = document.getElementById('carousel-dots');

    // 점 인디케이터만 표시
    dotsContainer.classList.add('visible');

    // 점 생성
    dotsContainer.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === App.State.carouselIndex ? ' active' : '');
      dot.addEventListener('click', () => {
        if (App.Carousel && App.Carousel.goToIndex) {
          App.Carousel.goToIndex(i);
        }
      });
      dotsContainer.appendChild(dot);
    });
  }

  /**
   * 캐러셀 UI 숨기기
   */
  function hideCarouselUI() {
    document.getElementById('carousel-dots').classList.remove('visible');
  }

  /**
   * 글로우 테마 적용
   * @param {string} themeName - 테마 이름 (gold, purple, cyan 등)
   */
  function applyGlowTheme(themeName) {
    const theme = App.Config.GLOW_THEMES[themeName];
    if (!theme) return;

    // CSS 변수 업데이트
    document.documentElement.style.setProperty('--accent', theme.primary);
    document.documentElement.style.setProperty('--accent2', theme.secondary);

    // 글로우 오브 색상 변경
    const orbs = document.querySelectorAll('.glow-orb');
    orbs.forEach((orb, i) => {
      if (theme.orbs[i]) {
        gsap.to(orb, {
          background: `radial-gradient(circle, ${theme.orbs[i]} 0%, transparent 70%)`,
          duration: 0.5
        });
      }
    });

    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.color-bar-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeName);
    });

    // 상태 저장
    App.State.glowTheme = themeName;
    if (App.saveSettings) {
      App.saveSettings();
    }
  }

  // App.UI로 export
  App.UI = {
    openModal: openModal,
    closeModal: closeModal,
    showToast: showToast,
    showContextMenu: showContextMenu,
    hideContextMenu: hideContextMenu,
    toggleSettingsMenu: toggleSettingsMenu,
    hideSettingsMenu: hideSettingsMenu,
    showTunnelSubmenu: showTunnelSubmenu,
    hideTunnelSubmenu: hideTunnelSubmenu,
    toggleTunnelSubmenu: toggleTunnelSubmenu,
    showCardStyleSubmenu: showCardStyleSubmenu,
    hideCardStyleSubmenu: hideCardStyleSubmenu,
    toggleCardStyleSubmenu: toggleCardStyleSubmenu,
    updateTunnelMenu: updateTunnelMenu,
    updateSpaceMenu: updateSpaceMenu,
    updateCardStyleMenu: updateCardStyleMenu,
    updateIconColorLabel: updateIconColorLabel,
    updateCardLayoutLabel: updateCardLayoutLabel,
    animateEntrance: animateEntrance,
    updateCarouselUI: updateCarouselUI,
    hideCarouselUI: hideCarouselUI,
    applyGlowTheme: applyGlowTheme
  };

  // 편의 alias
  App.showToast = showToast;
  App.openModal = openModal;
  App.closeModal = closeModal;

})();
