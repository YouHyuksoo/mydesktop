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

  // Public API
  return {
    createClickEffect: createClickEffect,
    startMeteorShower: startMeteorShower,
    createMeteor: createMeteor,
    createImpactEffect: createImpactEffect,
    shakeCard: shakeCard
  };
})();
