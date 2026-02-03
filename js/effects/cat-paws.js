/**
 * @file js/effects/cat-paws.js
 * @description 고양이 발자국 시스템
 *
 * 초보자 가이드:
 * 1. 화면에 고양이 발자국이 나타났다 사라짐
 * 2. 반짝이는 빛 효과와 함께 등장
 */

window.App = window.App || {};
window.App.Effects = window.App.Effects || {};

(function() {
  'use strict';

  /**
   * 고양이 발자국 이벤트 시작
   */
  function startCatPaws() {
    function scheduleNextCat() {
      // 2분 ~ 5분 간격으로 발자국 등장 (가끔)
      const delay = 120000 + Math.random() * 180000;
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          createCatPawEvent();
        }
        scheduleNextCat();
      }, delay);
    }
    // 첫 발자국은 90초 후
    setTimeout(scheduleNextCat, 90000);
  }

  /**
   * 고양이 발자국 이벤트 생성 - 화면을 가로질러 걸어감
   */
  function createCatPawEvent() {
    // 방향 결정 (왼쪽→오른쪽 또는 오른쪽→왼쪽, 또는 대각선)
    const patterns = ['horizontal', 'diagonal-down', 'diagonal-up'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    const fromLeft = Math.random() > 0.5;
    let startX, startY, endX, endY;

    if (pattern === 'horizontal') {
      startX = fromLeft ? -80 : window.innerWidth + 80;
      startY = 150 + Math.random() * (window.innerHeight - 400);
      endX = fromLeft ? window.innerWidth + 80 : -80;
      endY = startY + (Math.random() - 0.5) * 100;
    } else if (pattern === 'diagonal-down') {
      startX = fromLeft ? -80 : window.innerWidth + 80;
      startY = 50 + Math.random() * 150;
      endX = fromLeft ? window.innerWidth + 80 : -80;
      endY = window.innerHeight - 100 - Math.random() * 150;
    } else {
      startX = fromLeft ? -80 : window.innerWidth + 80;
      startY = window.innerHeight - 150 - Math.random() * 150;
      endX = fromLeft ? window.innerWidth + 80 : -80;
      endY = 50 + Math.random() * 150;
    }

    // 발자국 찍기 시작
    createPawPrints(startX, startY, endX, endY, fromLeft);
  }

  /**
   * 발자국 경로 생성 - 랜덤하게 화면에 찍힘
   */
  function createPawPrints(startX, startY, endX, endY, fromLeft) {
    const pawCount = 15; // 발자국 개수
    let currentPaw = 0;

    function createNextPaw() {
      if (currentPaw >= pawCount) {
        return;
      }

      // 랜덤 위치 (화면 전체에 퍼지게)
      const x = 100 + Math.random() * (window.innerWidth - 200);
      const y = 100 + Math.random() * (window.innerHeight - 200);

      // 랜덤 회전
      const angle = Math.random() * 360;

      createSinglePaw(x, y, angle, 0);

      currentPaw++;
      // 랜덤 간격으로 다음 발자국
      setTimeout(createNextPaw, 200 + Math.random() * 300);
    }

    createNextPaw();
  }

  /**
   * 단일 발자국 생성
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} angle - 회전 각도
   * @param {number} delay - 지연 시간 (ms)
   */
  function createSinglePaw(x, y, angle, delay) {
    // 반짝이는 빛 효과 먼저
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      left: ${x + 25}px;
      top: ${y + 30}px;
      width: 10px;
      height: 10px;
      background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 30%, transparent 70%);
      border-radius: 50%;
      z-index: 9999;
      pointer-events: none;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(flash);

    // 빛 번쩍 효과
    gsap.fromTo(flash,
      { scale: 0, opacity: 1 },
      {
        scale: 8,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => flash.remove()
      }
    );

    // 발자국
    const paw = document.createElement('div');
    paw.className = 'cat-paw-print';
    paw.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 50px;
      height: 60px;
      opacity: 0;
      z-index: 9998;
      pointer-events: none;
      transform: rotate(${angle}deg);
    `;

    // SVG 발자국 (투명한 흰색)
    paw.innerHTML = `
      <svg viewBox="0 0 50 60" fill="rgba(255,255,255,0.5)" style="filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));">
        <!-- 메인 패드 -->
        <ellipse cx="25" cy="38" rx="14" ry="16"/>
        <!-- 발가락 패드들 -->
        <ellipse cx="12" cy="15" rx="8" ry="10"/>
        <ellipse cx="25" cy="8" rx="7" ry="9"/>
        <ellipse cx="38" cy="15" rx="8" ry="10"/>
      </svg>
    `;
    document.body.appendChild(paw);

    // 발자국 나타났다 천천히 사라지기
    gsap.to(paw, {
      opacity: 0.6,
      duration: 0.15,
      delay: delay / 1000,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(paw, {
          opacity: 0,
          duration: 2,
          delay: 0.5,
          ease: 'power2.in',
          onComplete: () => paw.remove()
        });
      }
    });
  }

  // Export
  App.Effects.startCatPaws = startCatPaws;
  App.Effects.createCatPawEvent = createCatPawEvent;
})();
