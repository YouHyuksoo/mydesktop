/**
 * @file js/effects/index.js
 * @description 이펙트 모듈 통합 - 모든 시각 효과 초기화
 *
 * 초보자 가이드:
 * 1. 이 파일은 모든 이펙트 모듈을 통합함
 * 2. App.Effects.init()으로 모든 자동 이펙트 시작
 * 3. 개별 이펙트는 각 모듈에서 export됨
 *
 * 모듈 목록:
 * - click-effects.js  : 클릭 리플/파티클
 * - meteor.js         : 유성 샤워 (카드 충돌)
 * - crow.js           : 까마귀 카드 도둑
 * - cat-paws.js       : 고양이 발자국
 * - card-sleep.js     : 카드 잠들기 시스템
 * - ufo-alien.js      : UFO & 문어 우주인
 * - star-flyby.js     : 별 날아오기
 * - dragon.js         : 드래곤 습격
 * - wolf.js           : 늑대 등장
 * - meteor-impact.js  : 유성 화면 충돌
 */

window.App = window.App || {};
window.App.Effects = window.App.Effects || {};

(function() {
  'use strict';

  /**
   * 모든 자동 이펙트 시스템 초기화
   * (기존 effects.js의 init 로직을 여기서 통합)
   */
  function init() {
    // 유성 샤워 시작
    if (App.Effects.startMeteorShower) {
      App.Effects.startMeteorShower();
    }

    // 까마귀 습격 시작
    if (App.Effects.startCrowAttacks) {
      App.Effects.startCrowAttacks();
    }

    // 고양이 발자국 시작
    if (App.Effects.startCatPaws) {
      App.Effects.startCatPaws();
    }

    // 카드 잠들기 시스템 시작
    if (App.Effects.startCardSleepSystem) {
      App.Effects.startCardSleepSystem();
    }

    // UFO 방문 시작
    if (App.Effects.startUfoVisits) {
      App.Effects.startUfoVisits();
    }

    // 드래곤 습격 시작
    if (App.Effects.startDragonAttacks) {
      App.Effects.startDragonAttacks();
    }

    // 유성 화면 충돌 시작
    if (App.Effects.startMeteorImpacts) {
      App.Effects.startMeteorImpacts();
    }

    console.log('[Effects] All effect systems initialized');
  }

  // Export init function
  App.Effects.init = init;
})();
