/**
 * @file js/effects/card-sleep.js
 * @description 카드 잠들기 시스템
 *
 * 초보자 가이드:
 * 1. 10분간 마우스오버 없으면 카드가 잠듦
 * 2. 마우스오버하면 기지개 펴며 깨어남
 * 3. 유성 맞아도 깨어남
 */

window.App = window.App || {};
window.App.Effects = window.App.Effects || {};

(function() {
  'use strict';

  const SLEEP_TIMEOUT = 600000; // 10분
  const sleepTimers = new Map(); // 카드별 타이머 저장

  /**
   * 카드 잠들기 시스템 시작
   */
  function startCardSleepSystem() {
    // 모든 카드에 이벤트 리스너 추가
    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.shortcut-card');
      if (card) wakeUpCard(card);
    });

    // 주기적으로 잠든 카드 체크
    setInterval(checkSleepingCards, 5000);

    // 초기 타이머 설정
    resetAllCardTimers();
  }

  /**
   * 모든 카드 타이머 리셋
   */
  function resetAllCardTimers() {
    const cards = document.querySelectorAll('.shortcut-card');
    cards.forEach(card => {
      resetCardTimer(card);
    });
  }

  /**
   * 개별 카드 타이머 리셋
   * @param {HTMLElement} card - 카드 요소
   */
  function resetCardTimer(card) {
    const cardId = card.dataset.id;
    if (!cardId) return;

    // 기존 타이머 제거
    if (sleepTimers.has(cardId)) {
      clearTimeout(sleepTimers.get(cardId));
    }

    // 새 타이머 설정
    const timer = setTimeout(() => {
      makeCardSleep(card);
    }, SLEEP_TIMEOUT);

    sleepTimers.set(cardId, timer);
  }

  /**
   * 카드 잠들게 하기
   * @param {HTMLElement} card - 카드 요소
   */
  function makeCardSleep(card) {
    if (!card || !document.body.contains(card)) return;
    if (card.classList.contains('sleeping')) return;

    card.classList.add('sleeping');

    // Zzz 말풍선 추가
    const zzz = document.createElement('div');
    zzz.className = 'sleep-bubble';
    zzz.innerHTML = `
      <span class="z z1">Z</span>
      <span class="z z2">z</span>
      <span class="z z3">z</span>
    `;
    card.appendChild(zzz);

    // 카드 살짝 기울이기
    gsap.to(card, {
      rotation: -3,
      scale: 0.98,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  /**
   * 카드 깨우기
   * @param {HTMLElement} card - 카드 요소
   */
  function wakeUpCard(card) {
    if (!card.classList.contains('sleeping')) {
      resetCardTimer(card);
      return;
    }

    card.classList.remove('sleeping');

    // Zzz 제거
    const bubble = card.querySelector('.sleep-bubble');
    if (bubble) {
      gsap.to(bubble, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => bubble.remove()
      });
    }

    // 깨어나는 애니메이션 (기지개)
    gsap.timeline()
      .to(card, {
        rotation: 0,
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      })
      .to(card, {
        scale: 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      });

    // 눈 깜빡임 효과 (카드 반짝)
    gsap.to(card, {
      boxShadow: '0 0 30px var(--accent)',
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });

    // 타이머 리셋
    resetCardTimer(card);
  }

  /**
   * 잠든 카드 체크 (섹션 변경 시 등)
   */
  function checkSleepingCards() {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection) return;

    const cards = activeSection.querySelectorAll('.shortcut-card');
    cards.forEach(card => {
      const cardId = card.dataset.id;
      if (!sleepTimers.has(cardId)) {
        resetCardTimer(card);
      }
    });
  }

  // Export
  App.Effects.startCardSleepSystem = startCardSleepSystem;
  App.Effects.wakeUpCard = wakeUpCard;
  App.Effects.resetAllCardTimers = resetAllCardTimers;
})();
