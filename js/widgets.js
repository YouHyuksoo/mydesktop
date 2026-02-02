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

  /**
   * 날씨 코드를 이모지로 변환
   */
  function getWeatherEmoji(code) {
    const weatherEmojis = {
      '113': '☀️',  // Sunny
      '116': '⛅',  // Partly cloudy
      '119': '☁️',  // Cloudy
      '122': '☁️',  // Overcast
      '143': '🌫️', // Mist
      '176': '🌦️', // Patchy rain
      '179': '🌨️', // Patchy snow
      '182': '🌧️', // Patchy sleet
      '185': '🌧️', // Patchy freezing drizzle
      '200': '⛈️', // Thundery outbreaks
      '227': '🌨️', // Blowing snow
      '230': '❄️',  // Blizzard
      '248': '🌫️', // Fog
      '260': '🌫️', // Freezing fog
      '263': '🌧️', // Patchy light drizzle
      '266': '🌧️', // Light drizzle
      '281': '🌧️', // Freezing drizzle
      '284': '🌧️', // Heavy freezing drizzle
      '293': '🌧️', // Patchy light rain
      '296': '🌧️', // Light rain
      '299': '🌧️', // Moderate rain at times
      '302': '🌧️', // Moderate rain
      '305': '🌧️', // Heavy rain at times
      '308': '🌧️', // Heavy rain
      '311': '🌧️', // Light freezing rain
      '314': '🌧️', // Moderate or heavy freezing rain
      '317': '🌧️', // Light sleet
      '320': '🌧️', // Moderate or heavy sleet
      '323': '🌨️', // Patchy light snow
      '326': '🌨️', // Light snow
      '329': '🌨️', // Patchy moderate snow
      '332': '🌨️', // Moderate snow
      '335': '🌨️', // Patchy heavy snow
      '338': '❄️',  // Heavy snow
      '350': '🌧️', // Ice pellets
      '353': '🌧️', // Light rain shower
      '356': '🌧️', // Moderate or heavy rain shower
      '359': '🌧️', // Torrential rain shower
      '362': '🌧️', // Light sleet showers
      '365': '🌧️', // Moderate or heavy sleet showers
      '368': '🌨️', // Light snow showers
      '371': '🌨️', // Moderate or heavy snow showers
      '374': '🌧️', // Light showers of ice pellets
      '377': '🌧️', // Moderate or heavy showers of ice pellets
      '386': '⛈️', // Patchy light rain with thunder
      '389': '⛈️', // Moderate or heavy rain with thunder
      '392': '⛈️', // Patchy light snow with thunder
      '395': '⛈️'  // Moderate or heavy snow with thunder
    };
    return weatherEmojis[code] || '🌤️';
  }

  /**
   * 날씨 업데이트 (wttr.in API 사용)
   */
  function updateWeather() {
    // 저장된 위치 또는 기본값 사용
    const savedLocation = localStorage.getItem('mydesktop-weather-location') || 'Seoul';

    fetch(`https://wttr.in/${encodeURIComponent(savedLocation)}?format=j1`)
      .then(res => res.json())
      .then(data => {
        const current = data.current_condition[0];
        const location = data.nearest_area[0];

        // 온도
        document.getElementById('weather-temp').textContent = current.temp_C + '°';

        // 날씨 아이콘
        const weatherCode = current.weatherCode;
        document.getElementById('weather-icon').textContent = getWeatherEmoji(weatherCode);

        // 날씨 설명
        const desc = current.weatherDesc[0].value;
        document.getElementById('weather-desc').textContent = desc;

        // 위치
        const city = location.areaName[0].value;
        document.getElementById('weather-location').textContent = city;
      })
      .catch(err => {
        console.error('Weather fetch error:', err);
        document.getElementById('weather-desc').textContent = '날씨 로드 실패';
      });
  }

  /**
   * 날씨 위젯 초기화
   */
  function initWeather() {
    updateWeather();
    // 30분마다 업데이트
    setInterval(updateWeather, 30 * 60 * 1000);

    // 클릭해서 도시 변경
    const weatherWidget = document.getElementById('weather-widget');
    if (weatherWidget) {
      weatherWidget.addEventListener('click', changeWeatherLocation);
    }
  }

  /**
   * 날씨 도시 변경
   */
  async function changeWeatherLocation() {
    const currentLocation = localStorage.getItem('mydesktop-weather-location') || 'Seoul';
    const newLocation = await App.showPrompt('날씨를 확인할 도시를 입력하세요:\n(영문 도시명 권장: Seoul, Busan, Tokyo, NewYork 등)', currentLocation, { title: '날씨 위치 변경', placeholder: 'Seoul' });

    if (newLocation && newLocation.trim()) {
      localStorage.setItem('mydesktop-weather-location', newLocation.trim());
      document.getElementById('weather-desc').textContent = '로딩 중...';
      updateWeather();
      if (App.showToast) {
        App.showToast(`날씨 위치: ${newLocation.trim()}`);
      }
    }
  }

  // App.Widgets로 export
  App.Widgets = {
    updateClock: updateClock,
    initSystemInfo: initSystemInfo,
    updateNetwork: updateNetwork,
    updateBattery: updateBattery,
    updateMemory: updateMemory,
    initWeather: initWeather,
    updateWeather: updateWeather
  };

})();
