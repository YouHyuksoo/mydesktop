/**
 * @file js/effects.js
 * @description 시각 효과 (클릭 리플, 유성 효과)
 *
 * 초보자 가이드:
 * 1. 클릭 시 파티클 효과 생성
 * 2. 유성 시스템으로 카드에 충돌 효과
 */

window.App = window.App || {};

App.Effects = (function() {
  'use strict';

  /**
   * 클릭 효과 생성
   */
  function createClickEffect(x, y) {
    // 리플 효과
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    document.body.appendChild(ripple);

    // 버스트 파티클
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    document.body.appendChild(burst);

    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      burst.appendChild(particle);

      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;

      gsap.fromTo(particle,
        { x: 0, y: 0, scale: 1, opacity: 1 },
        {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        }
      );
    }

    // 근처 카드 빛나게
    const cards = document.querySelectorAll('.shortcut-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(x - cardCenterX, 2) + Math.pow(y - cardCenterY, 2));

      if (distance < 200) {
        gsap.to(card, {
          boxShadow: '0 0 40px var(--card-glow)',
          duration: 0.2,
          yoyo: true,
          repeat: 1
        });
      }
    });

    // 글로우 인텐시티 증가
    const glowOrbs = document.querySelectorAll('.glow-orb');
    glowOrbs.forEach(orb => {
      gsap.to(orb, {
        scale: 1.2,
        opacity: 0.9,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.to(orb, {
            scale: 1,
            opacity: 0.6,
            duration: 0.5
          });
        }
      });
    });

    // 정리
    setTimeout(() => {
      ripple.remove();
      burst.remove();
    }, 1000);
  }

  /**
   * 유성 샤워 시작
   */
  function startMeteorShower() {
    function scheduleNextMeteor() {
      const delay = 5000 + Math.random() * 10000;
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          createMeteor();
        }
        scheduleNextMeteor();
      }, delay);
    }
    scheduleNextMeteor();
  }

  /**
   * 유성 생성
   */
  function createMeteor() {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection) return;

    const cards = activeSection.querySelectorAll('.shortcut-card');
    if (cards.length === 0) return;

    // 랜덤 카드 선택
    const targetCard = cards[Math.floor(Math.random() * cards.length)];
    const cardRect = targetCard.getBoundingClientRect();

    // 카드 중심 좌표
    const targetX = cardRect.left + cardRect.width / 2;
    const targetY = cardRect.top + cardRect.height / 2;

    // 유성 시작 위치 (화면 밖 랜덤)
    const side = Math.floor(Math.random() * 3);
    let startX, startY;

    if (side === 0) {
      startX = Math.random() * window.innerWidth;
      startY = -50;
    } else if (side === 1) {
      startX = window.innerWidth + 50;
      startY = Math.random() * window.innerHeight * 0.5;
    } else {
      startX = window.innerWidth * 0.5 + Math.random() * window.innerWidth * 0.5;
      startY = -50;
    }

    // 유성 생성
    const meteor = document.createElement('div');
    meteor.className = 'meteor';
    meteor.style.left = startX + 'px';
    meteor.style.top = startY + 'px';

    // 유성 방향에 따른 꼬리 회전
    const angle = Math.atan2(targetY - startY, targetX - startX);
    meteor.style.transform = `rotate(${angle}rad)`;

    document.body.appendChild(meteor);

    // 유성 애니메이션
    const duration = 0.8 + Math.random() * 0.4;

    gsap.to(meteor, {
      left: targetX,
      top: targetY,
      duration: duration,
      ease: 'power2.in',
      onComplete: () => {
        meteor.remove();
        createImpactEffect(targetX, targetY);
        shakeCard(targetCard);
      }
    });
  }

  /**
   * 충돌 효과
   */
  function createImpactEffect(x, y) {
    // 스파크 생성
    const spark = document.createElement('div');
    spark.className = 'impact-spark';
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    document.body.appendChild(spark);

    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'spark-particle';
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 40;

      spark.appendChild(particle);

      gsap.fromTo(particle,
        { x: 0, y: 0, scale: 1, opacity: 1 },
        {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out'
        }
      );
    }

    setTimeout(() => spark.remove(), 600);
  }

  /**
   * 카드 흔들기
   */
  function shakeCard(card) {
    if (card.classList.contains('shake')) return;
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 600);
  }

  /**
   * 별 날아오기 효과 (아바타 클릭 시)
   * 왼쪽 상단에서 별이 날아와서 화면을 스쳐 지나감
   */
  function createStarFlyby() {
    const container = document.createElement('div');
    container.className = 'star-flyby-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10000;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    // 별 생성 (SVG 별 모양)
    const star = document.createElement('div');
    const color = '#FFD700'; // 금색 별

    star.innerHTML = `
      <svg viewBox="0 0 24 24" fill="${color}" style="width:100%;height:100%;filter:drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color});">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `;

    star.style.cssText = `
      position: absolute;
      left: -50px;
      top: -50px;
      width: 20px;
      height: 20px;
      opacity: 0;
    `;

    container.appendChild(star);

    // 끝 위치 (오른쪽 하단 바깥으로)
    const endX = window.innerWidth + 100;
    const endY = window.innerHeight + 100;

    // 애니메이션
    const timeline = gsap.timeline();

    // Phase 1: 왼쪽 상단에서 나타남 (작고 멀리)
    timeline.to(star, {
      left: 50,
      top: 50,
      opacity: 0.5,
      width: 15,
      height: 15,
      duration: 0.3,
      ease: 'power1.out'
    });

    // Phase 2: 화면 중앙으로 다가오면서 커짐
    timeline.to(star, {
      left: window.innerWidth * 0.4,
      top: window.innerHeight * 0.4,
      opacity: 1,
      width: 60,
      height: 60,
      rotation: 180,
      duration: 1.5,
      ease: 'power1.in'
    });

    // Phase 3: 빠르게 지나쳐서 오른쪽 하단으로 사라짐
    timeline.to(star, {
      left: endX,
      top: endY,
      opacity: 0,
      width: 150,
      height: 150,
      rotation: 360,
      duration: 0.5,
      ease: 'power2.in'
    });

    // 정리
    timeline.eventCallback('onComplete', () => {
      setTimeout(() => container.remove(), 100);
    });
  }

  // Public API
  return {
    createClickEffect: createClickEffect,
    startMeteorShower: startMeteorShower,
    createMeteor: createMeteor,
    createImpactEffect: createImpactEffect,
    shakeCard: shakeCard,
    createStarFlyby: createStarFlyby
  };
})();
