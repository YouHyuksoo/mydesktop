/**
 * @file js/widgets.js
 * @description 위젯 관련 함수들 - 시계, 시스템 정보, 배터리 등
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 시스템 정보를 표시하는 위젯 업데이트 함수들
 * 2. **사용 방법**: App.Widgets.updateClock() 등으로 호출
 * 3. **의존성**: App 네임스페이스가 먼저 정의되어 있어야 함
 */

(function() {
  'use strict';

  // App 네임스페이스 확인
  window.App = window.App || {};

  /**
   * 시계 업데이트
   * 현재 시간과 날짜를 화면에 표시
   */
  function updateClock() {
    const now = new Date();
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * 시스템 정보 초기화
   * CPU 코어, 네트워크, 배터리, 메모리 정보 설정
   */
  function initSystemInfo() {
    // CPU 코어 수
    const cores = navigator.hardwareConcurrency || '--';
    document.getElementById('cores-value').textContent = cores;

    // 네트워크 정보
    if ('connection' in navigator) {
      updateNetwork();
      navigator.connection.addEventListener('change', updateNetwork);
    } else {
      document.getElementById('network-row').style.display = 'none';
    }

    // 배터리
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        updateBattery(battery);
        battery.addEventListener('levelchange', () => updateBattery(battery));
        battery.addEventListener('chargingchange', () => updateBattery(battery));
      });
    } else {
      document.getElementById('battery-row').style.display = 'none';
    }

    // JS 힙 메모리 (Chrome만)
    if (performance.memory) {
      updateMemory();
      setInterval(updateMemory, 2000);
    } else {
      document.getElementById('memory-row').style.display = 'none';
    }
  }

  /**
   * 네트워크 정보 업데이트
   */
  function updateNetwork() {
    const conn = navigator.connection;
    if (!conn) return;

    let info = conn.effectiveType?.toUpperCase() || '--';
    if (conn.downlink) {
      info += ` ${conn.downlink}Mbps`;
    }
    document.getElementById('network-value').textContent = info;

    // 연결 상태에 따른 아이콘
    const icon = document.querySelector('#network-row .system-icon');
    if (conn.effectiveType === '4g') icon.textContent = '📶';
    else if (conn.effectiveType === '3g') icon.textContent = '📵';
    else if (conn.effectiveType === '2g') icon.textContent = '📵';
    else icon.textContent = '📶';
  }

  /**
   * 배터리 정보 업데이트
   * @param {BatteryManager} battery - 배터리 매니저 객체
   */
  function updateBattery(battery) {
    const level = Math.round(battery.level * 100);
    document.getElementById('battery-value').textContent = level + '%';
    document.getElementById('battery-bar').style.width = level + '%';

    const row = document.getElementById('battery-row');
    if (battery.charging) {
      row.classList.add('battery-charging');
      document.querySelector('#battery-row .system-icon').textContent = '⚡';
    } else {
      row.classList.remove('battery-charging');
      document.querySelector('#battery-row .system-icon').textContent = level <= 20 ? '🪫' : '🔋';
    }
  }

  /**
   * 메모리 사용량 업데이트 (Chrome 전용)
   */
  function updateMemory() {
    if (!performance.memory) return;

    const used = performance.memory.usedJSHeapSize;
    const total = performance.memory.jsHeapSizeLimit;
    const usedMB = Math.round(used / 1024 / 1024);
    const percent = Math.round((used / total) * 100);

    document.getElementById('memory-value').textContent = usedMB + 'MB';
    document.getElementById('memory-bar').style.width = percent + '%';
  }

  // App.Widgets로 export
  App.Widgets = {
    updateClock: updateClock,
    initSystemInfo: initSystemInfo,
    updateNetwork: updateNetwork,
    updateBattery: updateBattery,
    updateMemory: updateMemory
  };

})();
