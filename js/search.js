/**
 * @file js/search.js
 * @description 바로가기 검색 기능
 *
 * 초보자 가이드:
 * 1. 상단 검색창에서 바로가기를 빠르게 검색
 * 2. '/' 키로 검색창 포커스
 * 3. 방향키로 결과 탐색, Enter로 이동
 */

(function() {
  'use strict';

  let searchInput;
  let searchResults;
  let activeIndex = -1;
  let currentResults = [];

  /**
   * 검색 기능 초기화
   */
  function initSearch() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // 입력 이벤트
    searchInput.addEventListener('input', handleSearchInput);

    // 키보드 이벤트
    searchInput.addEventListener('keydown', handleSearchKeydown);

    // 포커스 이벤트
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) {
        performSearch(searchInput.value);
      }
    });

    // 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-container')) {
        closeSearch();
      }
    });

    // 전역 '/' 키로 검색창 포커스
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        searchInput.focus();
      }
      // ESC로 검색창 닫기
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        closeSearch();
        searchInput.blur();
      }
    });
  }

  /**
   * 입력 필드에 포커스 중인지 확인
   */
  function isInputFocused() {
    const active = document.activeElement;
    return active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable;
  }

  /**
   * 검색 입력 핸들러
   */
  function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length === 0) {
      closeSearch();
      return;
    }
    performSearch(query);
  }

  /**
   * 키보드 네비게이션
   */
  function handleSearchKeydown(e) {
    if (!searchResults.classList.contains('active')) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, currentResults.length - 1);
        updateActiveResult();
        break;

      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActiveResult();
        break;

      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && currentResults[activeIndex]) {
          navigateToResult(currentResults[activeIndex]);
        }
        break;

      case 'Escape':
        closeSearch();
        searchInput.blur();
        break;
    }
  }

  /**
   * 검색 수행
   */
  function performSearch(query) {
    const shortcuts = App.State.shortcuts || [];
    const categories = App.Categories ? App.Categories.getAll() : [];
    const lowerQuery = query.toLowerCase();

    // 검색 결과 필터링
    currentResults = shortcuts.filter(shortcut => {
      const titleMatch = shortcut.title.toLowerCase().includes(lowerQuery);
      const urlMatch = shortcut.url.toLowerCase().includes(lowerQuery);
      return titleMatch || urlMatch;
    }).slice(0, 10); // 최대 10개

    activeIndex = currentResults.length > 0 ? 0 : -1;
    renderResults(currentResults, categories, query);
  }

  /**
   * 검색 결과 렌더링
   */
  function renderResults(results, categories, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">검색 결과가 없습니다</div>';
      searchResults.classList.add('active');
      return;
    }

    const html = results.map((item, index) => {
      const category = categories.find(c => c.id === item.layer) || { name: 'Unknown' };
      const iconHtml = getIconHtml(item);
      const highlightedTitle = highlightMatch(item.title, query);

      return `
        <div class="search-result-item ${index === activeIndex ? 'active' : ''}" data-index="${index}">
          <div class="search-result-icon">${iconHtml}</div>
          <div class="search-result-info">
            <div class="search-result-title">${highlightedTitle}</div>
            <div class="search-result-category">${category.name}</div>
          </div>
        </div>
      `;
    }).join('');

    searchResults.innerHTML = html;
    searchResults.classList.add('active');

    // 클릭 이벤트 바인딩
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        if (currentResults[idx]) {
          navigateToResult(currentResults[idx]);
        }
      });
    });
  }

  /**
   * 아이콘 HTML 생성
   */
  function getIconHtml(shortcut) {
    const icon = shortcut.icon;

    if (!icon) {
      return shortcut.title[0].toUpperCase();
    }

    // Simple Icons
    if (icon.startsWith('si:')) {
      const name = icon.substring(3);
      const color = shortcut.color ? shortcut.color.replace('#', '') : 'ffffff';
      return `<img src="https://cdn.simpleicons.org/${name}/${color}" alt="${shortcut.title}">`;
    }

    // Data URI
    if (icon.startsWith('data:')) {
      return `<img src="${icon}" alt="${shortcut.title}">`;
    }

    // URL
    if (icon.startsWith('http')) {
      return `<img src="${icon}" alt="${shortcut.title}">`;
    }

    // 이모지 또는 텍스트
    return icon;
  }

  /**
   * 검색어 하이라이트
   */
  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * 정규식 특수문자 이스케이프
   */
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 활성 결과 업데이트
   */
  function updateActiveResult() {
    searchResults.querySelectorAll('.search-result-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === activeIndex);
      if (idx === activeIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  /**
   * 결과로 이동
   */
  function navigateToResult(shortcut) {
    closeSearch();
    searchInput.value = '';
    searchInput.blur();

    // CENTER 레인이 아니면 CENTER로 이동
    if (App.State.currentLane !== 0 && App.Lanes) {
      App.Lanes.goToLane(0);
    }

    // 카테고리 id를 섹션 인덱스로 변환
    const categories = App.Categories ? App.Categories.getAll() : [];
    const targetSectionIndex = categories.findIndex(c => c.id === shortcut.layer);
    const currentSection = App.State.currentSection;

    if (targetSectionIndex === -1) return; // 카테고리를 찾지 못함

    // 레인 전환 대기 시간 추가
    const laneDelay = App.State.currentLane !== 0 ? 500 : 0;

    setTimeout(() => {
      if (targetSectionIndex !== currentSection) {
        // 섹션 이동
        App.Sections.goToSection(targetSectionIndex);
      }

      // 약간의 딜레이 후 카드 하이라이트
      setTimeout(() => {
        highlightCard(shortcut.id);
      }, targetSectionIndex !== currentSection ? 600 : 100);
    }, laneDelay);
  }

  /**
   * 카드 하이라이트 효과
   */
  function highlightCard(cardId) {
    const card = document.querySelector(`.shortcut-card[data-id="${cardId}"]`);
    if (!card) return;

    // 캐러셀 모드인 경우 해당 카드로 이동
    if (App.State.cardLayout === 'carousel') {
      const cards = Array.from(document.querySelectorAll('.section-cards.active .shortcut-card'));
      const cardIndex = cards.findIndex(c => c.dataset.id === String(cardId));
      if (cardIndex >= 0) {
        App.State.carouselIndex = cardIndex;
        App.Carousel.updateCarouselPosition();
      }
    }

    // 하이라이트 애니메이션
    card.style.transition = 'all 0.3s ease';
    card.style.boxShadow = '0 0 30px var(--accent), 0 0 60px var(--accent)';
    card.style.transform = card.style.transform + ' scale(1.1)';

    setTimeout(() => {
      card.style.boxShadow = '';
      card.style.transform = card.style.transform.replace(' scale(1.1)', '');
    }, 1500);
  }

  /**
   * 검색 닫기
   */
  function closeSearch() {
    searchResults.classList.remove('active');
    activeIndex = -1;
    currentResults = [];
  }

  // App.Search로 export
  App.Search = {
    init: initSearch,
    close: closeSearch
  };

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }

})();
