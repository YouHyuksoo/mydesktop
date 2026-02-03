/**
 * @file js/handlers/protocol-handler.js
 * @description 프로토콜 핸들러 및 북마클릿 관련 기능
 */

window.App = window.App || {};
window.App.Handlers = window.App.Handlers || {};

(function() {
  'use strict';

  /**
   * 프로토콜 핸들러 모달 열기
   */
  function openProtocolModal() {
    App.UI.hideSettingsMenu();

    const urlInput = document.getElementById('protocol-base-url');
    const bookmarkletContainer = document.getElementById('bookmarklet-container');

    // 저장된 URL 불러오기
    const savedUrl = localStorage.getItem('mydesktop-protocol-url') || '';
    urlInput.value = savedUrl;

    // 현재 페이지가 http/https면 자동으로 채우기
    if (!savedUrl && window.location.protocol.startsWith('http')) {
      urlInput.value = window.location.origin + window.location.pathname;
    }

    // URL이 있으면 북마클릿 표시
    if (urlInput.value && urlInput.value.startsWith('http')) {
      updateBookmarklet(urlInput.value);
      bookmarkletContainer.style.display = 'block';
    } else {
      bookmarkletContainer.style.display = 'none';
    }

    // 모달 열기
    document.getElementById('protocol-modal').classList.add('active');
  }

  /**
   * 북마클릿 코드 업데이트
   * @param {string} baseUrl - 기본 URL
   */
  function updateBookmarklet(baseUrl) {
    // URL 끝에 슬래시 없으면 추가
    if (!baseUrl.endsWith('/') && !baseUrl.endsWith('.html')) {
      baseUrl = baseUrl + '/';
    }

    const bookmarkletCode = `javascript:(function(){window.open('${baseUrl}?add=1&url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank')})();`;

    const bookmarkletLink = document.getElementById('bookmarklet-link');
    if (bookmarkletLink) {
      bookmarkletLink.href = bookmarkletCode;
      bookmarkletLink.dataset.code = bookmarkletCode;
    }

    // URL 저장
    localStorage.setItem('mydesktop-protocol-url', baseUrl);
  }

  /**
   * 북마클릿 코드 복사
   */
  function copyBookmarkletCode() {
    const bookmarkletLink = document.getElementById('bookmarklet-link');
    const code = bookmarkletLink.dataset.code;

    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        App.showToast('북마클릿 코드 복사됨!');
      }).catch(async () => {
        await App.showAlert('클립보드 복사 실패. 아래 링크를 수동으로 북마크 바에 드래그하세요.', { title: '복사 실패' });
      });
    }
  }

  /**
   * 프로토콜 핸들러 모달 닫기
   */
  function closeProtocolModal() {
    document.getElementById('protocol-modal').classList.remove('active');
  }

  /**
   * URL 파라미터로 전달된 바로가기 처리
   */
  function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('add') === '1') {
      const url = params.get('url');
      const title = params.get('title');

      // URL 파라미터 제거 (히스토리 정리)
      window.history.replaceState({}, document.title, window.location.pathname);

      // 약간의 딜레이 후 모달 열기 (앱 초기화 완료 대기)
      setTimeout(() => {
        // 바로가기 추가 모달 열기
        if (App.UI && App.UI.openAddModal) {
          App.UI.openAddModal();
        } else {
          document.getElementById('shortcut-modal').classList.add('active');
          document.getElementById('modal-title').textContent = 'Add Shortcut';
          document.getElementById('modal-delete').style.display = 'none';
        }

        // 필드 채우기
        if (url) {
          document.getElementById('shortcut-url').value = decodeURIComponent(url);
        }
        if (title) {
          document.getElementById('shortcut-title').value = decodeURIComponent(title);
        }

        // 아이콘 자동 추천 (도메인 기반)
        if (url) {
          try {
            const domain = new URL(decodeURIComponent(url)).hostname.replace('www.', '');
            const brandName = domain.split('.')[0];
            document.getElementById('shortcut-icon').value = `si:${brandName}`;
          } catch (e) {
            // URL 파싱 실패시 무시
          }
        }

        App.showToast('사이트 정보를 가져왔어요!');
      }, 800);
    }
  }

  // Export
  App.Handlers.openProtocolModal = openProtocolModal;
  App.Handlers.updateBookmarklet = updateBookmarklet;
  App.Handlers.copyBookmarkletCode = copyBookmarkletCode;
  App.Handlers.closeProtocolModal = closeProtocolModal;
  App.Handlers.handleUrlParams = handleUrlParams;
})();
