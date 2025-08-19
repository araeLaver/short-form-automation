# 숏폼 자동화 시스템

AI 기반 자동 숏폼 비디오 생성 및 배포 시스템

## 🎯 주요 기능

### 1. 대한민국 타겟 콘텐츠
- 실시간 뉴스/이슈 수집 (네이버, 구글 트렌드)
- 한국어 TTS 및 자막 자동 생성
- 일일 3회 자동 업로드 (08:00, 12:00, 18:00)

### 2. 전세계 타겟 콘텐츠
- AI 생성 비디오 (Stable Diffusion, Replicate)
- 다국어 자막 지원 (영어, 스페인어, 중국어)
- 카테고리: Tech, Life Hacks, Science Facts 등

### 3. 플랫폼 지원
- YouTube Shorts
- Instagram Reels
- TikTok

## 🚀 설치 및 실행

### 환경 설정
```bash
cp .env.example .env
# .env 파일에 API 키 입력
```

### 의존성 설치
```bash
npm install
```

### 실행
```bash
# 전체 시스템 실행
npm start

# 한국 콘텐츠만 실행
npm run korea-daily

# 글로벌 콘텐츠만 실행
npm run global-ai
```

## 📁 프로젝트 구조
```
short-form-automation/
├── src/
│   ├── collectors/      # 데이터 수집 모듈
│   ├── generators/      # AI 콘텐츠 생성
│   ├── editors/         # 비디오 편집
│   ├── uploaders/       # 플랫폼 업로드
│   ├── schedulers/      # 스케줄링
│   └── utils/          # 유틸리티
├── data/
│   ├── raw/            # 원본 데이터
│   ├── processed/      # 처리된 데이터
│   └── videos/         # 생성된 비디오
└── logs/               # 로그 파일
```

## 🔧 필수 API 키

### 뉴스 수집
- Naver API (Client ID/Secret)

### AI 생성
- OpenAI API Key
- Replicate API Token

### 플랫폼 업로드
- YouTube OAuth 2.0
- Instagram 계정 정보
- TikTok Session ID

## 📊 모니터링
- 로그 파일: `logs/combined.log`
- 에러 로그: `logs/error.log`
- 성능 로그: `logs/performance.log`

## 🔄 워크플로우

1. **데이터 수집** → 트렌드 분석
2. **스크립트 생성** → GPT-4 활용
3. **비디오 제작** → FFmpeg 편집
4. **다중 업로드** → 3개 플랫폼 동시
5. **성과 추적** → 조회수/참여도 분석