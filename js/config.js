/**
 * @file js/config.js
 * @description 애플리케이션 전역 설정 및 상수 정의
 *
 * 초보자 가이드:
 * 1. **주요 개념**: 모든 설정값과 상수를 중앙 집중 관리
 * 2. **사용 방법**: App.Config.SECTIONS, App.Config.COLORS 등으로 접근
 * 3. **수정 방법**: 새 섹션 추가 시 SECTIONS 배열에 추가, 새 테마 추가 시 GLOW_THEMES에 추가
 */

// 전역 네임스페이스 초기화
window.App = window.App || {};

/**
 * 애플리케이션 설정 모듈
 * @namespace App.Config
 */
App.Config = (function() {
  'use strict';

  /**
   * 섹션 정의 - 대시보드의 카테고리들
   * @type {Array<{id: number, name: string, subtitle: string}>}
   */
  const SECTIONS = [
    { id: 0, name: 'FAVORITES', subtitle: 'Your most used sites' },
    { id: 1, name: 'SOCIAL', subtitle: 'Stay connected' },
    { id: 2, name: 'WORK', subtitle: 'Productivity tools' },
    { id: 3, name: 'ENTERTAINMENT', subtitle: 'Relax & enjoy' },
    { id: 4, name: 'DESKTOP', subtitle: 'Windows apps & tools' },
    { id: 5, name: 'OFFICE', subtitle: 'Microsoft Office apps' }
  ];

  /**
   * 색상 팔레트 - 바로가기 카드 색상 선택용
   * @type {Array<string>}
   */
  const COLORS = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff8c00', '#a55eea', '#26de81'];

  /**
   * 기본 바로가기 목록
   * @type {Array<{id: string, title: string, url: string, color: string, icon: string, layer: number}>}
   */
  const DEFAULT_SHORTCUTS = [
    { id: '1', title: 'Google', url: 'https://google.com', color: '#4285F4', icon: 'si:google', layer: 0 },
    { id: '2', title: 'Gmail', url: 'https://mail.google.com', color: '#EA4335', icon: 'si:gmail', layer: 0 },
    { id: '3', title: 'ChatGPT', url: 'https://chatgpt.com', color: '#10A37F', icon: 'svg:chatgpt', layer: 0 },
    { id: '28', title: 'Perplexity', url: 'https://perplexity.ai', color: '#1FB8CD', icon: 'si:perplexity', layer: 0 },
    { id: '4', title: '카카오톡', url: 'kakaotalk://', color: '#FEE500', icon: 'si:kakaotalk', layer: 1 },
    { id: '5', title: 'Twitter', url: 'https://twitter.com', color: '#000000', icon: 'si:x', layer: 1 },
    { id: '6', title: 'Discord', url: 'https://discord.com', color: '#5865F2', icon: 'si:discord', layer: 1 },
    { id: '13', title: 'LinkedIn', url: 'https://linkedin.com', color: '#0A66C2', icon: 'si:linkedin', layer: 1 },
    { id: '7', title: 'GitHub', url: 'https://github.com', color: '#181717', icon: 'si:github', layer: 2 },
    { id: '8', title: 'Notion', url: 'https://notion.so', color: '#000000', icon: 'si:notion', layer: 2 },
    { id: '9', title: 'Figma', url: 'https://figma.com', color: '#F24E1E', icon: 'si:figma', layer: 2 },
    { id: '10', title: 'YouTube', url: 'https://youtube.com', color: '#FF0000', icon: 'si:youtube', layer: 3 },
    { id: '11', title: 'Netflix', url: 'https://netflix.com', color: '#E50914', icon: 'si:netflix', layer: 3 },
    { id: '12', title: 'Spotify', url: 'https://spotify.com', color: '#1DB954', icon: 'si:spotify', layer: 3 },
    { id: '14', title: '계산기', url: 'calculator://', color: '#00BCF2', icon: 'svg:calculator', layer: 4 },
    { id: '15', title: '설정', url: 'ms-settings://', color: '#0078D4', icon: 'svg:settings', layer: 4 },
    { id: '16', title: '스토어', url: 'ms-windows-store://', color: '#107C10', icon: 'svg:store', layer: 4 },
    { id: '17', title: '알람/시계', url: 'ms-clock://', color: '#767676', icon: 'svg:clock', layer: 4 },
    { id: '18', title: '캡처도구', url: 'ms-screenclip://', color: '#F7630C', icon: 'svg:scissors', layer: 4 },
    { id: '19', title: '날씨', url: 'msnweather://', color: '#4A90D9', icon: 'svg:weather', layer: 4 },
    { id: '20', title: 'Edge', url: 'microsoft-edge://', color: '#0078D4', icon: 'svg:edge', layer: 4 },
    { id: '21', title: '사진', url: 'ms-photos://', color: '#FFB900', icon: 'svg:image', layer: 4 },
    { id: '22', title: 'Word', url: 'https://www.office.com/launch/word', color: '#2B579A', icon: 'svg:word', layer: 5 },
    { id: '23', title: 'Excel', url: 'https://www.office.com/launch/excel', color: '#217346', icon: 'svg:excel', layer: 5 },
    { id: '24', title: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', color: '#D24726', icon: 'svg:powerpoint', layer: 5 },
    { id: '25', title: 'Outlook', url: 'https://outlook.live.com', color: '#0078D4', icon: 'svg:outlook', layer: 5 },
    { id: '26', title: 'OneNote', url: 'https://www.onenote.com/notebooks', color: '#7719AA', icon: 'svg:onenote', layer: 5 },
    { id: '27', title: 'Teams', url: 'https://teams.microsoft.com', color: '#6264A7', icon: 'svg:teams', layer: 5 }
  ];

  /**
   * 글로우 테마 정의 - 색상 테마별 설정
   * @type {Object<string, {primary: string, secondary: string, orbs: Array<string>}>}
   */
  const GLOW_THEMES = {
    gold: {
      primary: '#ffd700',
      secondary: '#ff8c00',
      orbs: ['rgba(255, 215, 0, 0.4)', 'rgba(255, 140, 0, 0.3)', 'rgba(255, 100, 100, 0.25)', 'rgba(255, 200, 100, 0.2)']
    },
    purple: {
      primary: '#a855f7',
      secondary: '#6366f1',
      orbs: ['rgba(168, 85, 247, 0.4)', 'rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.25)', 'rgba(192, 132, 252, 0.2)']
    },
    cyan: {
      primary: '#22d3ee',
      secondary: '#06b6d4',
      orbs: ['rgba(34, 211, 238, 0.4)', 'rgba(6, 182, 212, 0.3)', 'rgba(103, 232, 249, 0.25)', 'rgba(165, 243, 252, 0.2)']
    },
    pink: {
      primary: '#f472b6',
      secondary: '#ec4899',
      orbs: ['rgba(244, 114, 182, 0.4)', 'rgba(236, 72, 153, 0.3)', 'rgba(249, 168, 212, 0.25)', 'rgba(251, 207, 232, 0.2)']
    },
    green: {
      primary: '#4ade80',
      secondary: '#22c55e',
      orbs: ['rgba(74, 222, 128, 0.4)', 'rgba(34, 197, 94, 0.3)', 'rgba(134, 239, 172, 0.25)', 'rgba(187, 247, 208, 0.2)']
    },
    red: {
      primary: '#f87171',
      secondary: '#ef4444',
      orbs: ['rgba(248, 113, 113, 0.4)', 'rgba(239, 68, 68, 0.3)', 'rgba(252, 165, 165, 0.25)', 'rgba(254, 202, 202, 0.2)']
    },
    blue: {
      primary: '#60a5fa',
      secondary: '#3b82f6',
      orbs: ['rgba(96, 165, 250, 0.4)', 'rgba(59, 130, 246, 0.3)', 'rgba(147, 197, 253, 0.25)', 'rgba(191, 219, 254, 0.2)']
    },
    white: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      orbs: ['rgba(248, 250, 252, 0.3)', 'rgba(226, 232, 240, 0.25)', 'rgba(203, 213, 225, 0.2)', 'rgba(241, 245, 249, 0.15)']
    }
  };

  /**
   * 무지개 색상 배열 - 카드 무지개 스타일용
   * @type {Array<{r: number, g: number, b: number}>}
   */
  const RAINBOW_COLORS = [
    { r: 255, g: 107, b: 107 },  // red
    { r: 255, g: 159, b: 67 },   // orange
    { r: 255, g: 215, b: 0 },    // yellow
    { r: 78, g: 205, b: 196 },   // teal
    { r: 69, g: 183, b: 209 },   // blue
    { r: 165, g: 94, b: 234 },   // purple
    { r: 255, g: 107, b: 182 },  // pink
    { r: 38, g: 222, b: 129 },   // green
  ];

  /**
   * Three.js 터널 관련 상수
   * @type {Object}
   */
  const TUNNEL = {
    RING_COUNT: 40,
    RING_SPACING: 50,
    get LENGTH() { return this.RING_COUNT * this.RING_SPACING; }
  };

  /**
   * 코스믹 워프 관련 상수
   * @type {Object}
   */
  const WARP = {
    STAR_COUNT: 3000,
    LIMIT: 2000
  };

  // Public API
  return {
    SECTIONS: SECTIONS,
    COLORS: COLORS,
    DEFAULT_SHORTCUTS: DEFAULT_SHORTCUTS,
    GLOW_THEMES: GLOW_THEMES,
    RAINBOW_COLORS: RAINBOW_COLORS,
    TUNNEL: TUNNEL,
    WARP: WARP
  };
})();
