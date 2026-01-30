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

    // 터널 링에 펄스 효과
    if (App.State.tunnelRings) {
      App.State.tunnelRings.forEach((ring, i) => {
        const delay = i * 0.02;
        gsap.to(ring.material, {
          opacity: 1,
          duration: 0.1,
          delay: delay,
          onComplete: () => {
            gsap.to(ring.material, {
              opacity: 0.6,
              duration: 0.5
            });
          }
        });
      });
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

    window.addEventListener('wheel', e => {
      const now = Date.now();
      const timeDelta = now - lastWheelTime;
      lastWheelTime = now;

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
          if (App.Navigation && App.Navigation.goToSection) {
            App.Navigation.goToSection(App.State.currentSection + 1);
          }
          wheelAccumulator = 0;
        } else if (wheelAccumulator < -WHEEL_THRESHOLD) {
          if (App.Navigation && App.Navigation.goToSection) {
            App.Navigation.goToSection(App.State.currentSection - 1);
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
          if (deltaY > 0 && App.Carousel) App.Carousel.next();
          else if (App.Carousel) App.Carousel.prev();
        } else if (!touchOnCard && Math.abs(deltaY) > 50) {
          const velocity = Math.abs(deltaY) / deltaTime;
          if (velocity > 0.3 || Math.abs(deltaY) > 100) {
            if (deltaY > 0 && App.Navigation) App.Navigation.goToSection(App.State.currentSection + 1);
            else if (App.Navigation) App.Navigation.goToSection(App.State.currentSection - 1);
          }
        }
      }
      // 데스크톱 캐러셀
      else if (App.State.cardLayout === 'carousel' && !isMobile) {
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0 && App.Carousel) App.Carousel.next();
          else if (App.Carousel) App.Carousel.prev();
        }
      }
      // 그리드 모드
      else if (App.State.cardLayout === 'grid') {
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
          const velocity = Math.abs(deltaY) / deltaTime;
          if (velocity > 0.3 || Math.abs(deltaY) > 100) {
            if (deltaY > 0 && App.Navigation) App.Navigation.goToSection(App.State.currentSection + 1);
            else if (App.Navigation) App.Navigation.goToSection(App.State.currentSection - 1);
          }
        }
      }

      touchStartY = 0;
      touchStartX = 0;
      touchOnCard = false;
      App.State.targetSpeed = 0;
    }, { passive: true });

    // ===== 카드 레이아웃 전환 =====
    document.getElementById('menu-card-layout').addEventListener('click', e => {
      e.stopPropagation();
      const newLayout = App.State.cardLayout === 'grid' ? 'carousel' : 'grid';
      if (App.Cards && App.Cards.changeLayout) {
        App.Cards.changeLayout(newLayout);
      }
    });

    // ===== 추가 버튼 =====
    document.getElementById('add-btn').addEventListener('click', () => App.UI.openModal());

    // ===== 모달 이벤트 =====
    document.getElementById('modal-cancel').addEventListener('click', App.UI.closeModal);
    document.getElementById('modal-save').addEventListener('click', () => {
      if (App.Shortcuts && App.Shortcuts.save) {
        App.Shortcuts.save();
      }
    });
    document.getElementById('modal-delete').addEventListener('click', () => {
      if (App.State.editingId && App.Shortcuts && App.Shortcuts.delete) {
        App.Shortcuts.delete(App.State.editingId);
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
      if (App.State.contextTargetId && App.Shortcuts && App.Shortcuts.delete) {
        App.Shortcuts.delete(App.State.contextTargetId);
      }
      App.UI.hideContextMenu();
    });
    document.addEventListener('click', App.UI.hideContextMenu);

    // ===== 키보드 이벤트 =====
    document.addEventListener('keydown', e => {
      if (App.State.cardLayout === 'carousel') {
        if (e.key === 'ArrowLeft' && App.Carousel) App.Carousel.prev();
        if (e.key === 'ArrowRight' && App.Carousel) App.Carousel.next();
        if (e.key === 'ArrowUp' && App.Navigation) App.Navigation.goToSection(App.State.currentSection - 1);
        if (e.key === 'ArrowDown' && App.Navigation) App.Navigation.goToSection(App.State.currentSection + 1);
      } else {
        if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && App.Navigation) {
          App.Navigation.goToSection(App.State.currentSection + 1);
        }
        if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && App.Navigation) {
          App.Navigation.goToSection(App.State.currentSection - 1);
        }
      }
      if (e.key === 'Escape') {
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
      if (App.Settings && App.Settings.copyProtocolUrl) {
        App.Settings.copyProtocolUrl();
      }
    });
    document.getElementById('menu-reset').addEventListener('click', () => {
      if (App.Settings && App.Settings.resetShortcuts) {
        App.Settings.resetShortcuts();
      }
    });
    document.getElementById('menu-icon-color').addEventListener('click', () => {
      if (App.Settings && App.Settings.toggleIconColor) {
        App.Settings.toggleIconColor();
      }
    });

    // ===== 공간 타입 전환 =====
    document.getElementById('menu-space').addEventListener('click', e => {
      e.stopPropagation();
      const newType = App.State.spaceType === 'tunnel' ? 'warp' : 'tunnel';
      if (App.Space && App.Space.changeType) {
        App.Space.changeType(newType);
      }
    });

    // ===== 터널 서브메뉴 =====
    document.getElementById('menu-tunnel').addEventListener('click', e => {
      e.stopPropagation();
      App.UI.hideCardStyleSubmenu();
      App.UI.toggleTunnelSubmenu();
    });

    document.querySelectorAll('.tunnel-option').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        if (App.Tunnel && App.Tunnel.changeShape) {
          App.Tunnel.changeShape(opt.dataset.shape);
        }
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
        if (App.Cards && App.Cards.changeStyle) {
          App.Cards.changeStyle(opt.dataset.style);
        }
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

    // ===== 컬러 바 =====
    document.querySelectorAll('.color-bar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (App.Theme && App.Theme.applyGlow) {
          App.Theme.applyGlow(btn.dataset.theme);
        }
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
          !e.target.closest('.depth-dot')) {
        createClickEffect(e.clientX, e.clientY);
      }
    });
  }

  // App.Events로 export
  App.Events = {
    initEventListeners: initEventListeners,
    initColorPicker: initColorPicker,
    createClickEffect: createClickEffect
  };

})();
