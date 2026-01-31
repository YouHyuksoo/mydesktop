/**
 * @file js/events.js
 * @description 이벤트 핸들러 - 터치, 마우스, 키보드 이벤트 및 컬러 피커
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 사용자 입력 이벤트 처리 함수들
 * 2. **사용 방법**: App.Events.initEventListeners()로 초기화
 * 3. **의존성**: App.State, App.UI, App.Config, gsap 라이브러리
 */

(function() {
  'use strict';

  // App 네임스페이스 확인
  window.App = window.App || {};

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

    // 터널 링에 펄스 효과 (App.Space 모듈 사용)
    if (App.Space && App.Space.pulseRings) {
      App.Space.pulseRings();
    }

    // 정리
    setTimeout(() => {
      ripple.remove();
      burst.remove();
    }, 1000);
  }

  // ===== 바로가기 관리 함수들 =====

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
   */
  function deleteShortcut(id) {
    if (confirm('삭제할까요?')) {
      App.State.shortcuts = App.State.shortcuts.filter(x => x.id !== id);
      App.saveShortcuts();
      App.Cards.renderCards();
      App.UI.closeModal();
      App.showToast('삭제 완료!');
    }
  }

  /**
   * 프로토콜 URL 복사
   */
  function copyProtocolUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      App.showToast('URL 복사됨!');
    }).catch(() => {
      App.showToast('복사 실패');
    });
    App.UI.hideSettingsMenu();
  }

  /**
   * 바로가기 초기화
   */
  function resetShortcuts() {
    if (confirm('모든 바로가기를 초기화할까요?')) {
      App.State.shortcuts = App.Storage.resetShortcuts();
      App.Cards.renderCards();
      App.showToast('초기화 완료!');
    }
    App.UI.hideSettingsMenu();
  }

  /**
   * 아이콘 색상 모드 전환
   */
  function toggleIconColor() {
    App.State.iconColorMode = App.State.iconColorMode === 'brand' ? 'white' : 'brand';
    App.saveSettings();
    App.Cards.renderCards();
    App.UI.updateIconColorLabel();
    App.showToast(App.State.iconColorMode === 'brand' ? '🎨 브랜드 색상' : '⚪ 흰색 아이콘');
    App.UI.hideSettingsMenu();
  }

  /**
   * 공간 타입 전환
   */
  function changeSpaceType() {
    const newType = App.State.spaceType === 'tunnel' ? 'warp' : 'tunnel';
    App.State.spaceType = newType;
    App.saveSettings();

    App.Space.clearSpace();
    if (newType === 'warp') {
      App.Space.createCosmicWarp();
    } else {
      App.Space.createTunnel();
    }

    App.UI.updateSpaceMenu();
    App.showToast(newType === 'warp' ? '🌌 코스믹 워프' : '🔺 클래식 터널');
    App.UI.hideSettingsMenu();
  }

  /**
   * 터널 모양 변경
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
      apple: '🍎 애플'
    };
    App.showToast(styleNames[style] || style);
  }

  /**
   * 모든 이벤트 리스너 초기화
   */
  function initEventListeners() {
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

        // Shift 휠에서는 섹션 이동 안함
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
      // 초기 아이콘 설정
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
      saveShortcut();
    });
    document.getElementById('modal-delete').addEventListener('click', () => {
      if (App.State.editingId) {
        deleteShortcut(App.State.editingId);
      }
    });
    document.getElementById('shortcut-modal').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) App.UI.closeModal();
    });

    // ===== 컨텍스트 메뉴 =====
    document.getElementById('ctx-edit').addEventListener('click', () => {
      if (App.State.contextTargetId) App.UI.openModal(App.State.contextTargetId);
      App.UI.hideContextMenu();
    });
    document.getElementById('ctx-delete').addEventListener('click', () => {
      if (App.State.contextTargetId) {
        deleteShortcut(App.State.contextTargetId);
      }
      App.UI.hideContextMenu();
    });
    document.addEventListener('click', App.UI.hideContextMenu);

    // ===== 키보드 이벤트 =====
    document.addEventListener('keydown', e => {
      // 검색창에 포커스 중이면 무시
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
        // CENTER 레인: 좌우 키는 레인 전환
        if (App.State.currentLane === 0) {
          if (e.key === 'ArrowLeft' && App.Lanes) {
            App.Lanes.goToLane(-1); // LEFT 레인으로
          }
          if (e.key === 'ArrowRight' && App.Lanes) {
            App.Lanes.goToLane(1); // RIGHT 레인으로
          }
          if (e.key === 'ArrowUp' && App.Sections) {
            App.Sections.goToSection(App.State.currentSection - 1);
          }
          if (e.key === 'ArrowDown' && App.Sections) {
            App.Sections.goToSection(App.State.currentSection + 1);
          }
        }
        // LEFT 또는 RIGHT 레인: 좌우 키로 CENTER로 복귀
        else {
          if (e.key === 'ArrowLeft' && App.State.currentLane === 1 && App.Lanes) {
            App.Lanes.goToLane(0); // RIGHT에서 CENTER로
          }
          if (e.key === 'ArrowRight' && App.State.currentLane === -1 && App.Lanes) {
            App.Lanes.goToLane(0); // LEFT에서 CENTER로
          }
        }
      }

      if (e.key === 'Escape') {
        // Escape로 CENTER 레인으로 복귀
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
    document.getElementById('menu-protocol').addEventListener('click', () => {
      copyProtocolUrl();
    });
    document.getElementById('menu-reset').addEventListener('click', () => {
      resetShortcuts();
    });
    document.getElementById('menu-icon-color').addEventListener('click', () => {
      toggleIconColor();
    });

    // ===== 카테고리 관리 =====
    document.getElementById('menu-categories').addEventListener('click', () => {
      App.UI.hideSettingsMenu();
      if (App.Categories) App.Categories.openManager();
    });

    document.getElementById('category-modal-close').addEventListener('click', () => {
      if (App.Categories) App.Categories.closeManager();
    });

    document.getElementById('category-modal').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) {
        if (App.Categories) App.Categories.closeManager();
      }
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
      if (e.target.classList.contains('modal-overlay')) {
        if (App.Categories) App.Categories.closeEditDialog();
      }
    });

    // ===== 북마크 가져오기 =====
    document.getElementById('menu-import').addEventListener('click', () => {
      App.UI.hideSettingsMenu();
      if (App.Bookmarks) App.Bookmarks.openImportModal();
    });

    document.getElementById('import-modal').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) {
        if (App.Bookmarks) App.Bookmarks.closeImportModal();
      }
    });

    // ===== 공간 타입 토글 버튼 =====
    const spaceToggleBtn = document.getElementById('space-toggle-btn');
    if (spaceToggleBtn) {
      spaceToggleBtn.addEventListener('click', () => {
        changeSpaceType();
        updateSpaceToggleIcon();
      });
      // 초기 아이콘 설정
      updateSpaceToggleIcon();
    }

    function updateSpaceToggleIcon() {
      const tunnelIcon = document.getElementById('space-icon-tunnel');
      const warpIcon = document.getElementById('space-icon-warp');
      if (tunnelIcon && warpIcon) {
        if (App.State.spaceType === 'tunnel') {
          tunnelIcon.style.display = 'block';
          warpIcon.style.display = 'none';
        } else {
          tunnelIcon.style.display = 'none';
          warpIcon.style.display = 'block';
        }
      }
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
        changeTunnelShape(opt.dataset.shape);
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
        changeCardStyle(opt.dataset.style);
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
        // 별 애니메이션
        if (App.Effects && App.Effects.createStarFlyby) {
          App.Effects.createStarFlyby();
        }
        // YouTube Music 바로 재생
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
    initGridScrollControls();
  }

  /**
   * 그리드 스크롤 컨트롤 초기화
   */
  function initGridScrollControls() {
    const scrollUpBtn = document.getElementById('grid-scroll-up');
    const scrollDownBtn = document.getElementById('grid-scroll-down');
    const scrollControls = document.getElementById('grid-scroll-controls');

    if (!scrollUpBtn || !scrollDownBtn) return;

    const SCROLL_AMOUNT = 200; // 한 번 클릭 시 스크롤량

    scrollUpBtn.addEventListener('click', () => {
      const activeSection = document.querySelector('.section-cards.active');
      if (activeSection) {
        activeSection.scrollBy({ top: -SCROLL_AMOUNT, behavior: 'smooth' });
        setTimeout(() => updateGridScrollButtons(), 300);
      }
    });

    scrollDownBtn.addEventListener('click', () => {
      const activeSection = document.querySelector('.section-cards.active');
      if (activeSection) {
        activeSection.scrollBy({ top: SCROLL_AMOUNT, behavior: 'smooth' });
        setTimeout(() => updateGridScrollButtons(), 300);
      }
    });

    // 스크롤 이벤트로 버튼 상태 업데이트
    document.addEventListener('scroll', (e) => {
      if (e.target.classList && e.target.classList.contains('section-cards')) {
        updateGridScrollButtons();
      }
    }, true);
  }

  /**
   * 그리드 스크롤 버튼 상태 업데이트
   */
  function updateGridScrollButtons() {
    const scrollControls = document.getElementById('grid-scroll-controls');
    const scrollUpBtn = document.getElementById('grid-scroll-up');
    const scrollDownBtn = document.getElementById('grid-scroll-down');
    const activeSection = document.querySelector('.section-cards.active');

    if (!scrollControls || !activeSection) return;

    // 캐러셀 모드면 숨김
    if (App.State.cardLayout === 'carousel') {
      scrollControls.classList.remove('visible');
      return;
    }

    // 스크롤 가능 여부 확인
    const isScrollable = activeSection.scrollHeight > activeSection.clientHeight;

    if (isScrollable) {
      scrollControls.classList.add('visible');
      activeSection.classList.add('grid-scrollable');

      // 위쪽 스크롤 가능 여부
      scrollUpBtn.disabled = activeSection.scrollTop <= 0;

      // 아래쪽 스크롤 가능 여부
      const maxScroll = activeSection.scrollHeight - activeSection.clientHeight;
      scrollDownBtn.disabled = activeSection.scrollTop >= maxScroll - 1;
    } else {
      scrollControls.classList.remove('visible');
      activeSection.classList.remove('grid-scrollable');
    }
  }

  // App.Events로 export
  App.Events = {
    initEventListeners: initEventListeners,
    initColorPicker: initColorPicker,
    createClickEffect: createClickEffect,
    updateGridScrollButtons: updateGridScrollButtons
  };

})();
