# 리팩토링 계획서

## 현재 상태 분석

| 영역 | 줄 수 | 내용 |
|------|-------|------|
| CSS | ~1,500줄 | 스타일, 테마, 애니메이션, 반응형 |
| HTML | ~240줄 | 구조, 모달, 메뉴 |
| JavaScript | ~1,900줄 | 3D 공간, 카드, 캐러셀, 위젯, 이벤트 |
| **총계** | **3,652줄** | 단일 파일 |

---

## 제안 구조

```
mydesktop/
├── index.html              # HTML 구조만 (~250줄)
├── css/
│   ├── variables.css       # CSS 변수, 테마 색상
│   ├── base.css            # 기본 스타일, 리셋
│   ├── components/
│   │   ├── cards.css       # 카드 스타일
│   │   ├── carousel.css    # 캐러셀 스타일
│   │   ├── modal.css       # 모달 스타일
│   │   ├── menu.css        # 메뉴, 컨텍스트 메뉴
│   │   ├── widgets.css     # 위젯 (시계, 날씨 등)
│   │   └── buttons.css     # 버튼, FAB
│   ├── themes/
│   │   ├── apple.css       # Apple White 테마
│   │   └── cyberpunk.css   # Cyberpunk 테마
│   ├── animations.css      # 키프레임, 트랜지션
│   └── responsive.css      # 미디어 쿼리
│
├── js/
│   ├── config.js           # 상수, 설정, 기본값
│   ├── storage.js          # localStorage 관리
│   ├── space/
│   │   ├── renderer.js     # Three.js 렌더러 설정
│   │   ├── tunnel.js       # 클래식 터널 효과
│   │   └── warp.js         # 코스믹 워프 효과
│   ├── components/
│   │   ├── cards.js        # 카드 CRUD, 렌더링
│   │   ├── carousel.js     # 캐러셀 로직
│   │   ├── sections.js     # 섹션 전환
│   │   └── widgets.js      # 위젯 업데이트
│   ├── ui/
│   │   ├── modal.js        # 모달 열기/닫기
│   │   ├── menu.js         # 설정 메뉴
│   │   ├── toast.js        # 토스트 알림
│   │   └── contextMenu.js  # 우클릭 메뉴
│   ├── events/
│   │   ├── touch.js        # 터치/스와이프
│   │   ├── keyboard.js     # 키보드 단축키
│   │   └── mouse.js        # 마우스 이벤트
│   ├── utils/
│   │   ├── dom.js          # DOM 유틸리티
│   │   └── helpers.js      # 공통 헬퍼 함수
│   └── main.js             # 앱 초기화, 진입점
│
└── assets/
    └── icons/              # 아이콘 (선택사항)
```

---

## 모듈별 책임

### CSS 모듈

| 파일 | 책임 | 예상 줄 수 |
|------|------|-----------|
| `variables.css` | CSS 변수, 테마 색상 정의 | ~50 |
| `base.css` | body, 기본 요소 스타일 | ~80 |
| `cards.css` | 카드 컴포넌트 스타일 | ~200 |
| `carousel.css` | 캐러셀 네비게이션 | ~80 |
| `modal.css` | 모달 오버레이, 폼 | ~150 |
| `menu.css` | 드롭다운, 컨텍스트 메뉴 | ~180 |
| `widgets.css` | 시계, 날씨, 시스템 위젯 | ~120 |
| `buttons.css` | FAB, 버튼 스타일 | ~100 |
| `apple.css` | Apple White 테마 전용 | ~100 |
| `cyberpunk.css` | Cyberpunk 테마 전용 | ~150 |
| `animations.css` | @keyframes, 트랜지션 | ~150 |
| `responsive.css` | 미디어 쿼리 (모바일) | ~200 |

### JavaScript 모듈

| 파일 | 책임 | 예상 줄 수 |
|------|------|-----------|
| `config.js` | SECTIONS, DEFAULT_SHORTCUTS, 상수 | ~100 |
| `storage.js` | loadShortcuts, saveShortcuts, settings | ~80 |
| `renderer.js` | Three.js 초기화, 듀얼 렌더러 | ~120 |
| `tunnel.js` | createTunnel, animateTunnel | ~200 |
| `warp.js` | createCosmicWarp, animateWarp | ~180 |
| `cards.js` | createCard, renderCards, CRUD | ~250 |
| `carousel.js` | updateCarouselPosition, 회전 로직 | ~150 |
| `sections.js` | goToSection, animateCardsToSection | ~200 |
| `widgets.js` | updateClock, updateWeather, updateBattery | ~150 |
| `modal.js` | openModal, closeModal, 폼 처리 | ~150 |
| `menu.js` | 설정 메뉴, 서브메뉴 토글 | ~100 |
| `toast.js` | showToast 함수 | ~30 |
| `contextMenu.js` | 우클릭 메뉴 | ~80 |
| `touch.js` | 터치 스와이프 핸들러 | ~120 |
| `keyboard.js` | 키보드 단축키 | ~60 |
| `mouse.js` | 마우스 이동, 휠 | ~80 |
| `main.js` | 초기화, DOMContentLoaded | ~150 |

