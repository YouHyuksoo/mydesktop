/**
 * @file js/handlers/index.js
 * @description 이벤트 핸들러 통합 - 모든 입력 이벤트 초기화
 *
 * 초보자 가이드:
 * 1. 이 파일은 모든 핸들러 모듈을 통합
 * 2. App.Events.initEventListeners()로 모든 이벤트 시작
 *
 * 모듈 목록:
 * - shortcut-crud.js    : 바로가기 CRUD
 * - protocol-handler.js : 프로토콜/북마클릿
 * - data-io.js          : 데이터 내보내기/가져오기
 * - settings-handler.js : 설정 변경
 * - grid-scroll.js      : 그리드 스크롤
 */

window.App = window.App || {};

(function() {
  'use strict';

  /**
   * 컬러 피커 초기화
   */
  function initColorPicker() {
    const picker = document.getElementById('color-picker');
    App.Config.COLORS.forEach(color => {
      const opt = document.createElement('div');
      opt.className = 'color-option' + (color === App.State.selectedColor ? ' selected' : '');
      opt.style.background = color;
      opt.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
        opt.classList.add('selected');
        App.State.selectedColor = color;
      });
      picker.appendChild(opt);
    });
  }

  /**
   * 클릭 이펙트 생성 (배경 클릭 시)
   * @param {number} x - 클릭 X 좌표
   * @param {number} y - 클릭 Y 좌표
   */
  function createClickEffect(x, y) {
    // 조명 강도 최대로
    App.State.glowIntensity = 1.5;

    // 리플 이펙트
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '600px';
    ripple.style.height = '600px';
    document.body.appendChild(ripple);

    // 파티클 버스트
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    document.body.appendChild(burst);

    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;
      const duration = 0.6 + Math.random() * 0.4;

      particle.style.left = '0px';
      particle.style.top = '0px';

      burst.appendChild(particle);

      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: duration,
        ease: 'power2.out'
      });
    }

    // 터널 링에 펄스 효과
    if (App.Space && App.Space.pulseRings) {
      App.Space.pulseRings();
    }

    // 정리
    setTimeout(() => {
      ripple.remove();
      burst.remove();
    }, 1000);
  }

  /**
   * 모든 이벤트 리스너 초기화
   */
  function initEventListeners() {
    const H = App.Handlers;

    // ===== 휠 이벤트 =====
    let wheelAccumulator = 0;
    let wheelTimeout;
    let lastWheelTime = 0;
    const WHEEL_THRESHOLD = 150;
    const WHEEL_DECAY = 0.92;

    function decayWheelAccumulator() {
      if (Math.abs(wheelAccumulator) > 1) {
        wheelAccumulator *= WHEEL_DECAY;
        requestAnimationFrame(decayWheelAccumulator);
      } else {
        wheelAccumulator = 0;
      }
    }

    // Shift+휠로 레인 전환을 위한 변수
    let laneWheelAccumulator = 0;
    const LANE_WHEEL_THRESHOLD = 100;

    window.addEventListener('wheel', e => {
      const now = Date.now();
      const timeDelta = now - lastWheelTime;
      lastWheelTime = now;

      // Shift+휠: 레인 전환 (X축)
      if (e.shiftKey) {
        if (!App.State.isLaneTransitioning && App.Lanes) {
          laneWheelAccumulator += e.deltaY * 0.8;

          if (laneWheelAccumulator > LANE_WHEEL_THRESHOLD) {
            App.Lanes.goToLane(App.State.currentLane + 1);
            laneWheelAccumulator = 0;
          } else if (laneWheelAccumulator < -LANE_WHEEL_THRESHOLD) {
            App.Lanes.goToLane(App.State.currentLane - 1);
            laneWheelAccumulator = 0;
          }
        }

        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          laneWheelAccumulator = 0;
        }, 150);
        return;
      }

      // CENTER 레인이 아니면 휠로 섹션 이동 안함
      if (App.State.currentLane !== 0) return;

      // 터널 움직임 효과
      const speedMultiplier = Math.min(Math.abs(e.deltaY) / 50, 1);
      App.State.targetSpeed = (e.deltaY > 0 ? 8 : -8) * speedMultiplier;

      // 몽환적 조명 반응
      App.State.glowIntensity = Math.min(1, App.State.glowIntensity + Math.abs(e.deltaY) * 0.005);

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        App.State.targetSpeed = 0;
        decayWheelAccumulator();
      }, 150);

      // 섹션 이동 - 누적 방식
      if (!App.State.isTransitioning) {
        if (timeDelta < 200) {
          wheelAccumulator += e.deltaY * 0.5;
        } else {
          wheelAccumulator = e.deltaY * 0.8;
        }

        if (wheelAccumulator > WHEEL_THRESHOLD) {
          if (App.Sections && App.Sections.goToSection) {
            App.Sections.goToSection(App.State.currentSection + 1);
          }
          wheelAccumulator = 0;
        } else if (wheelAccumulator < -WHEEL_THRESHOLD) {
          if (App.Sections && App.Sections.goToSection) {
            App.Sections.goToSection(App.State.currentSection - 1);
          }
          wheelAccumulator = 0;
        }
      }
    }, { passive: true });

    // ===== 리사이즈 이벤트 =====
    window.addEventListener('resize', () => {
      if (App.State.camera && App.State.renderer) {
        App.State.camera.aspect = window.innerWidth / window.innerHeight;
        App.State.camera.updateProjectionMatrix();
        App.State.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });

    // ===== 터치 이벤트 =====
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;
    let touchOnCard = false;

    document.addEventListener('touchstart', e => {
      if (e.target.closest('.floating-btn') ||
          e.target.closest('#settings-menu') ||
          e.target.closest('#tunnel-submenu') ||
          e.target.closest('.modal-overlay') ||
          e.target.closest('.carousel-dots')) return;

      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      touchOnCard = !!e.target.closest('.shortcut-card');
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (touchStartY === 0) return;
      if (touchOnCard) return;

      const deltaY = touchStartY - e.touches[0].clientY;
      App.State.targetSpeed = deltaY * 0.1;
      App.State.glowIntensity = Math.min(1, App.State.glowIntensity + Math.abs(deltaY) * 0.002);
    }, { passive: true });

    document.addEventListener('touchend', e => {
      if (touchStartY === 0) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;
      const deltaTime = Date.now() - touchStartTime;
      const isMobile = window.innerWidth <= 768;

      // 모바일 세로 캐러셀
      if (App.State.cardLayout === 'carousel' && isMobile) {
        if (touchOnCard && Math.abs(deltaY) > 50) {
          if (deltaY > 0 && App.Carousel) App.Carousel.carouselNext();
          else if (App.Carousel) App.Carousel.carouselPrev();
        } else if (!touchOnCard && Math.abs(deltaY) > 50) {
          const velocity = Math.abs(deltaY) / deltaTime;
          if (velocity > 0.3 || Math.abs(deltaY) > 100) {
            if (deltaY > 0 && App.Sections) App.Sections.goToSection(App.State.currentSection + 1);
            else if (App.Sections) App.Sections.goToSection(App.State.currentSection - 1);
          }
        }
      }
      // 데스크톱 캐러셀
      else if (App.State.cardLayout === 'carousel' && !isMobile) {
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0 && App.Carousel) App.Carousel.carouselNext();
          else if (App.Carousel) App.Carousel.carouselPrev();
        }
      }
      // 그리드 모드
      else if (App.State.cardLayout === 'grid') {
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
          const velocity = Math.abs(deltaY) / deltaTime;
          if (velocity > 0.3 || Math.abs(deltaY) > 100) {
            if (deltaY > 0 && App.Sections) App.Sections.goToSection(App.State.currentSection + 1);
            else if (App.Sections) App.Sections.goToSection(App.State.currentSection - 1);
          }
        }
      }

      touchStartY = 0;
      touchStartX = 0;
      touchOnCard = false;
      App.State.targetSpeed = 0;
    }, { passive: true });

    // ===== 카드 레이아웃 토글 버튼 =====
    const layoutToggleBtn = document.getElementById('layout-toggle-btn');
    if (layoutToggleBtn) {
      layoutToggleBtn.addEventListener('click', () => {
        const newLayout = App.State.cardLayout === 'grid' ? 'carousel' : 'grid';
        if (App.Carousel && App.Carousel.changeCardLayout) {
          App.Carousel.changeCardLayout(newLayout);
        }
        updateLayoutToggleIcon();
      });
      updateLayoutToggleIcon();
    }

    function updateLayoutToggleIcon() {
      const gridIcon = document.getElementById('layout-icon-grid');
      const carouselIcon = document.getElementById('layout-icon-carousel');
      if (gridIcon && carouselIcon) {
        if (App.State.cardLayout === 'grid') {
          gridIcon.style.display = 'block';
          carouselIcon.style.display = 'none';
        } else {
          gridIcon.style.display = 'none';
          carouselIcon.style.display = 'block';
        }
      }
    }

    // ===== 추가 버튼 =====
    document.getElementById('add-btn').addEventListener('click', () => App.UI.openModal());

    // ===== 모달 이벤트 =====
    document.getElementById('modal-cancel').addEventListener('click', App.UI.closeModal);
    document.getElementById('modal-save').addEventListener('click', () => {
      H.saveShortcut();
    });
    document.getElementById('modal-delete').addEventListener('click', () => {
      if (App.State.editingId) {
        H.deleteShortcut(App.State.editingId);
      }
    });

    // ===== 컨텍스트 메뉴 =====
    document.getElementById('ctx-edit').addEventListener('click', () => {
      if (App.State.contextTargetId) App.UI.openModal(App.State.contextTargetId);
      App.UI.hideContextMenu();
    });
    document.getElementById('ctx-delete').addEventListener('click', () => {
      if (App.State.contextTargetId) {
        H.deleteShortcut(App.State.contextTargetId);
      }
      App.UI.hideContextMenu();
    });
    document.addEventListener('click', App.UI.hideContextMenu);

    // ===== 키보드 이벤트 =====
    document.addEventListener('keydown', e => {
      if (document.activeElement.tagName === 'INPUT') return;

      // 캐러셀 모드
      if (App.State.cardLayout === 'carousel' && App.State.currentLane === 0) {
        if (e.key === 'ArrowLeft' && App.Carousel) App.Carousel.carouselPrev();
        if (e.key === 'ArrowRight' && App.Carousel) App.Carousel.carouselNext();
        if (e.key === 'ArrowUp' && App.Sections) App.Sections.goToSection(App.State.currentSection - 1);
        if (e.key === 'ArrowDown' && App.Sections) App.Sections.goToSection(App.State.currentSection + 1);
      }
      // 그리드 모드
      else if (App.State.cardLayout === 'grid') {
        if (App.State.currentLane === 0) {
          if (e.key === 'ArrowLeft' && App.Lanes) App.Lanes.goToLane(-1);
          if (e.key === 'ArrowRight' && App.Lanes) App.Lanes.goToLane(1);
          if (e.key === 'ArrowUp' && App.Sections) App.Sections.goToSection(App.State.currentSection - 1);
          if (e.key === 'ArrowDown' && App.Sections) App.Sections.goToSection(App.State.currentSection + 1);
        } else {
          if (e.key === 'ArrowLeft' && App.State.currentLane === 1 && App.Lanes) App.Lanes.goToLane(0);
          if (e.key === 'ArrowRight' && App.State.currentLane === -1 && App.Lanes) App.Lanes.goToLane(0);
        }
      }

      if (e.key === 'Escape') {
        if (App.State.currentLane !== 0 && App.Lanes) {
          App.Lanes.goToLane(0);
          return;
        }
        App.UI.closeModal();
        App.UI.hideContextMenu();
        App.UI.hideSettingsMenu();
      }
    });

    // ===== 설정 메뉴 =====
    document.getElementById('settings-btn').addEventListener('click', e => {
      e.stopPropagation();
      App.UI.toggleSettingsMenu();
    });
    document.getElementById('menu-protocol').addEventListener('click', () => H.openProtocolModal());
    document.getElementById('menu-export').addEventListener('click', () => H.exportData());
    document.getElementById('menu-restore').addEventListener('click', () => H.importData());

    // 프로토콜 모달
    document.getElementById('protocol-modal-close').addEventListener('click', () => H.closeProtocolModal());
    document.getElementById('protocol-modal').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) H.closeProtocolModal();
    });
    document.getElementById('protocol-base-url').addEventListener('input', e => {
      const url = e.target.value.trim();
      const bookmarkletContainer = document.getElementById('bookmarklet-container');
      if (url && url.startsWith('http')) {
        H.updateBookmarklet(url);
        bookmarkletContainer.style.display = 'block';
      } else {
        bookmarkletContainer.style.display = 'none';
      }
    });
    document.getElementById('copy-bookmarklet-btn').addEventListener('click', () => H.copyBookmarkletCode());

    // ===== 아이콘 색상 토글 버튼 =====
    const iconColorToggleBtn = document.getElementById('icon-color-toggle-btn');
    if (iconColorToggleBtn) {
      iconColorToggleBtn.addEventListener('click', () => {
        H.toggleIconColor();
        updateIconColorToggleBtn();
      });
      updateIconColorToggleBtn();
    }

    function updateIconColorToggleBtn() {
      const brandIcon = document.getElementById('icon-color-brand');
      const whiteIcon = document.getElementById('icon-color-white');
      if (brandIcon && whiteIcon) {
        if (App.State.iconColorMode === 'brand') {
          brandIcon.style.display = 'block';
          whiteIcon.style.display = 'none';
        } else {
          brandIcon.style.display = 'none';
          whiteIcon.style.display = 'block';
        }
      }
    }

    // ===== 카테고리 관리 =====
    document.getElementById('menu-categories').addEventListener('click', () => {
      App.UI.hideSettingsMenu();
      if (App.Categories) App.Categories.openManager();
    });
    document.getElementById('category-modal-close').addEventListener('click', () => {
      if (App.Categories) App.Categories.closeManager();
    });
    document.getElementById('category-modal').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay') && App.Categories) App.Categories.closeManager();
    });
    document.getElementById('add-category-btn').addEventListener('click', () => {
      if (App.Categories) App.Categories.openEditDialog();
    });
    document.getElementById('category-edit-cancel').addEventListener('click', () => {
      if (App.Categories) App.Categories.closeEditDialog();
    });
    document.getElementById('category-edit-save').addEventListener('click', () => {
      if (App.Categories) App.Categories.saveFromDialog();
    });
    document.getElementById('category-edit-dialog').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay') && App.Categories) App.Categories.closeEditDialog();
    });

    // ===== 북마크 가져오기 =====
    document.getElementById('menu-import').addEventListener('click', () => {
      App.UI.hideSettingsMenu();
      if (App.Bookmarks) App.Bookmarks.openImportModal();
    });
    document.getElementById('import-modal').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay') && App.Bookmarks) App.Bookmarks.closeImportModal();
    });

    // ===== 공간 타입 토글 버튼 =====
    const spaceToggleBtn = document.getElementById('space-toggle-btn');
    if (spaceToggleBtn) {
      spaceToggleBtn.addEventListener('click', () => {
        H.changeSpaceType();
        updateSpaceToggleIcon();
      });
      updateSpaceToggleIcon();
    }

    function updateSpaceToggleIcon() {
      const tunnelIcon = document.getElementById('space-icon-tunnel');
      const warpIcon = document.getElementById('space-icon-warp');
      const auroraIcon = document.getElementById('space-icon-aurora');

      if (tunnelIcon) tunnelIcon.style.display = 'none';
      if (warpIcon) warpIcon.style.display = 'none';
      if (auroraIcon) auroraIcon.style.display = 'none';

      if (App.State.spaceType === 'tunnel' && tunnelIcon) tunnelIcon.style.display = 'block';
      else if (App.State.spaceType === 'warp' && warpIcon) warpIcon.style.display = 'block';
      else if (App.State.spaceType === 'aurora' && auroraIcon) auroraIcon.style.display = 'block';
    }

    // ===== 터널 서브메뉴 =====
    document.getElementById('menu-tunnel').addEventListener('click', e => {
      e.stopPropagation();
      App.UI.hideCardStyleSubmenu();
      App.UI.toggleTunnelSubmenu();
    });
    document.querySelectorAll('.tunnel-option').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        H.changeTunnelShape(opt.dataset.shape);
      });
    });

    // ===== 카드 스타일 서브메뉴 =====
    document.getElementById('menu-card-style').addEventListener('click', e => {
      e.stopPropagation();
      App.UI.hideTunnelSubmenu();
      App.UI.toggleCardStyleSubmenu();
    });
    document.querySelectorAll('.card-style-option').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        H.changeCardStyle(opt.dataset.style);
      });
    });

    // ===== 바깥 클릭 시 메뉴 닫기 =====
    document.addEventListener('click', e => {
      if (!e.target.closest('#settings-menu') &&
          !e.target.closest('#settings-btn') &&
          !e.target.closest('#tunnel-submenu') &&
          !e.target.closest('#card-style-submenu')) {
        App.UI.hideSettingsMenu();
        App.UI.hideTunnelSubmenu();
        App.UI.hideCardStyleSubmenu();
      }
    });

    // ===== 아바타 클릭 시 YouTube Music 재생 =====
    const creditsAvatar = document.querySelector('.credits-avatar');
    if (creditsAvatar) {
      creditsAvatar.addEventListener('click', e => {
        e.stopPropagation();
        if (App.Effects && App.Effects.createStarFlyby) App.Effects.createStarFlyby();
        window.open('https://music.youtube.com/watch?v=304DNFmHN5U', '_blank');
      });
      creditsAvatar.style.cursor = 'pointer';
    }

    // ===== 컬러 바 =====
    document.querySelectorAll('.color-bar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.UI.applyGlowTheme(btn.dataset.theme);
        App.State.glowIntensity = 1;
      });
    });

    // ===== 배경 클릭 이펙트 =====
    document.addEventListener('click', e => {
      if (!e.target.closest('.shortcut-card') &&
          !e.target.closest('.floating-btn') &&
          !e.target.closest('#settings-menu') &&
          !e.target.closest('#tunnel-submenu') &&
          !e.target.closest('#color-bar') &&
          !e.target.closest('.modal-overlay') &&
          !e.target.closest('#context-menu') &&
          !e.target.closest('.depth-dot') &&
          !e.target.closest('#grid-scroll-controls')) {
        createClickEffect(e.clientX, e.clientY);
      }
    });

    // ===== 그리드 스크롤 버튼 =====
    H.initGridScrollControls();

    // ===== 이스터에그 테스트 버튼 =====
    const dragonTestBtn = document.getElementById('dragon-test-btn');
    if (dragonTestBtn) {
      dragonTestBtn.addEventListener('click', () => {
        if (App.Effects && App.Effects.createDragonAttack) App.Effects.createDragonAttack();
      });
    }

    const wolfTestBtn = document.getElementById('wolf-test-btn');
    if (wolfTestBtn) {
      wolfTestBtn.addEventListener('click', () => {
        if (App.Effects && App.Effects.createWolfAppear) App.Effects.createWolfAppear();
      });
    }

    const meteorTestBtn = document.getElementById('meteor-test-btn');
    if (meteorTestBtn) {
      meteorTestBtn.addEventListener('click', () => {
        if (App.Effects && App.Effects.createMeteorImpact) App.Effects.createMeteorImpact();
      });
    }

    // ===== 모바일 인디케이터 토글 =====
    // 왼쪽 사이드바 인디케이터
    const leftSidebarIndicator = document.getElementById('left-sidebar-indicator');
    const leftSidebarContainer = document.getElementById('left-sidebar-container');
    if (leftSidebarIndicator && leftSidebarContainer) {
      leftSidebarIndicator.addEventListener('click', e => {
        e.stopPropagation();
        leftSidebarContainer.classList.toggle('menu-open');
      });

      // 바깥 클릭 시 닫기
      document.addEventListener('click', e => {
        if (!e.target.closest('#left-sidebar-container')) {
          leftSidebarContainer.classList.remove('menu-open');
        }
      });
    }

    // 이스터에그 인디케이터 (모바일 터치용)
    const easterEggIndicator = document.getElementById('easter-egg-indicator');
    const easterEggContainer = document.getElementById('easter-egg-container');
    if (easterEggIndicator && easterEggContainer) {
      easterEggIndicator.addEventListener('click', e => {
        e.stopPropagation();
        easterEggContainer.classList.toggle('show-buttons');
      });

      // 바깥 클릭 시 닫기
      document.addEventListener('click', e => {
        if (!e.target.closest('#easter-egg-container')) {
          easterEggContainer.classList.remove('show-buttons');
        }
      });
    }
  }

  // App.Events로 export (기존 API 유지)
  App.Events = {
    initEventListeners: initEventListeners,
    initColorPicker: initColorPicker,
    createClickEffect: createClickEffect,
    updateGridScrollButtons: App.Handlers.updateGridScrollButtons,
    handleUrlParams: App.Handlers.handleUrlParams
  };
})();
