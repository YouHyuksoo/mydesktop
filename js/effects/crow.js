/**
 * @file js/effects/crow.js
 * @description 까마귀 카드 도둑 시스템
 *
 * 초보자 가이드:
 * 1. 까마귀가 날아와 카드를 물고 감
 * 2. 클릭하면 카드를 되찾을 수 있음
 * 3. 놓치면 3초 후 자동 복구
 */

window.App = window.App || {};
window.App.Effects = window.App.Effects || {};

(function() {
  'use strict';

  /**
   * 까마귀 습격 시스템 시작
   */
  function startCrowAttacks() {
    function scheduleNextCrow() {
      // 2분 ~ 5분 간격으로 까마귀 출현 (가끔)
      const delay = 120000 + Math.random() * 180000;
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          createCrowAttack();
        }
        scheduleNextCrow();
      }, delay);
    }
    // 첫 까마귀는 1분 후
    setTimeout(scheduleNextCrow, 60000);
  }

  /**
   * 까마귀 습격 이벤트
   */
  function createCrowAttack() {
    const activeSection = document.querySelector('.section-cards.active');
    if (!activeSection) return;

    const cards = activeSection.querySelectorAll('.shortcut-card:not(.stolen)');
    if (cards.length === 0) return;

    // 랜덤 카드 선택
    const targetCard = cards[Math.floor(Math.random() * cards.length)];
    const cardRect = targetCard.getBoundingClientRect();

    // 까마귀 생성
    const crow = document.createElement('div');
    crow.className = 'crow';
    crow.innerHTML = `
      <div class="crow-body">
        <div class="crow-head">
          <div class="crow-beak"></div>
          <div class="crow-eye"></div>
        </div>
        <div class="crow-wing left"></div>
        <div class="crow-wing right"></div>
        <div class="crow-tail"></div>
      </div>
    `;
    document.body.appendChild(crow);

    // 시작 위치 (화면 왼쪽 위 또는 오른쪽 위)
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -100 : window.innerWidth + 100;
    const startY = -50;

    gsap.set(crow, {
      left: startX,
      top: startY,
      scale: 0.8
    });

    // 클릭 가능하게
    crow.style.pointerEvents = 'auto';
    crow.style.cursor = 'pointer';

    let isStolen = false;
    let cardClone = null;

    // 까마귀 클릭하면 카드 되찾기
    crow.addEventListener('click', () => {
      if (!isStolen) return;

      // 까마귀 놀라서 도망
      crow.classList.add('scared');
      gsap.to(crow, {
        top: -200,
        left: fromLeft ? -200 : window.innerWidth + 200,
        rotation: fromLeft ? -30 : 30,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => crow.remove()
      });

      // 카드 원래 자리로 복귀
      if (cardClone) {
        const originalRect = targetCard.getBoundingClientRect();
        gsap.to(cardClone, {
          left: originalRect.left,
          top: originalRect.top,
          rotation: 0,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          onComplete: () => {
            cardClone.remove();
            targetCard.classList.remove('stolen');
            targetCard.style.visibility = 'visible';

            // 보너스 이펙트!
            createRecoverEffect(targetCard);
          }
        });
      }
    });

    // Phase 1: 까마귀가 카드 위로 날아옴
    const timeline = gsap.timeline();

    // 날아오기
    timeline.to(crow, {
      left: cardRect.left + cardRect.width / 2 - 25,
      top: cardRect.top - 60,
      duration: 1.5,
      ease: 'power2.out'
    });

    // 맴돌기 (카드 주위를 빙글빙글)
    timeline.to(crow, {
      left: cardRect.left + cardRect.width - 20,
      top: cardRect.top - 40,
      duration: 0.4,
      ease: 'sine.inOut'
    });

    timeline.to(crow, {
      left: cardRect.left - 10,
      top: cardRect.top - 50,
      duration: 0.4,
      ease: 'sine.inOut'
    });

    // Phase 2: 카드 낚아채기
    timeline.to(crow, {
      left: cardRect.left + cardRect.width / 2 - 25,
      top: cardRect.top,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        isStolen = true;
        targetCard.classList.add('stolen');

        // 카드 클론 생성 (까마귀가 물고 가는 것처럼)
        cardClone = targetCard.cloneNode(true);
        cardClone.className = 'shortcut-card stolen-card';

        // 까마귀 현재 위치 가져오기
        const crowLeft = gsap.getProperty(crow, 'left');
        const crowTop = gsap.getProperty(crow, 'top');

        cardClone.style.cssText = `
          position: fixed;
          left: ${crowLeft + 10}px;
          top: ${crowTop + 40}px;
          width: ${cardRect.width}px;
          height: ${cardRect.height}px;
          z-index: 9999;
          pointer-events: none;
          transform: scale(0.7);
        `;
        document.body.appendChild(cardClone);

        // 원본 카드 숨기기
        targetCard.style.visibility = 'hidden';
      }
    });

    // Phase 2.5: 카드 물고 잠깐 멈칫 (득의양양)
    timeline.to(crow, {
      y: -10,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: function() {
        if (cardClone && isStolen) {
          const crowLeft = gsap.getProperty(crow, 'left');
          const crowTop = gsap.getProperty(crow, 'top');
          gsap.set(cardClone, {
            left: crowLeft + 10,
            top: crowTop + 40
          });
        }
      }
    });

    timeline.to(crow, {
      y: 0,
      duration: 0.2,
      ease: 'power2.in',
      onUpdate: function() {
        if (cardClone && isStolen) {
          const crowLeft = gsap.getProperty(crow, 'left');
          const crowTop = gsap.getProperty(crow, 'top');
          gsap.set(cardClone, {
            left: crowLeft + 10,
            top: crowTop + 40
          });
        }
      }
    });

    // Phase 3: 카드 들고 천천히 날아가기
    timeline.to(crow, {
      left: fromLeft ? window.innerWidth + 200 : -200,
      top: -100,
      rotation: fromLeft ? 15 : -15,
      duration: 4,
      ease: 'power1.inOut',
      onUpdate: function() {
        // 카드도 함께 이동
        if (cardClone && isStolen) {
          const crowLeft = gsap.getProperty(crow, 'left');
          const crowTop = gsap.getProperty(crow, 'top');
          const crowRotation = gsap.getProperty(crow, 'rotation');
          gsap.set(cardClone, {
            left: crowLeft + 10,
            top: crowTop + 40,
            rotation: crowRotation * 0.5
          });
        }
      },
      onComplete: () => {
        crow.remove();
        // 클릭 못했으면 카드 영구 손실 (농담, 3초 후 복구)
        if (cardClone && isStolen) {
          setTimeout(() => {
            if (cardClone && document.body.contains(cardClone)) {
              cardClone.remove();
              targetCard.classList.remove('stolen');
              targetCard.style.visibility = 'visible';

              // 카드 돌아오는 효과
              gsap.fromTo(targetCard,
                { scale: 0, rotation: 360 },
                { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }
              );
            }
          }, 3000);
        }
      }
    });

    // 날개짓 애니메이션
    const wings = crow.querySelectorAll('.crow-wing');
    gsap.to(wings, {
      rotation: (i) => i === 0 ? -30 : 30,
      duration: 0.15,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }

  /**
   * 카드 되찾기 보너스 이펙트
   * @param {HTMLElement} card - 되찾은 카드
   */
  function createRecoverEffect(card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 별 파티클 생성
    for (let i = 0; i < 12; i++) {
      const star = document.createElement('div');
      star.innerHTML = '⭐';
      star.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        font-size: 20px;
        pointer-events: none;
        z-index: 10000;
      `;
      document.body.appendChild(star);

      const angle = (i / 12) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;

      gsap.to(star, {
        left: centerX + Math.cos(angle) * distance,
        top: centerY + Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        rotation: 360,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => star.remove()
      });
    }

    // 카드 반짝임
    gsap.to(card, {
      boxShadow: '0 0 50px gold, 0 0 100px gold',
      duration: 0.3,
      yoyo: true,
      repeat: 3,
      ease: 'power2.inOut'
    });

    // 토스트 메시지
    if (App.showToast) {
      App.showToast('🎉 카드를 되찾았다!');
    }
  }

  // Export
  App.Effects.startCrowAttacks = startCrowAttacks;
  App.Effects.createCrowAttack = createCrowAttack;
})();