---

## 의존성 관계

```
main.js
├── config.js (상수)
├── storage.js (데이터)
├── space/
│   ├── renderer.js
│   ├── tunnel.js
│   └── warp.js
├── components/
│   ├── cards.js ← storage.js
│   ├── carousel.js ← cards.js
│   ├── sections.js ← cards.js, carousel.js
│   └── widgets.js
├── ui/
│   ├── modal.js ← cards.js
│   ├── menu.js
│   ├── toast.js
│   └── contextMenu.js ← cards.js
└── events/
    ├── touch.js ← carousel.js, sections.js
    ├── keyboard.js ← carousel.js, sections.js
    └── mouse.js ← renderer.js
```

---

## 구현 방식 옵션

### 옵션 A: ES6 모듈 (권장)
```html
<script type="module" src="js/main.js"></script>
```
- **장점**: 깔끔한 import/export, 트리 쉐이킹
- **단점**: 로컬 file:// 에서 CORS 에러 → Live Server 필요

### 옵션 B: 전역 네임스페이스
```html
<script src="js/config.js"></script>
<script src="js/storage.js"></script>
...
<script src="js/main.js"></script>
```
- **장점**: file:// 에서도 동작
- **단점**: 전역 오염, 로드 순서 중요

### 옵션 C: 빌드 도구 (Vite)
```bash
npm create vite@latest
```
- **장점**: 개발 서버, HMR, 번들링, 최적화
- **단점**: Node.js 필요, 빌드 단계 추가

---

## 선택된 방식: 옵션 B (전역 네임스페이스)

### 이유
1. **file:// 동작**: 서버 없이 로컬에서 바로 실행
2. **빌드 도구 불필요**: Node.js, npm 없이 사용
3. **단순함**: 파일만 분리하면 끝
4. **GitHub Pages 호환**: 그대로 배포 가능

### 구현 패턴
```javascript
// 전역 네임스페이스 생성
window.App = window.App || {};

// 각 모듈에서 등록
App.Config = { ... };
App.Storage = { ... };
App.Cards = { ... };

// main.js에서 사용
App.Cards.render();
```

### HTML 로드 순서
```html
<!-- CSS -->
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components/cards.css">
...

<!-- JS (순서 중요!) -->
<script src="js/config.js"></script>      <!-- 1. 상수 -->
<script src="js/storage.js"></script>     <!-- 2. 데이터 -->
<script src="js/space/renderer.js"></script>
<script src="js/space/tunnel.js"></script>
<script src="js/space/warp.js"></script>
<script src="js/components/cards.js"></script>
...
<script src="js/main.js"></script>        <!-- 마지막: 초기화 -->
```

---

## 마이그레이션 단계

### Phase 1: 구조 설정 및 CSS 분리
1. 폴더 구조 생성 (css/, js/)
2. 기존 `index.html` 백업
3. CSS 추출 및 파일 분리
4. HTML에 `<link>` 태그 연결

### Phase 2: JavaScript 분리
1. `config.js` - 상수, 설정, 기본값
2. `storage.js` - localStorage 관리
3. `space.js` - Three.js, 터널, 워프
4. `cards.js` - 카드 CRUD, 렌더링
5. `carousel.js` - 캐러셀 로직
6. `sections.js` - 섹션 전환
7. `widgets.js` - 시계, 날씨, 배터리
8. `ui.js` - 모달, 메뉴, 토스트, 컨텍스트 메뉴
9. `events.js` - 터치, 키보드, 마우스, 휠
10. `main.js` - 초기화, DOMContentLoaded

### Phase 3: 테스트 및 배포
1. file://로 로컬 테스트
2. 모든 기능 동작 확인
3. GitHub Pages 배포
4. 기존 기능 회귀 테스트

---

## 예상 결과

### Before
```
index.html (3,652줄)
```

### After
```
mydesktop/
├── index.html (~50줄)
├── css/ (12개 파일, 각 50~200줄)
├── js/ (17개 파일, 각 30~250줄)
└── dist/ (빌드 결과물)
```

### 장점
- 각 파일 200줄 이하 유지
- 기능별 명확한 분리
- 디버깅 용이
- 협업 가능
- 테스트 용이

---

## 다음 단계

오빠가 선택해주세요:

1. **지금 바로 리팩토링 시작** → Phase 1부터 진행
2. **옵션 B (전역 네임스페이스)로 진행** → 빌드 도구 없이 단순 분리
3. **일단 보류** → 현재 상태 유지, 필요할 때 진행
