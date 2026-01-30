/**
 * @file js/sections.js
 * @description 섹션 전환 및 깊이 관리 관련 함수 모음
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 3D 터널 내 섹션(레이어) 간 전환 및 깊이 효과 관리
 * 2. **사용 방법**: App.Sections.goToSection(index) 로 섹션 이동
 * 3. **의존성**: App.state, App.config, App.Carousel, GSAP 라이브러리 필요
 */

(function(App) {
  'use strict';

  // ===== 상수 =====
  const DEPTH_SPACING = 600; // 섹션 간 Z 간격

  /**
   * 특정 섹션으로 이동
   * @param {number} index - 이동할 섹션 인덱스
   * @param {number|null} forceDirection - 강제 방향 지정 (1: 앞으로, -1: 뒤로)
   */
  function goToSection(index, forceDirection = null) {
    if (App.state.isTransitioning) return;

    const SECTIONS = App.config.SECTIONS;

    // 순환 처리 및 방향 계산
    let direction;
    if (index < 0) {
      index = SECTIONS.length - 1;
      direction = -1; // 뒤로 가는 것
    } else if (index >= SECTIONS.length) {
      index = 0;
      direction = 1; // 앞으로 가는 것
    } else {
      direction = index > App.state.currentSection ? 1 : -1;
    }

    if (index === App.state.currentSection) return;
    if (forceDirection !== null) direction = forceDirection;

    App.state.isTransitioning = true;

    // 터널 가속
    App.state.targetSpeed = direction * 30;

    // 섹션 타이틀 애니메이션
    gsap.to('#section-info', {
      opacity: 0,
      y: direction * -30,
      duration: 0.3,
      onComplete: () => {
        App.state.currentSection = index;
        updateSectionInfo();
        updateDepthIndicator();

        gsap.fromTo('#section-info',
          { opacity: 0, y: direction * 30 },
          { opacity: 1, y: 0, duration: 0.3 }
        );
      }
    });

    // 카드 깊이 업데이트 (GSAP로 부드럽게)
    animateCardsToSection(index, direction);

    // 터널 속도를 서서히 감속
    gsap.to({ speed: App.state.targetSpeed }, {
      speed: 0,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: function() {
        App.state.targetSpeed = this.targets()[0].speed;
      }
    });

    setTimeout(() => {
      App.state.isTransitioning = false;
    }, 800);

    // 스크롤 힌트 숨기기
    gsap.to('#scroll-hint', { opacity: 0, duration: 0.5 });
  }

  /**
   * 카드들을 목표 섹션으로 애니메이션
   * @param {number} targetIndex - 목표 섹션 인덱스
   * @param {number} direction - 이동 방향 (1 또는 -1)
   */
  function animateCardsToSection(targetIndex, direction) {
    const sections = document.querySelectorAll('.section-cards');

    // 먼저 모든 섹션에서 active 제거
    sections.forEach(s => s.classList.remove('active'));

    sections.forEach((section, i) => {
      const offset = i - targetIndex;
      const absOffset = Math.abs(offset);
      const zPos = -offset * DEPTH_SPACING;
      const scale = offset === 0 ? 1 : Math.max(0.3, 1 - absOffset * 0.4);
      const yOffset = offset > 0 ? -40 : (offset < 0 ? 40 : 0);

      // 현재 섹션과 앞/뒤 1개만 보이게, 나머지는 숨김
      const opacity = absOffset <= 1 ? (offset === 0 ? 1 : 0.3) : 0;

      // z-index로 렌더링 순서 강제
      const zIndex = 100 - absOffset;

      // 애니메이션 전에 보여야 할 섹션은 display 먼저 설정
      if (absOffset <= 1) {
        gsap.set(section, { display: 'flex' });
      }

      gsap.to(section, {
        z: zPos,
        scale: scale,
        opacity: opacity,
        y: yOffset,
        zIndex: zIndex,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          if (offset === 0) {
            section.classList.add('active');
            // 캐러셀 모드면 애니메이션 완료 후 즉시 위치 설정
            if (App.state.cardLayout === 'carousel') {
              App.state.carouselIndex = 0;
              App.Carousel.updateCarouselUI();
              App.Carousel.updateCarouselPosition(true);
            }
          }
          // 애니메이션 끝난 후 멀리 있는 섹션 숨김
          if (absOffset > 1) {
            gsap.set(section, { display: 'none' });
          }
        }
      });

      // 현재 섹션 카드들 등장 애니메이션
      if (offset === 0) {
        const cards = section.querySelectorAll('.shortcut-card');
        cards.forEach((card, ci) => {
          gsap.fromTo(card,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, delay: 0.3 + ci * 0.05, ease: 'back.out(1.7)' }
          );
        });
      }
    });
  }

  /**
   * 섹션 정보 UI 업데이트
   */
  function updateSectionInfo() {
    const section = App.config.SECTIONS[App.state.currentSection];
    document.getElementById('section-title').textContent = section.name;
    document.getElementById('section-subtitle').textContent = section.subtitle;
  }

  /**
   * 카드 섹션들의 3D 깊이 업데이트
   */
  function updateCardsDepth() {
    const sections = document.querySelectorAll('.section-cards');

    sections.forEach((section, i) => {
      const offset = i - App.state.currentSection;
      const absOffset = Math.abs(offset);
      const zPos = -offset * DEPTH_SPACING;
      const scale = offset === 0 ? 1 : Math.max(0.3, 1 - absOffset * 0.4);
      const yOffset = offset > 0 ? -30 : (offset < 0 ? 30 : 0);

      // 현재 섹션과 앞/뒤 1개만 보이게, 나머지는 숨김
      const opacity = absOffset <= 1 ? (offset === 0 ? 1 : 0.3) : 0;

      // z-index로 렌더링 순서 강제 (현재 섹션이 가장 위)
      const zIndex = 100 - absOffset;

      // GSAP.set으로 초기 상태 설정
      gsap.set(section, {
        z: zPos,
        scale: scale,
        opacity: opacity,
        y: yOffset,
        zIndex: zIndex,
        display: absOffset <= 1 ? 'flex' : 'none'
      });

      section.classList.toggle('active', offset === 0);
    });
  }

  /**
   * 깊이 인디케이터(도트) 업데이트
   */
  function updateDepthIndicator() {
    document.querySelectorAll('.depth-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === App.state.currentSection);
    });
  }

  /**
   * 깊이 인디케이터 초기 생성
   */
  function createDepthIndicator() {
    const container = document.getElementById('depth-indicator');
    App.config.SECTIONS.forEach((section, i) => {
      const dot = document.createElement('div');
      dot.className = 'depth-dot' + (i === 0 ? ' active' : '');
      dot.dataset.label = section.name;
      dot.addEventListener('click', () => goToSection(i));
      container.appendChild(dot);
    });
  }

  // ===== App.Sections로 export =====
  App.Sections = {
    goToSection: goToSection,
    animateCardsToSection: animateCardsToSection,
    updateCardsDepth: updateCardsDepth,
    updateSectionInfo: updateSectionInfo,
    updateDepthIndicator: updateDepthIndicator,
    createDepthIndicator: createDepthIndicator,
    DEPTH_SPACING: DEPTH_SPACING
  };

})(window.App = window.App || {});
