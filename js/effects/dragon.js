/**
 * @file js/effects/dragon.js
 * @description 드래곤 습격 시스템 (Lottie 애니메이션)
 *
 * 초보자 가이드:
 * 1. 드래곤이 날아와 화면 중앙 위에서 맴돌다 불 뿜음
 * 2. 카드가 불타다가 피닉스처럼 부활함
 */

window.App = window.App || {};
window.App.Effects = window.App.Effects || {};

(function() {
  'use strict';

  /**
   * 드래곤 습격 시스템 시작
   */
  function startDragonAttacks() {
    function scheduleNextDragon() {
      // 3분 ~ 6분 간격으로 드래곤 출현 (아주 가끔)
      const delay = 180000 + Math.random() * 180000;
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          createDragonAttack();
        }
        scheduleNextDragon();
      }, delay);
    }
    // 첫 드래곤은 2분 후
    setTimeout(scheduleNextDragon, 120000);
  }

  /**
   * 드래곤 습격 이벤트 (Lottie 버전)
   */
  function createDragonAttack() {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection) return;

    const cards = activeSection.querySelectorAll('.shortcut-card:not(.burning)');
    if (cards.length === 0) return;

    // 시작 위치 결정
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -300 : window.innerWidth + 100;
    const startY = -100;

    // Lottie 드래곤 생성
    const dragon = document.createElement('div');
    dragon.className = 'dragon-lottie';
    dragon.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      z-index: 9999;
      pointer-events: none;
      filter: drop-shadow(0 0 20px rgba(255, 100, 0, 0.5));
      transform: scaleX(${fromLeft ? -1 : 1});
    `;

    // dotlottie-wc 생성
    const lottiePlayer = document.createElement('dotlottie-wc');
    lottiePlayer.setAttribute('src', 'https://lottie.host/86b8af85-928e-4d32-abbc-17ba2a5d09f5/7GP6U4JyZN.lottie');
    lottiePlayer.setAttribute('autoplay', '');
    lottiePlayer.setAttribute('loop', '');
    lottiePlayer.style.cssText = 'width: 300px; height: 300px;';
    dragon.appendChild(lottiePlayer);
    document.body.appendChild(dragon);

    // 드래곤 애니메이션 시작 함수
    function startDragonAnimation() {
      // Phase 1: 드래곤이 화면 중앙 위로 날아옴
      const centerX = window.innerWidth / 2;
      const hoverY = 50;

      const timeline = gsap.timeline();

      timeline.to(dragon, {
        left: centerX - 150,
        top: hoverY,
        duration: 2,
        ease: 'power2.out'
      });

      // Phase 2: 잠시 맴돌기 (위협적으로)
      timeline.to(dragon, {
        y: -30,
        duration: 0.5,
        yoyo: true,
        repeat: 2,
        ease: 'sine.inOut'
      });

      // Phase 3: 불 뿜기!
      timeline.call(() => {
        breathFireLottie(dragon, cards, fromLeft);
      });

      // Phase 4: 드래곤 퇴장
      timeline.to(dragon, {
        left: fromLeft ? window.innerWidth + 100 : -300,
        top: -150,
        duration: 2.5,
        delay: 3.5,
        ease: 'power2.in',
        onComplete: () => {
          dragon.remove();
        }
      });
    }

    // 약간의 딜레이 후 애니메이션 시작 (Lottie 로드 시간 확보)
    setTimeout(startDragonAnimation, 500);
  }

  /**
   * 불 뿜기 효과 (CSS 파티클) - 아래로 불 뿜기
   */
  function breathFireLottie(dragon, cards, fromLeft) {
    const dragonRect = dragon.getBoundingClientRect();

    // 불꽃 컨테이너 생성
    const fireContainer = document.createElement('div');
    fireContainer.className = 'dragon-fire-container';
    fireContainer.style.cssText = `
      position: fixed;
      z-index: 9998;
      pointer-events: none;
    `;
    document.body.appendChild(fireContainer);

    // 불꽃 위치 (드래곤 입 위치 - 아래쪽 중앙)
    const fireX = dragonRect.left + dragonRect.width / 2;
    const fireY = dragonRect.bottom - 50;

    gsap.set(fireContainer, {
      left: fireX,
      top: fireY
    });

    // 불꽃 파티클 연속 생성 (아래 방향)
    let fireInterval = setInterval(() => {
      createFireParticleDown(fireContainer);
    }, 50);

    // 드래곤 포효 효과 (흔들림)
    gsap.to(dragon, {
      y: 10,
      duration: 0.1,
      yoyo: true,
      repeat: 15
    });

    // 카드들 불태우기
    setTimeout(() => {
      burnCards(cards);
    }, 800);

    // 불꽃 멈추기
    setTimeout(() => {
      clearInterval(fireInterval);
      gsap.to(fireContainer, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => fireContainer.remove()
      });
    }, 2000);
  }

  /**
   * 불꽃 파티클 생성 (아래 방향)
   */
  function createFireParticleDown(container) {
    const particle = document.createElement('div');
    const size = 20 + Math.random() * 40;
    const colors = ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, ${color} 0%, #ff6600 40%, transparent 70%);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      filter: blur(3px);
      opacity: 1;
      left: ${-20 + Math.random() * 40}px;
      top: 0;
    `;
    container.appendChild(particle);

    // 불꽃 아래로 날아가기
    gsap.to(particle, {
      x: -40 + Math.random() * 80,
      y: 150 + Math.random() * 200,
      scale: 0.3,
      opacity: 0,
      duration: 0.4 + Math.random() * 0.3,
      ease: 'power1.out',
      onComplete: () => particle.remove()
    });
  }

  /**
   * 카드들 불태우기 효과
   */
  function burnCards(cards) {
    // 랜덤하게 1~3개의 카드 선택
    const cardArray = Array.from(cards);
    const burnCount = Math.min(cardArray.length, 1 + Math.floor(Math.random() * 2));
    const targetCards = [];

    for (let i = 0; i < burnCount; i++) {
      const randomIndex = Math.floor(Math.random() * cardArray.length);
      targetCards.push(cardArray.splice(randomIndex, 1)[0]);
    }

    targetCards.forEach((card, index) => {
      setTimeout(() => {
        burnSingleCard(card);
      }, index * 200);
    });
  }

  /**
   * 단일 카드 불태우기
   */
  function burnSingleCard(card) {
    if (!card || card.classList.contains('burning')) return;

    card.classList.add('burning');

    const cardRect = card.getBoundingClientRect();

    // 카드 위에 불꽃 효과 오버레이
    const fireOverlay = document.createElement('div');
    fireOverlay.className = 'card-fire-overlay';
    fireOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
      border-radius: inherit;
    `;

    // 불꽃 파티클들
    for (let i = 0; i < 15; i++) {
      const flame = document.createElement('div');
      flame.className = 'card-flame';
      flame.style.cssText = `
        position: absolute;
        bottom: -10px;
        left: ${Math.random() * 100}%;
        width: ${10 + Math.random() * 15}px;
        height: ${20 + Math.random() * 30}px;
        background: linear-gradient(to top, #ff0000, #ff6600, #ffff00, transparent);
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        filter: blur(1px);
        animation: flame-dance ${0.2 + Math.random() * 0.3}s ease-in-out infinite;
      `;
      fireOverlay.appendChild(flame);
    }

    card.style.position = 'relative';
    card.appendChild(fireOverlay);

    // 카드 흔들림 + 색상 변화
    gsap.to(card, {
      filter: 'brightness(1.5) sepia(1) saturate(3) hue-rotate(-20deg)',
      duration: 0.3
    });

    // 격렬한 흔들림
    gsap.to(card, {
      x: 5,
      rotation: 2,
      duration: 0.1,
      yoyo: true,
      repeat: 20,
      ease: 'none'
    });

    // 연기 파티클
    createSmokeParticles(cardRect);

    // 3초 후 재에서 부활
    setTimeout(() => {
      reviveCard(card, fireOverlay);
    }, 3000);
  }

  /**
   * 연기 파티클 생성
   */
  function createSmokeParticles(cardRect) {
    for (let i = 0; i < 10; i++) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-particle';
      smoke.style.cssText = `
        position: fixed;
        left: ${cardRect.left + Math.random() * cardRect.width}px;
        top: ${cardRect.top}px;
        width: ${20 + Math.random() * 20}px;
        height: ${20 + Math.random() * 20}px;
        background: radial-gradient(circle, rgba(100,100,100,0.8) 0%, rgba(50,50,50,0.3) 50%, transparent 70%);
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(smoke);

      gsap.to(smoke, {
        top: cardRect.top - 100 - Math.random() * 100,
        left: cardRect.left + Math.random() * cardRect.width,
        opacity: 0,
        scale: 2 + Math.random(),
        duration: 2 + Math.random(),
        delay: i * 0.1,
        ease: 'power1.out',
        onComplete: () => smoke.remove()
      });
    }
  }

  /**
   * 카드 부활 (피닉스 효과)
   */
  function reviveCard(card, fireOverlay) {
    // 불꽃 사라지기
    gsap.to(fireOverlay, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => fireOverlay.remove()
    });

    // 카드 재로 변하기
    gsap.to(card, {
      filter: 'brightness(0.3) grayscale(1)',
      scale: 0.9,
      duration: 0.5,
      onComplete: () => {
        // 피닉스 부활!
        card.classList.remove('burning');

        // 부활 이펙트
        const cardRect = card.getBoundingClientRect();
        createPhoenixEffect(cardRect);

        // 카드 복원
        gsap.to(card, {
          filter: 'brightness(1) grayscale(0)',
          scale: 1,
          x: 0,
          rotation: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)'
        });

        // 황금빛 반짝임
        gsap.to(card, {
          boxShadow: '0 0 30px #ff6600, 0 0 60px #ffaa00',
          duration: 0.3,
          yoyo: true,
          repeat: 3
        });
      }
    });
  }

  /**
   * 피닉스 부활 이펙트
   */
  function createPhoenixEffect(cardRect) {
    const centerX = cardRect.left + cardRect.width / 2;
    const centerY = cardRect.top + cardRect.height / 2;

    // 불꽃 파티클 폭발
    for (let i = 0; i < 20; i++) {
      const spark = document.createElement('div');
      spark.innerHTML = '✨';
      spark.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        font-size: ${12 + Math.random() * 10}px;
        z-index: 10000;
        pointer-events: none;
        filter: drop-shadow(0 0 5px #ffaa00);
      `;
      document.body.appendChild(spark);

      const angle = (i / 20) * Math.PI * 2;
      const distance = 50 + Math.random() * 80;

      gsap.to(spark, {
        left: centerX + Math.cos(angle) * distance,
        top: centerY + Math.sin(angle) * distance,
        opacity: 0,
        rotation: 360,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => spark.remove()
      });
    }

    // 토스트 메시지
    if (App.showToast) {
      App.showToast('🔥 드래곤의 불길에서 부활!');
    }
  }

  // Export
  App.Effects.startDragonAttacks = startDragonAttacks;
  App.Effects.createDragonAttack = createDragonAttack;
})();
