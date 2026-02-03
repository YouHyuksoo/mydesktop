/**
 * @file js/effects/ufo-alien.js
 * @description UFO & 문어 우주인 시스템
 *
 * 초보자 가이드:
 * 1. UFO가 날아와 카드 위에 떠있음
 * 2. 트랙터 빔으로 문어 우주인이 내려옴
 * 3. 문어가 카드 위를 걸어다닌 후 다시 UFO로 돌아감
 */

window.App = window.App || {};
window.App.Effects = window.App.Effects || {};

(function() {
  'use strict';

  /**
   * UFO 이벤트 시작 (랜덤 간격으로 발생)
   */
  function startUfoVisits() {
    function scheduleNextUfo() {
      // 2분 ~ 5분 간격으로 UFO 출현 (가끔)
      const delay = 120000 + Math.random() * 180000;
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          createUfoEvent();
        }
        scheduleNextUfo();
      }, delay);
    }
    // 첫 UFO는 2분 후에 등장
    setTimeout(scheduleNextUfo, 120000);
  }

  /**
   * UFO 이벤트 생성
   */
  function createUfoEvent() {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection) return;

    const cards = activeSection.querySelectorAll('.shortcut-card');
    if (cards.length === 0) return;

    // 랜덤 카드 선택
    const targetCard = cards[Math.floor(Math.random() * cards.length)];
    const cardRect = targetCard.getBoundingClientRect();

    // 카드 중심 좌표
    const targetX = cardRect.left + cardRect.width / 2;
    const targetY = cardRect.top - 80; // 카드 위에 떠있음

    // UFO 컨테이너 생성
    const ufoContainer = document.createElement('div');
    ufoContainer.className = 'ufo-container';
    ufoContainer.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(ufoContainer);

    // UFO 생성
    const ufo = document.createElement('div');
    ufo.className = 'ufo';
    ufo.innerHTML = `
      <div class="ufo-body">
        <div class="ufo-dome"></div>
        <div class="ufo-ring"></div>
        <div class="ufo-lights">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
    `;
    ufoContainer.appendChild(ufo);

    // UFO 빔 (트랙터 빔)
    const beam = document.createElement('div');
    beam.className = 'ufo-beam';
    ufoContainer.appendChild(beam);

    // 시작 위치 (화면 왼쪽 또는 오른쪽 밖)
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -100 : window.innerWidth + 100;
    const startY = targetY - 50;

    gsap.set(ufoContainer, { left: startX, top: startY });

    // Phase 1: UFO가 카드 위로 날아옴
    gsap.to(ufoContainer, {
      left: targetX - 40,
      top: targetY,
      duration: 2,
      ease: 'power2.out',
      onComplete: () => {
        // Phase 2: 빔 켜기 + 문어 내려오기
        beam.classList.add('active');

        setTimeout(() => {
          spawnAlien(targetCard, cardRect, () => {
            // Phase 4: 문어 올라감 + 빔 끄기 + UFO 떠남
            beam.classList.remove('active');

            // UFO 떠나기
            const exitX = fromLeft ? window.innerWidth + 100 : -100;
            gsap.to(ufoContainer, {
              left: exitX,
              top: startY - 100,
              duration: 2,
              ease: 'power2.in',
              onComplete: () => ufoContainer.remove()
            });
          });
        }, 500);
      }
    });

    // UFO 떠다니는 애니메이션
    gsap.to(ufo, {
      y: -5,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }

  /**
   * 문어 우주인 생성
   * @param {HTMLElement} targetCard - 대상 카드
   * @param {DOMRect} cardRect - 카드 위치 정보
   * @param {Function} onComplete - 완료 콜백
   */
  function spawnAlien(targetCard, cardRect, onComplete) {
    const alien = document.createElement('div');
    alien.className = 'space-alien';
    alien.innerHTML = `
      <div class="alien-body">
        <div class="alien-head">
          <div class="alien-eye left"></div>
          <div class="alien-eye right"></div>
        </div>
        <div class="alien-tentacles">
          <div class="tentacle t1"></div>
          <div class="tentacle t2"></div>
          <div class="tentacle t3"></div>
          <div class="tentacle t4"></div>
        </div>
      </div>
    `;
    document.body.appendChild(alien);

    // 카드 위 시작 위치
    const startX = cardRect.left + cardRect.width / 2;
    const startY = cardRect.top - 100;
    const walkY = cardRect.top + 10; // 카드 상단에서 걸어다님

    gsap.set(alien, {
      left: startX,
      top: startY,
      opacity: 0,
      scale: 0.3
    });

    // 내려오기
    gsap.to(alien, {
      top: walkY,
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'bounce.out',
      onComplete: () => {
        // 걷기 애니메이션 시작
        walkOnCard(alien, cardRect, () => {
          // 올라가기
          gsap.to(alien, {
            top: startY,
            opacity: 0,
            scale: 0.3,
            duration: 0.8,
            ease: 'power2.in',
            onComplete: () => {
              alien.remove();
              onComplete();
            }
          });
        });
      }
    });
  }

  /**
   * 카드 위를 걸어다니는 애니메이션
   * @param {HTMLElement} alien - 문어 우주인 요소
   * @param {DOMRect} cardRect - 카드 위치 정보
   * @param {Function} onComplete - 완료 콜백
   */
  function walkOnCard(alien, cardRect, onComplete) {
    const leftBound = cardRect.left + 10;
    const rightBound = cardRect.left + cardRect.width - 30;

    // 걷는 동작 (다리 움직임)
    const tentacles = alien.querySelectorAll('.tentacle');
    tentacles.forEach((t, i) => {
      gsap.to(t, {
        rotation: i % 2 === 0 ? 15 : -15,
        duration: 0.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    });

    // 좌우로 2번 왕복
    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.killTweensOf(tentacles);
        onComplete();
      }
    });

    // 오른쪽으로
    timeline.to(alien, {
      left: rightBound,
      duration: 1.5,
      ease: 'sine.inOut',
      onStart: () => alien.classList.remove('flip')
    });

    // 왼쪽으로
    timeline.to(alien, {
      left: leftBound,
      duration: 1.5,
      ease: 'sine.inOut',
      onStart: () => alien.classList.add('flip')
    });

    // 다시 오른쪽으로
    timeline.to(alien, {
      left: rightBound,
      duration: 1.5,
      ease: 'sine.inOut',
      onStart: () => alien.classList.remove('flip')
    });

    // 중앙으로 복귀
    timeline.to(alien, {
      left: cardRect.left + cardRect.width / 2,
      duration: 0.8,
      ease: 'sine.inOut'
    });
  }

  // Export
  App.Effects.startUfoVisits = startUfoVisits;
  App.Effects.createUfoEvent = createUfoEvent;
})();
