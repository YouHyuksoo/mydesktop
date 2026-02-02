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

  /**
   * 프로토콜 핸들러 모달 열기
   */
  function openProtocolModal() {
    App.UI.hideSettingsMenu();

    const urlInput = document.getElementById('protocol-base-url');
    const bookmarkletContainer = document.getElementById('bookmarklet-container');

    // 저장된 URL 불러오기
    const savedUrl = localStorage.getItem('mydesktop-protocol-url') || '';
    urlInput.value = savedUrl;

    // 현재 페이지가 http/https면 자동으로 채우기
    if (!savedUrl && window.location.protocol.startsWith('http')) {
      urlInput.value = window.location.origin + window.location.pathname;
    }

    // URL이 있으면 북마클릿 표시
    if (urlInput.value && urlInput.value.startsWith('http')) {
      updateBookmarklet(urlInput.value);
      bookmarkletContainer.style.display = 'block';
    } else {
      bookmarkletContainer.style.display = 'none';
    }

    // 모달 열기
    document.getElementById('protocol-modal').classList.add('active');
  }

  /**
   * 북마클릿 코드 업데이트
   */
  function updateBookmarklet(baseUrl) {
    // URL 끝에 슬래시 없으면 추가
    if (!baseUrl.endsWith('/') && !baseUrl.endsWith('.html')) {
      baseUrl = baseUrl + '/';
    }

    const bookmarkletCode = `javascript:(function(){window.open('${baseUrl}?add=1&url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank')})();`;

    const bookmarkletLink = document.getElementById('bookmarklet-link');
    if (bookmarkletLink) {
      bookmarkletLink.href = bookmarkletCode;
      bookmarkletLink.dataset.code = bookmarkletCode;
    }

    // URL 저장
    localStorage.setItem('mydesktop-protocol-url', baseUrl);
  }

  /**
   * 북마클릿 코드 복사
   */
  function copyBookmarkletCode() {
    const bookmarkletLink = document.getElementById('bookmarklet-link');
    const code = bookmarkletLink.dataset.code;

    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        App.showToast('북마클릿 코드 복사됨!');
      }).catch(async () => {
        // fallback - 커스텀 모달 사용
        await App.showAlert('클립보드 복사 실패. 아래 링크를 수동으로 북마크 바에 드래그하세요.', { title: '복사 실패' });
      });
    }
  }

  /**
   * 프로토콜 핸들러 모달 닫기
   */
  function closeProtocolModal() {
    document.getElementById('protocol-modal').classList.remove('active');
  }

  /**
   * URL 파라미터로 전달된 바로가기 처리
   */
  function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('add') === '1') {
      const url = params.get('url');
      const title = params.get('title');

      // URL 파라미터 제거 (히스토리 정리)
      window.history.replaceState({}, document.title, window.location.pathname);

      // 약간의 딜레이 후 모달 열기 (앱 초기화 완료 대기)
      setTimeout(() => {
        // 바로가기 추가 모달 열기
        if (App.UI && App.UI.openAddModal) {
          App.UI.openAddModal();
        } else {
          document.getElementById('shortcut-modal').classList.add('active');
          document.getElementById('modal-title').textContent = 'Add Shortcut';
          document.getElementById('modal-delete').style.display = 'none';
        }

        // 필드 채우기
        if (url) {
          document.getElementById('shortcut-url').value = decodeURIComponent(url);
        }
        if (title) {
          document.getElementById('shortcut-title').value = decodeURIComponent(title);
        }

        // 아이콘 자동 추천 (도메인 기반)
        if (url) {
          try {
            const domain = new URL(decodeURIComponent(url)).hostname.replace('www.', '');
            const brandName = domain.split('.')[0];
            document.getElementById('shortcut-icon').value = `si:${brandName}`;
          } catch (e) {
            // URL 파싱 실패시 무시
          }
        }

        App.showToast('사이트 정보를 가져왔어요!');
      }, 800);
    }
  }

  // URL 파라미터 처리 함수를 외부에서 호출할 수 있도록 export
  App.Events = App.Events || {};
  App.Events.handleUrlParams = handleUrlParams;

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
    // 바로가기 모달은 바깥 클릭으로 닫히지 않음 (취소/저장 버튼만 사용)

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
      openProtocolModal();
    });

    // 데이터 내보내기/가져오기
    document.getElementById('menu-export').addEventListener('click', () => {
      exportData();
    });
    document.getElementById('menu-restore').addEventListener('click', () => {
      importData();
    });

    // 프로토콜 모달 닫기
    document.getElementById('protocol-modal-close').addEventListener('click', () => {
      closeProtocolModal();
    });
    document.getElementById('protocol-modal').addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) {
        closeProtocolModal();
      }
    });

    // 프로토콜 URL 입력 변경 시 북마클릿 업데이트
    document.getElementById('protocol-base-url').addEventListener('input', e => {
      const url = e.target.value.trim();
      const bookmarkletContainer = document.getElementById('bookmarklet-container');

      if (url && url.startsWith('http')) {
        updateBookmarklet(url);
        bookmarkletContainer.style.display = 'block';
      } else {
        bookmarkletContainer.style.display = 'none';
      }
    });

    // 북마클릿 코드 복사 버튼
    document.getElementById('copy-bookmarklet-btn').addEventListener('click', () => {
      copyBookmarkletCode();
    });

    // ===== 아이콘 색상 토글 버튼 =====
    const iconColorToggleBtn = document.getElementById('icon-color-toggle-btn');
    if (iconColorToggleBtn) {
      iconColorToggleBtn.addEventListener('click', () => {
        toggleIconColor();
        updateIconColorToggleBtn();
      });
      // 초기 아이콘 상태 설정
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
      const auroraIcon = document.getElementById('space-icon-aurora');

      // 모든 아이콘 숨기기
      if (tunnelIcon) tunnelIcon.style.display = 'none';
      if (warpIcon) warpIcon.style.display = 'none';
      if (auroraIcon) auroraIcon.style.display = 'none';

      // 현재 타입에 맞는 아이콘만 표시
      if (App.State.spaceType === 'tunnel' && tunnelIcon) {
        tunnelIcon.style.display = 'block';
      } else if (App.State.spaceType === 'warp' && warpIcon) {
        warpIcon.style.display = 'block';
      } else if (App.State.spaceType === 'aurora' && auroraIcon) {
        auroraIcon.style.display = 'block';
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

    // ===== 이스터에그 테스트 버튼 =====
    const dragonTestBtn = document.getElementById('dragon-test-btn');
    if (dragonTestBtn) {
      dragonTestBtn.addEventListener('click', () => {
        if (App.Effects && App.Effects.createDragonAttack) {
          App.Effects.createDragonAttack();
        }
      });
    }

    const wolfTestBtn = document.getElementById('wolf-test-btn');
    if (wolfTestBtn) {
      wolfTestBtn.addEventListener('click', () => {
        if (App.Effects && App.Effects.createWolfAppear) {
          App.Effects.createWolfAppear();
        }
      });
    }
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
