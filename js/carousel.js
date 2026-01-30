/**
 * @file js/carousel.js
 * @description 캐러셀 레이아웃 관련 함수 모음
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 카드들을 3D 원형 캐러셀로 배치하고 회전 네비게이션 제공
 * 2. **사용 방법**: App.Carousel.goToCarouselIndex(index) 로 특정 카드로 이동
 * 3. **의존성**: App.state, GSAP 라이브러리 필요
 */

(function(App) {
  'use strict';

  /**
   * 캐러셀 UI 업데이트 (점 인디케이터)
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
      dot.className = 'carousel-dot' + (i === App.state.carouselIndex ? ' active' : '');
      dot.addEventListener('click', () => goToCarouselIndex(i));
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
   * 캐러셀 위치 업데이트 (3D 원형 배치)
   * @param {boolean} immediate - true면 애니메이션 없이 즉시 이동
   */
  function updateCarouselPosition(immediate = false) {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection || App.state.cardLayout !== 'carousel') return;

    const cards = activeSection.querySelectorAll('.shortcut-card');
    const cardCount = cards.length;
    if (cardCount === 0) return;

    const isMobile = window.innerWidth <= 768;
    // 카드 수에 따라 반지름 조정 (카드가 적으면 작게)
    const baseRadius = isMobile ? 180 : 280;
    const radius = Math.min(baseRadius, baseRadius * (cardCount / 6));
    const angleStep = (Math.PI * 2) / Math.max(cardCount, 5); // 최소 5등분

    cards.forEach((card, i) => {
      // 현재 카드의 각도 계산
      const angle = angleStep * (i - App.state.carouselIndex);

      let x = 0, y = 0, z = 0, scale = 1, rotateY = 0, opacity = 1;

      // 앞쪽(angle=0)이 가장 크고 밝게
      const depth = Math.cos(angle); // -1 ~ 1 (앞쪽이 1)
      const normalizedDepth = (depth + 1) / 2; // 0 ~ 1

      if (isMobile) {
        // 모바일: 세로 캐러셀 - 3장이 잘 보이도록
        y = Math.sin(angle) * radius * 0.9; // 간격 넓힘
        z = depth * 120; // 깊이감 줄여서 더 잘 보이게
        scale = 0.75 + 0.25 * normalizedDepth; // 사이드 카드 더 크게 (0.75~1.0)
        opacity = 0.65 + 0.35 * normalizedDepth; // 사이드 카드 더 밝게 (0.65~1.0)
      } else {
        // 데스크톱: 가로 캐러셀 - 정면에서 뒤로 좁아지는 형태
        x = Math.sin(angle) * radius;
        z = depth * 200; // 중앙(depth=1)이 앞으로, 양쪽(depth<1)이 뒤로
        rotateY = -angle * (180 / Math.PI) * 0.5;
        scale = 0.7 + 0.3 * normalizedDepth;
        opacity = 0.5 + 0.5 * normalizedDepth;
      }

      const zIndex = Math.round(50 + 50 * normalizedDepth);
      const pointerEvents = normalizedDepth > 0.3 ? 'auto' : 'none';

      if (immediate) {
        gsap.set(card, { x, y, z, scale, rotateY, opacity, zIndex });
      } else {
        gsap.to(card, {
          x, y, z, scale, rotateY, opacity, zIndex,
          duration: 0.6,
          ease: 'power3.out'
        });
      }
      card.style.pointerEvents = pointerEvents;
    });

    // 점 업데이트
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === App.state.carouselIndex);
    });
  }

  /**
   * 특정 인덱스의 카드로 이동
   * @param {number} index - 이동할 카드 인덱스
   */
  function goToCarouselIndex(index) {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection) return;

    const cards = activeSection.querySelectorAll('.shortcut-card');
    const cardCount = cards.length;
    if (cardCount === 0) return;

    // 순환 처리 (360도 회전)
    if (index < 0) index = cardCount - 1;
    if (index >= cardCount) index = 0;

    App.state.carouselIndex = index;
    updateCarouselPosition();
  }

  /**
   * 이전 카드로 이동
   */
  function carouselPrev() {
    goToCarouselIndex(App.state.carouselIndex - 1);
  }

  /**
   * 다음 카드로 이동
   */
  function carouselNext() {
    goToCarouselIndex(App.state.carouselIndex + 1);
  }

  /**
   * 카드 레이아웃 변경 (그리드 <-> 캐러셀)
   * @param {string} layout - 'grid' 또는 'carousel'
   */
  function changeCardLayout(layout) {
    App.state.cardLayout = layout;
    App.state.carouselIndex = 0;
    App.saveSettings();
    App.Cards.renderCards();
    updateCardLayoutLabel();
    App.showToast(layout === 'carousel' ? '🎠 캐러셀 배치' : '📦 그리드 배치');
  }

  /**
   * 카드 레이아웃 라벨 업데이트
   */
  function updateCardLayoutLabel() {
    const label = document.getElementById('card-layout-label');
    if (label) {
      label.textContent = App.state.cardLayout === 'carousel' ? '배치: 캐러셀' : '배치: 그리드';
    }
  }

  // ===== App.Carousel로 export =====
  App.Carousel = {
    updateCarouselUI: updateCarouselUI,
    hideCarouselUI: hideCarouselUI,
    updateCarouselPosition: updateCarouselPosition,
    goToCarouselIndex: goToCarouselIndex,
    carouselPrev: carouselPrev,
    carouselNext: carouselNext,
    changeCardLayout: changeCardLayout,
    updateCardLayoutLabel: updateCardLayoutLabel
  };

})(window.App = window.App || {});
