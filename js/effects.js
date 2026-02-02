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
        wakeUpCard(targetCard); // 유성 맞으면 잠에서 깨움
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

  // ===== 까마귀 카드 도둑 시스템 =====

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

  // ===== 고양이 발자국 시스템 =====

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

  // ===== 카드 잠들기 시스템 =====
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

  // ===== UFO & 문어 우주인 시스템 =====

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
   */
  function walkOnCard(alien, cardRect, onComplete) {
    const leftBound = cardRect.left + 10;
    const rightBound = cardRect.left + cardRect.width - 30;
    const walkY = cardRect.top + 10;

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
    createStarFlyby: createStarFlyby,
    startUfoVisits: startUfoVisits,
    createUfoEvent: createUfoEvent,
    startCardSleepSystem: startCardSleepSystem,
    wakeUpCard: wakeUpCard,
    resetAllCardTimers: resetAllCardTimers,
    startCrowAttacks: startCrowAttacks,
    createCrowAttack: createCrowAttack,
    startCatPaws: startCatPaws,
    createCatPawEvent: createCatPawEvent
  };
})();
