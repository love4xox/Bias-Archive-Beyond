## 📜 BIAS ARCHIVE (바이어스 아카이브)
**“AI가 당신의 취향을 하나의 에디토리얼 매거진으로 편집한다.”**
사용자가 좋아하는 대상(인물, 캐릭터, 콘텐츠 등)을 입력하면 AI가 단순한 정보 나열을 넘어 감성 기반의 구조화된 디지털 에디토리얼 매거진으로 재구성해주는 AI 취향 아카이빙 플랫폼입니다.

---

**🔗 서비스 링크 및 배포 정보** 
> 배포 URL: [https://bias-archive-beyond-n04suqf07-mind-mines-projects.vercel.app]
>(https://bias-archive-beyond-n04suqf07-mind-mines-projects.vercel.app)

---

**개발 환경**: Cursor AI Editor, Python 3.9+, Vanilla JS (SPA)호스팅 & CI/CD: Vercel, GitHub

---

**🌟 핵심 기능 및 섹션 구성 (5-Tab SPA)**
단일 페이지 애플리케이션(SPA) 구조로 페이지 새로고침 없이 5개의 에디토리얼 섹션을 유연하게 전환합니다.

01. **CRITIC (평론 의뢰)** [핵심 AI 기능] 카테고리 및 최애 키워드를 입력받아 에디토리얼 평론 리포트 실시간 발행
02. **SELECTION (추천 픽)** 실시간 트렌드 키워드 및 AI 큐레이션 토픽을 인터랙티브하게 탐색
03. **ARCHIVE BOOK (아카이브 북)** 생성된 평론과 분석 데이터를 도서관형 서가에 영구 편철 및 재열람
04. **ESSAY (에세이 노트)** 정형화된 평론 외에 주관적 감상과 기록을 남기는 에디토리얼 에세이 공간
05. **MOODBOARD (무드보드)** 컬러 톤, 오브제, 시각적 콘셉트를 아카이빙하는 비주얼 갤러리

---

## 🛠 기술 스택 및 아키텍처
**System Tech StackFrontend**: HTML5, CSS3 (Responsive Editorial/Paper Theme), Vanilla JavaScript (Tab Routing & DOM Control)
**Backend**: Vercel Serverless Functions (api/chat.py, Python 3.9+)
**AI Engine**: Google Gemini API (gemini-3.5-flash)
**Operations**: Discord Webhook (실시간 의뢰 접수 알림) 
**VCS & Deploy**: GitHub, Vercel CI/CD PipelineDirectory StructurePlaintext

---

```text
bias-archive/
├── api/
│   ├── chat.py             # Serverless POST 엔드포인트 (AI 호출 및 Discord Webhook 연동)
│   └── prompts.py          # 매거진 에디터 페르소나 및 시스템 프롬프트 정의
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   │   └── favicon.svg # 서비스 파비콘
│   │   └── images/
│   │       └── og-banner.svg # 오픈그래프 배너 이미지
│   ├── css/
│   │   ├── base.css        # 리셋 및 글로벌 변수
│   │   ├── components.css  # 버튼/입력 폼/태그 모듈
│   │   ├── dark.css        # 다크 모드 전용 스타일
│   │   ├── layout.css      # 컨테이너 및 그리드 레이아웃
│   │   └── style.css       # 에디토리얼 통합 메인 스타일
│   ├── js/
│   │   └── app.js          # SPA 탭 라우팅, fetch 통신, DOM 렌더링
│   └── index.html          # 메인 마크업
├── .env                    # 로컬 환경 변수 설정 (Git 추적 제외)
├── .env.example            # 환경 변수 템플릿 가이드
├── .gitignore              # Git 형상관리 제외 목록
├── README.md               # 프로젝트 매뉴얼 및 기술 문서
├── requirements.txt        # Python 백엔드 의존성 (google-generativeai, requests 등)
└── vercel.json             # Vercel 서버리스 라우팅 및 빌드 설정
```

---

```text
🔄 데이터 흐름 및 AI 파이프라인
1. [사용자 입력] ─────> 2. [app.js Validation] ─────> 3. [fetch('/api/chat', POST)]
                                                               │
                                                               ▼
6. [매거진 렌더링/소장] <── 5. [JSON 파싱/DOM 변환] <── 4. [chat.py + Gemini AI]
                                                               │
                                                               └─> [Discord Webhook 알림]
```

---

**입력 및 검증**: 카테고리와 키워드를 입력받아 프론트엔드(app.js)에서 공백 여부를 1차 유효성 검사합니다.
**비동기 요청**: fetch('/api/chat', { method: 'POST' })를 호출하여 백엔드 서버리스 함수로 데이터를 전송합니다.
**AI 해석 & 웹훅**: chat.py가 전문 에디터 프롬프트와 결합하여 Gemini API를 호출하고, 동시에 Discord Webhook으로 접수 알림을 보냅니다.
**지면 렌더링**: 헤드라인, 3단 심층 분석, 입덕 포인트, 유튜브 링크가 포함된 마크다운을 지면 레이아웃으로 변환하여 화면에 출력하고 ARCHIVE BOOK에 저장합니다.

---

**⚙️ 실행 및 배포 가이드**
**1. 로컬 개발 환경 실행**
# 1. 저장소 클론
git clone https://github.com/your-username/bias-archive.git
cd bias-archive

# 2. 의존성 패키지 설치
pip install -r requirements.txt

# 3. 환경 변수 설정 (.env 파일 생성)
cp .env.example .env
# .env 파일 내 GEMINI_API_KEY 및 DISCORD_WEBHOOK_URL 입력

# 4. Vercel CLI 로컬 실행 (또는 로컬 서버 구동)
vercel dev

---

## 2. 환경 변수(Environment Variables) 설정 가이드
Vercel 대시보드의 Settings ➔ Environment Variables에 아래 키를 등록해야 정상 동작합니다.

**GEMINI_API_KEY**
Google AI Studio에서 발급받은 Gemini API 키
Production, Preview, Development

**DISCORD_WEBHOOK_URL**
의뢰 접수 알림을 수신할 디스코드 채널 웹훅 URL
Production, Preview, Development

---

## 📋 핵심 기술 검증 및 평가 기준 명세
**프론트엔드 상태 처리 (UX)**: 로딩 스피너 애니메이션, 필수 입력값 검증 알림, API 통신 에러 피드백을 완비하여 실패 상황을 대응합니다.
**보안 분리**: 클라이언트에 API Key를 노출하지 않고 백엔드(Serverless Functions)를 통해서만 안전하게 통신합니다.
**반응형 최적화**: 데스크톱 5분할 박스 레이아웃과 모바일 뷰포트(768px 이하) 가로 스크롤 인덱스를 적용하여 깨짐 없는 UI를 제공합니다.
**보너스 과제 달성**: 다크/라이트 테마 토글 지원, Discord Webhook 실시간 알림 파이프라인 연동, ARCHIVE BOOK 서가 저장 기능을 탑재했습니다.