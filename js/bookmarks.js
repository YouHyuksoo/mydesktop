/**
 * @file js/bookmarks.js
 * @description Chrome 북마크 가져오기 모듈 - HTML 파싱 및 드래그앤드롭
 *
 * 초보자 가이드:
 * 1. **주요 개념**: Chrome 북마크 내보내기 HTML 파일을 파싱하거나 드래그앤드롭으로 북마크 추가
 * 2. **사용 방법**: App.Bookmarks.importFromFile(file), App.Bookmarks.handleDrop(e)
 * 3. **Chrome 북마크 형식**:
 *    - <DT><A HREF="url">제목</A> 형태로 북마크 저장
 *    - <DT><H3>폴더명</H3> 형태로 폴더 구분
 */

window.App = window.App || {};

App.Bookmarks = (function() {
  'use strict';

  // 파싱된 북마크 임시 저장
  let parsedBookmarks = [];
  let selectedCategoryId = 0;

  /**
   * Chrome 북마크 HTML 파싱
   * @param {string} html - 북마크 HTML 문자열
   * @returns {Array} 파싱된 북마크 배열 [{ title, url, folder, icon }]
   */
  function parseHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bookmarks = [];

    // 모든 <A> 태그 찾기 (북마크 링크)
    const links = doc.querySelectorAll('DT > A');

    links.forEach(link => {
      const url = link.getAttribute('HREF');
      const title = link.textContent.trim();
      const icon = link.getAttribute('ICON') || '';

      // 부모 폴더 찾기
      let folder = 'Other';
      let parent = link.parentElement;
      while (parent) {
        if (parent.tagName === 'DL') {
          const prevDt = parent.previousElementSibling;
          if (prevDt && prevDt.tagName === 'DT') {
            const h3 = prevDt.querySelector('H3');
            if (h3) {
              folder = h3.textContent.trim();
              break;
            }
          }
        }
        parent = parent.parentElement;
      }

      if (url && title) {
        bookmarks.push({ title, url, folder, icon });
      }
    });

    return bookmarks;
  }

  /**
   * 파일에서 북마크 가져오기
   * @param {File} file - HTML 파일
   * @returns {Promise<Array>} 파싱된 북마크 배열
   */
  function importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.name.endsWith('.html')) {
        reject(new Error('HTML 파일만 지원됩니다'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const html = e.target.result;
          const bookmarks = parseHTML(html);
          parsedBookmarks = bookmarks;
          resolve(bookmarks);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(file);
    });
  }

  /**
   * 드래그앤드롭 이벤트 처리
   * @param {DragEvent} e - 드롭 이벤트
   * @returns {Object|null} 드롭된 북마크 정보 { title, url }
   */
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    // URL 데이터 가져오기
    const url = e.dataTransfer.getData('text/uri-list') ||
                e.dataTransfer.getData('text/plain');

    if (!url || !url.startsWith('http')) {
      // 파일 드롭인지 확인
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.html')) {
          openImportModal();
          handleFileSelect({ target: { files: [file] } });
        }
      }
      return null;
    }

    // 제목 가져오기 (HTML에서)
    let title = '';
    const htmlData = e.dataTransfer.getData('text/html');
    if (htmlData) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlData, 'text/html');
      const link = doc.querySelector('a');
      if (link) {
        title = link.textContent.trim();
      }
    }

    // 제목이 없으면 URL에서 추출
    if (!title) {
      try {
        const urlObj = new URL(url);
        title = urlObj.hostname.replace('www.', '');
      } catch {
        title = 'New Bookmark';
      }
    }

    return { title, url };
  }

  /**
   * 파일 선택 처리
   * @param {Event} e - 파일 입력 이벤트
   */
  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const bookmarks = await importFromFile(file);
      renderPreview(bookmarks);
      App.showToast(`${bookmarks.length}개 북마크 발견`);
    } catch (err) {
      App.showToast('파일 파싱 실패: ' + err.message);
    }
  }

  /**
   * 가져오기 미리보기 렌더링
   * @param {Array} bookmarks - 북마크 배열
   */
  function renderPreview(bookmarks) {
    const preview = document.getElementById('import-preview');
    if (!preview) return;

    // 폴더별로 그룹화
    const folders = {};
    bookmarks.forEach(bm => {
      if (!folders[bm.folder]) {
        folders[bm.folder] = [];
      }
      folders[bm.folder].push(bm);
    });

    let html = '<div class="import-folders">';

    for (const [folder, items] of Object.entries(folders)) {
      html += `
        <div class="import-folder">
          <label class="import-folder-header">
            <input type="checkbox" class="folder-checkbox" data-folder="${folder}" checked>
            <span class="folder-name">📁 ${folder}</span>
            <span class="folder-count">(${items.length})</span>
          </label>
          <div class="import-items">
      `;

      items.forEach((item, idx) => {
        html += `
          <label class="import-item" data-url="${item.url}">
            <input type="checkbox" class="item-checkbox" data-folder="${folder}" data-idx="${idx}" checked>
            <span class="item-title">${item.title}</span>
          </label>
        `;
      });

      html += '</div></div>';
    }

    html += '</div>';

    // 카테고리 선택
    const categories = App.Categories ? App.Categories.getAll() : App.Config.SECTIONS;
    html += `
      <div class="import-category-select">
        <label>가져올 카테고리:</label>
        <select id="import-category">
          ${categories.map(cat => `<option value="${cat.id}">${cat.icon || ''} ${cat.name}</option>`).join('')}
        </select>
      </div>
      <div class="import-actions">
        <button class="modal-btn secondary" id="import-cancel-btn">취소</button>
        <button class="modal-btn primary" id="import-confirm-btn">가져오기</button>
      </div>
    `;

    preview.innerHTML = html;

    // 폴더 체크박스 이벤트
    preview.querySelectorAll('.folder-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const folder = e.target.dataset.folder;
        const checked = e.target.checked;
        preview.querySelectorAll(`.item-checkbox[data-folder="${folder}"]`).forEach(itemCb => {
          itemCb.checked = checked;
        });
      });
    });

    // 취소 버튼
    document.getElementById('import-cancel-btn').addEventListener('click', closeImportModal);

    // 가져오기 버튼
    document.getElementById('import-confirm-btn').addEventListener('click', () => {
      const categoryId = parseInt(document.getElementById('import-category').value);
      importSelected(categoryId);
    });
  }

  /**
   * 선택된 북마크 가져오기
   * @param {number} categoryId - 대상 카테고리 ID
   */
  function importSelected(categoryId) {
    const preview = document.getElementById('import-preview');
    if (!preview) return;

    const selected = [];
    preview.querySelectorAll('.item-checkbox:checked').forEach(cb => {
      const folder = cb.dataset.folder;
      const idx = parseInt(cb.dataset.idx);

      // parsedBookmarks에서 찾기
      const folders = {};
      parsedBookmarks.forEach(bm => {
        if (!folders[bm.folder]) folders[bm.folder] = [];
        folders[bm.folder].push(bm);
      });

      if (folders[folder] && folders[folder][idx]) {
        selected.push(folders[folder][idx]);
      }
    });

    // 바로가기에 추가
    addToShortcuts(selected, categoryId);
    closeImportModal();
    App.showToast(`${selected.length}개 북마크 추가됨`);
  }

  /**
   * 북마크를 바로가기에 추가
   * @param {Array} bookmarks - 북마크 배열
   * @param {number} categoryId - 카테고리 ID (layer)
   */
  function addToShortcuts(bookmarks, categoryId) {
    if (!App.State || !App.State.shortcuts) return;

    bookmarks.forEach(bm => {
      // 중복 체크
      const exists = App.State.shortcuts.some(s => s.url === bm.url);
      if (exists) return;

      // 색상 랜덤 선택
      const colors = App.Config.COLORS;
      const color = colors[Math.floor(Math.random() * colors.length)];

      App.State.shortcuts.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: bm.title,
        url: bm.url,
        color: color,
        icon: bm.icon || '',
        layer: categoryId
      });
    });

    App.saveShortcuts();

    if (App.Cards && App.Cards.renderCards) {
      App.Cards.renderCards();
    }
  }

  /**
   * 가져오기 모달 열기
   */
  function openImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
      modal.classList.add('active');
      parsedBookmarks = [];
      document.getElementById('import-preview').innerHTML = '';
    }
  }

  /**
   * 가져오기 모달 닫기
   */
  function closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    // 파일 입력 초기화
    const fileInput = document.getElementById('bookmark-file');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * 드래그앤드롭 존 초기화
   */
  function initDropzone() {
    const dropzone = document.getElementById('import-dropzone');
    const fileInput = document.getElementById('bookmark-file');

    if (!dropzone || !fileInput) return;

    // 클릭으로 파일 선택
    dropzone.addEventListener('click', () => fileInput.click());

    // 파일 선택 이벤트
    fileInput.addEventListener('change', handleFileSelect);

    // 드래그 이벤트
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');

      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.html')) {
        handleFileSelect({ target: { files: [file] } });
      }
    });
  }

  /**
   * 전역 드래그앤드롭 초기화 (북마크 바에서 직접 드래그)
   */
  function initGlobalDrop() {
    // 드래그 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'drop-overlay';
    overlay.innerHTML = '<div class="drop-overlay-content">📥 여기에 드롭하여 북마크 추가</div>';
    document.body.appendChild(overlay);

    let dragCounter = 0;

    // 전체 문서에서 드래그 감지
    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;

      // URL 드래그인지 확인
      if (e.dataTransfer.types.includes('text/uri-list') ||
          e.dataTransfer.types.includes('text/plain')) {
        overlay.classList.add('active');
      }
    });

    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;

      if (dragCounter === 0) {
        overlay.classList.remove('active');
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    document.addEventListener('drop', (e) => {
      dragCounter = 0;
      overlay.classList.remove('active');

      // 모달이나 다른 입력 영역에서는 무시
      if (e.target.closest('.modal') || e.target.closest('input')) {
        return;
      }

      const bookmark = handleDrop(e);
      if (bookmark) {
        // 바로가기 추가 모달 열기
        if (App.UI && App.UI.openModal) {
          App.UI.openModal();
          document.getElementById('shortcut-title').value = bookmark.title;
          document.getElementById('shortcut-url').value = bookmark.url;
        }
      }
    });
  }

  // Public API
  return {
    parseHTML: parseHTML,
    importFromFile: importFromFile,
    handleDrop: handleDrop,
    handleFileSelect: handleFileSelect,
    addToShortcuts: addToShortcuts,
    openImportModal: openImportModal,
    closeImportModal: closeImportModal,
    initDropzone: initDropzone,
    initGlobalDrop: initGlobalDrop
  };
})();
