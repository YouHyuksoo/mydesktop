/**
 * @file js/handlers/grid-scroll.js
 * @description 그리드 스크롤 컨트롤
 */

window.App = window.App || {};
window.App.Handlers = window.App.Handlers || {};

(function() {
  'use strict';

  /**
   * 그리드 스크롤 컨트롤 초기화
   */
  function initGridScrollControls() {
    const scrollUpBtn = document.getElementById('grid-scroll-up');
    const scrollDownBtn = document.getElementById('grid-scroll-down');

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

  // Export
  App.Handlers.initGridScrollControls = initGridScrollControls;
  App.Handlers.updateGridScrollButtons = updateGridScrollButtons;
})();
