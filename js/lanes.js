/**
 * @file js/lanes.js
 * @description X축 레인 전환 시스템 (LEFT/CENTER/RIGHT)
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 3개의 레인으로 구성된 X축 전환
 *    - LEFT (-1): 히스토리 - 최근 사용한 바로가기
 *    - CENTER (0): 메인 - 기존 카테고리 섹션들
 *    - RIGHT (+1): 도구 - 설정 및 유틸리티
 * 2. **사용 방법**: App.Lanes.goToLane(laneId)로 레인 이동
 * 3. **입력**: Shift+휠 또는 좌우 화살표 키 (그리드 모드)
 */

(function(App) {
  'use strict';

  // ===== 상수 =====
  const LANE_IDS = { LEFT: -1, CENTER: 0, RIGHT: 1 };
  const LANE_NAMES = {
    [-1]: { name: '히스토리', subtitle: '최근 사용한 바로가기', icon: '🕐' },
    [0]: { name: '메인', subtitle: '카테고리 탐색', icon: '🏠' },
    [1]: { name: '도구', subtitle: '설정 및 유틸리티', icon: '🔧' }
  };
  const MAX_HISTORY = 20; // 히스토리 최대 저장 개수
  const HISTORY_STORAGE_KEY = 'mydesktop-history';
  const TOOLS_CONFIG = [
    { id: 'tool-settings', title: '설정', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>', action: 'openSettings' },
    { id: 'tool-categories', title: '카테고리', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>', action: 'openCategories' },
    { id: 'tool-import', title: '가져오기', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>', action: 'openImport' },
    { id: 'tool-reset', title: '초기화', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>', action: 'resetShortcuts' },
    { id: 'tool-theme', title: '테마', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>', action: 'cycleTheme' }
  ];

  // ===== 히스토리 관리 =====

  /**
   * 히스토리 불러오기
   * @returns {Array} 히스토리 배열
   */
  function loadHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  }

  /**
   * 히스토리 저장
   * @param {Array} history - 히스토리 배열
   */
  function saveHistory(history) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }

  /**
   * 바로가기 사용 시 히스토리에 추가
   * @param {Object} shortcut - 사용한 바로가기 객체
   */
  function addToHistory(shortcut) {
    if (!shortcut || !shortcut.id) return;

    let history = App.State.laneData.left;

    // 중복 제거 (이미 있으면 제거 후 맨 앞에 추가)
    history = history.filter(item => item.id !== shortcut.id);

    // 맨 앞에 추가 (타임스탬프 포함)
    history.unshift({
      ...shortcut,
      usedAt: Date.now()
    });

    // 최대 개수 제한
    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }

    App.State.laneData.left = history;
    saveHistory(history);

    // 히스토리 레인이 현재 보이고 있으면 다시 렌더링
    if (App.State.currentLane === LANE_IDS.LEFT) {
      renderHistoryLane();
    }
  }

  // ===== 레인 UI 생성 =====

  /**
   * 레인 화살표 생성 (휠 아이콘 양옆에 배치)
   */
  function createLaneIndicator() {
    // 이미 존재하면 제거
    const existing = document.getElementById('lane-arrows');
    if (existing) existing.remove();

    const scrollHint = document.getElementById('scroll-hint');
    if (!scrollHint) return;

    // 화살표 컨테이너
    const arrowsContainer = document.createElement('div');
    arrowsContainer.id = 'lane-arrows';

    // 왼쪽 화살표
    const leftArrow = document.createElement('div');
    leftArrow.id = 'lane-arrow-left';
    leftArrow.className = 'lane-arrow';
    leftArrow.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
      </svg>
    `;
    leftArrow.addEventListener('click', handleLeftArrowClick);

    // 오른쪽 화살표
    const rightArrow = document.createElement('div');
    rightArrow.id = 'lane-arrow-right';
    rightArrow.className = 'lane-arrow';
    rightArrow.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
      </svg>
    `;
    rightArrow.addEventListener('click', handleRightArrowClick);

    arrowsContainer.appendChild(leftArrow);
    arrowsContainer.appendChild(rightArrow);

    // scroll-hint 부모에 추가
    scrollHint.parentNode.insertBefore(arrowsContainer, scrollHint);

    // 초기 상태 업데이트
    updateLaneIndicator();
  }

  /**
   * 왼쪽 화살표 클릭 핸들러
   */
  function handleLeftArrowClick() {
    const currentLane = App.State.currentLane;
    if (currentLane === LANE_IDS.CENTER) {
      goToLane(LANE_IDS.LEFT);  // CENTER → LEFT
    } else if (currentLane === LANE_IDS.RIGHT) {
      goToLane(LANE_IDS.CENTER);  // RIGHT → CENTER
    }
  }

  /**
   * 오른쪽 화살표 클릭 핸들러
   */
  function handleRightArrowClick() {
    const currentLane = App.State.currentLane;
    if (currentLane === LANE_IDS.CENTER) {
      goToLane(LANE_IDS.RIGHT);  // CENTER → RIGHT
    } else if (currentLane === LANE_IDS.LEFT) {
      goToLane(LANE_IDS.CENTER);  // LEFT → CENTER
    }
  }

  /**
   * 레인 화살표 상태 업데이트
   */
  function updateLaneIndicator() {
    const leftArrow = document.getElementById('lane-arrow-left');
    const rightArrow = document.getElementById('lane-arrow-right');

    if (!leftArrow || !rightArrow) return;

    const currentLane = App.State.currentLane;

    // CENTER: 양쪽 활성화
    // LEFT: 왼쪽 비활성화, 오른쪽으로 CENTER 복귀
    // RIGHT: 오른쪽 비활성화, 왼쪽으로 CENTER 복귀

    leftArrow.classList.remove('disabled');
    rightArrow.classList.remove('disabled');

    if (currentLane === LANE_IDS.LEFT) {
      leftArrow.classList.add('disabled');
    } else if (currentLane === LANE_IDS.RIGHT) {
      rightArrow.classList.add('disabled');
    }
  }

  /**
   * 레인 컨테이너 생성 (LEFT, RIGHT)
   */
  function createLaneContainers() {
    // LEFT 레인 (히스토리)
    if (!document.getElementById('lane-left')) {
      const leftLane = document.createElement('div');
      leftLane.id = 'lane-left';
      leftLane.className = 'lane-container';
      document.getElementById('cards-3d-space').appendChild(leftLane);
    }

    // RIGHT 레인 (도구)
    if (!document.getElementById('lane-right')) {
      const rightLane = document.createElement('div');
      rightLane.id = 'lane-right';
      rightLane.className = 'lane-container';
      document.getElementById('cards-3d-space').appendChild(rightLane);
    }
  }

  // ===== 레인 렌더링 =====

  /**
   * 히스토리 레인 렌더링
   */
  function renderHistoryLane() {
    const container = document.getElementById('lane-left');
    if (!container) return;

    const history = App.State.laneData.left;

    if (history.length === 0) {
      container.innerHTML = `
        <div class="lane-empty">
          <div class="lane-empty-icon">🕐</div>
          <div class="lane-empty-title">히스토리가 비어있습니다</div>
          <div class="lane-empty-subtitle">바로가기를 사용하면 여기에 기록됩니다</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="lane-header">
        <span class="lane-header-icon">🕐</span>
        <span class="lane-header-title">최근 사용</span>
      </div>
      <div class="lane-cards"></div>
    `;

    const cardsContainer = container.querySelector('.lane-cards');

    history.forEach((item, index) => {
      const card = createHistoryCard(item, index);
      cardsContainer.appendChild(card);
    });
  }

  /**
   * 히스토리 카드 생성
   * @param {Object} item - 히스토리 아이템
   * @param {number} index - 인덱스
   * @returns {HTMLElement} 카드 요소
   */
  function createHistoryCard(item, index) {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.dataset.id = item.id;
    card.style.setProperty('--card-color', item.color || 'var(--accent)');

    // 아이콘 처리
    let iconContent = '';
    if (item.icon && item.icon.startsWith('si:')) {
      const iconName = item.icon.replace('si:', '');
      const color = App.State.iconColorMode === 'white' ? 'white' : 'default';
      iconContent = `<img src="https://cdn.simpleicons.org/${iconName}/${color === 'white' ? 'white' : ''}" alt="${item.title}" onerror="this.parentElement.textContent='${item.title.charAt(0).toUpperCase()}'">`;
    } else if (item.icon && item.icon.startsWith('http')) {
      iconContent = `<img src="${item.icon}" alt="${item.title}" onerror="this.parentElement.textContent='${item.title.charAt(0).toUpperCase()}'">`;
    } else {
      iconContent = item.title.charAt(0).toUpperCase();
    }

    // 시간 표시
    const timeAgo = getTimeAgo(item.usedAt);

    card.innerHTML = `
      <div class="history-icon">${iconContent}</div>
      <div class="history-info">
        <div class="history-title">${item.title}</div>
        <div class="history-time">${timeAgo}</div>
      </div>
    `;

    // 클릭 이벤트
    card.addEventListener('click', () => {
      if (item.url) {
        window.open(item.url, '_blank');
        addToHistory(item); // 다시 기록해서 맨 위로
      }
    });

    // 등장 애니메이션
    gsap.fromTo(card,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.3, delay: index * 0.05, ease: 'power2.out' }
    );

    return card;
  }

  /**
   * 시간 경과 텍스트 반환
   * @param {number} timestamp - 타임스탬프
   * @returns {string} 경과 시간 텍스트
   */
  function getTimeAgo(timestamp) {
    if (!timestamp) return '';

    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  }

  /**
   * 도구 레인 렌더링
   */
  function renderToolsLane() {
    const container = document.getElementById('lane-right');
    if (!container) return;

    container.innerHTML = `
      <div class="lane-header">
        <span class="lane-header-icon">🔧</span>
        <span class="lane-header-title">도구</span>
      </div>
      <div class="lane-cards tools-cards"></div>
    `;

    const cardsContainer = container.querySelector('.lane-cards');

    TOOLS_CONFIG.forEach((tool, index) => {
      const card = createToolCard(tool, index);
      cardsContainer.appendChild(card);
    });
  }

  /**
   * 도구 카드 생성
   * @param {Object} tool - 도구 설정
   * @param {number} index - 인덱스
   * @returns {HTMLElement} 카드 요소
   */
  function createToolCard(tool, index) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.action = tool.action;

    card.innerHTML = `
      <div class="tool-icon">${tool.icon}</div>
      <div class="tool-title">${tool.title}</div>
    `;

    // 클릭 이벤트
    card.addEventListener('click', () => {
      executeToolAction(tool.action);
    });

    // 등장 애니메이션
    gsap.fromTo(card,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.3, delay: index * 0.05, ease: 'power2.out' }
    );

    return card;
  }

  /**
   * 도구 액션 실행
   * @param {string} action - 액션 이름
   */
  function executeToolAction(action) {
    switch (action) {
      case 'openSettings':
        App.UI.toggleSettingsMenu();
        break;
      case 'openCategories':
        if (App.Categories) App.Categories.openManager();
        break;
      case 'openImport':
        if (App.Bookmarks) App.Bookmarks.openImportModal();
        break;
      case 'resetShortcuts':
        if (confirm('모든 바로가기를 초기화할까요?')) {
          App.State.shortcuts = App.Storage.resetShortcuts();
          App.Cards.renderCards();
          App.showToast('초기화 완료!');
        }
        break;
      case 'cycleTheme':
        const themes = ['gold', 'purple', 'cyan', 'pink', 'green', 'red', 'blue', 'white'];
        const currentIndex = themes.indexOf(App.State.glowTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        App.UI.applyGlowTheme(nextTheme);
        App.State.glowIntensity = 1;
        App.showToast(`테마: ${nextTheme}`);
        break;
    }
  }

  // ===== 레인 전환 =====

  /**
   * 특정 레인으로 이동
   * @param {number} laneId - 레인 ID (-1, 0, 1)
   */
  function goToLane(laneId) {
    if (App.State.isLaneTransitioning) return;
    if (laneId < -1 || laneId > 1) return;
    if (laneId === App.State.currentLane) return;

    App.State.isLaneTransitioning = true;

    const previousLane = App.State.currentLane;

    // 애니메이션 실행
    animateLaneTransition(previousLane, laneId);

    App.State.currentLane = laneId;
    updateLaneIndicator();

    // 캐러셀 화살표 표시 업데이트
    if (App.Carousel && App.Carousel.updateNavArrowsVisibility) {
      App.Carousel.updateNavArrowsVisibility();
    }

    setTimeout(() => {
      App.State.isLaneTransitioning = false;
    }, 600);
  }

  /**
   * 레인 콘텐츠 정리
   * @param {number} laneId - 정리할 레인 ID
   */
  function clearLaneContent(laneId) {
    if (laneId === LANE_IDS.LEFT) {
      const leftLane = document.getElementById('lane-left');
      if (leftLane) leftLane.innerHTML = '';
    } else if (laneId === LANE_IDS.RIGHT) {
      const rightLane = document.getElementById('lane-right');
      if (rightLane) rightLane.innerHTML = '';
    }
  }

  /**
   * 레인 전환 애니메이션
   * @param {number} fromLane - 출발 레인
   * @param {number} toLane - 도착 레인
   */
  function animateLaneTransition(fromLane, toLane) {
    const mainContainer = document.getElementById('cards-3d-space');
    const leftLane = document.getElementById('lane-left');
    const rightLane = document.getElementById('lane-right');
    const depthIndicator = document.getElementById('depth-indicator');
    const sectionInfo = document.getElementById('section-info');

    const slideDistance = window.innerWidth * 0.8;
    const centerElements = mainContainer.querySelectorAll('.section-cards');

    // LEFT(-1) → CENTER(0): 화면이 왼쪽으로 슬라이드 (LEFT가 왼쪽으로 나가고, CENTER가 오른쪽에서 들어옴)
    // CENTER(0) → LEFT(-1): 화면이 오른쪽으로 슬라이드 (CENTER가 오른쪽으로 나가고, LEFT가 왼쪽에서 들어옴)
    // CENTER(0) → RIGHT(1): 화면이 왼쪽으로 슬라이드 (CENTER가 왼쪽으로 나가고, RIGHT가 오른쪽에서 들어옴)
    // RIGHT(1) → CENTER(0): 화면이 오른쪽으로 슬라이드 (RIGHT가 오른쪽으로 나가고, CENTER가 왼쪽에서 들어옴)

    if (toLane === LANE_IDS.CENTER) {
      // LEFT 또는 RIGHT에서 CENTER로 돌아오기
      const leavingLane = fromLane === LANE_IDS.LEFT ? leftLane : rightLane;
      const exitDirection = fromLane === LANE_IDS.LEFT ? -1 : 1; // LEFT는 왼쪽으로, RIGHT는 오른쪽으로 나감

      // 이전 레인 나가기
      gsap.to(leavingLane, {
        x: exitDirection * slideDistance,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          leavingLane.classList.remove('active');
          gsap.set(leavingLane, { display: 'none', x: 0 });
          clearLaneContent(fromLane);
        }
      });

      // CENTER 섹션들 들어오기
      const enterDirection = fromLane === LANE_IDS.LEFT ? 1 : -1; // LEFT에서 오면 오른쪽에서, RIGHT에서 오면 왼쪽에서
      centerElements.forEach((el, i) => {
        gsap.set(el, { display: 'flex', x: enterDirection * slideDistance, opacity: 0 });
      });

      gsap.to(centerElements, {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.03,
        onComplete: () => {
          // active 섹션 설정
          centerElements.forEach((section, i) => {
            section.classList.toggle('active', i === App.State.currentSection);
          });
        }
      });

      // UI 요소 보이기
      gsap.to(depthIndicator, { opacity: 1, duration: 0.3 });
      gsap.to(sectionInfo, { opacity: 1, duration: 0.3 });

    } else if (fromLane === LANE_IDS.CENTER) {
      // CENTER에서 LEFT 또는 RIGHT로 이동
      const enteringLane = toLane === LANE_IDS.LEFT ? leftLane : rightLane;
      const exitDirection = toLane === LANE_IDS.LEFT ? 1 : -1; // LEFT로 가면 CENTER는 오른쪽으로, RIGHT로 가면 왼쪽으로
      const enterDirection = toLane === LANE_IDS.LEFT ? -1 : 1; // LEFT는 왼쪽에서, RIGHT는 오른쪽에서 들어옴

      // CENTER 섹션들 나가기
      gsap.to(centerElements, {
        x: exitDirection * slideDistance,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        stagger: 0.02,
        onComplete: () => {
          centerElements.forEach(el => {
            el.classList.remove('active');
            gsap.set(el, { display: 'none', x: 0 });
          });
        }
      });

      // UI 요소 숨기기
      gsap.to(depthIndicator, { opacity: 0, duration: 0.3 });
      gsap.to(sectionInfo, { opacity: 0, duration: 0.3 });

      // 새 레인 콘텐츠 렌더링
      if (toLane === LANE_IDS.LEFT) {
        renderHistoryLane();
      } else {
        renderToolsLane();
      }

      // 새 레인 들어오기
      gsap.set(enteringLane, { display: 'flex', x: enterDirection * slideDistance, opacity: 0 });
      enteringLane.classList.add('active');

      gsap.to(enteringLane, {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  }

  // ===== 초기화 =====

  /**
   * 레인 시스템 초기화
   */
  function init() {
    // 히스토리 로드
    App.State.laneData.left = loadHistory();

    // 컨테이너 생성
    createLaneContainers();

    // 인디케이터 생성
    createLaneIndicator();

    // 초기 상태는 CENTER
    App.State.currentLane = LANE_IDS.CENTER;
  }

  // ===== App.Lanes로 export =====
  App.Lanes = {
    init: init,
    goToLane: goToLane,
    addToHistory: addToHistory,
    createLaneIndicator: createLaneIndicator,
    updateLaneIndicator: updateLaneIndicator,
    renderHistoryLane: renderHistoryLane,
    renderToolsLane: renderToolsLane,
    LANE_IDS: LANE_IDS,
    LANE_NAMES: LANE_NAMES
  };

})(window.App = window.App || {});
