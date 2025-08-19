# 🎨 AI-Powered Short-form Automation System

[![CI/CD](https://github.com/araeLaver/short-form-automation/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/araeLaver/short-form-automation/actions/workflows/ci-cd.yml)
[![Node.js Version](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

AI를 활용한 숏폼 비디오 자동 생성 시스템 - 한국어 지원, 16개 이미지 모델, 8개 동영상 모델

## 🚀 주요 기능

### 🎨 **AI 이미지 생성 (16개 모델)**
- **🔥 FLUX 1.1 Pro Ultra**: 최고품질 4MP ($0.08)
- **📸 Ideogram v3 Turbo**: 텍스트 특화 ($0.04) 
- **⚡ FLUX.1 [schnell]**: 완전무료 3초 생성
- **🎭 SDXL**: 안정적인 기본 모델 ($0.0032)
- **📸 Realistic Vision**: 사실적 사진 스타일

### 🎬 **AI 동영상 생성 (8개 모델)**
- **🔥 Google Veo 3**: 최고품질 영화급 ($0.20) 🔒 관리자 전용
- **⚡ Google Veo 3 Fast**: 고품질 빠른 버전 ($0.12) 🔒 관리자 전용
- **🔄 SVD XT**: 이미지→동영상 25프레임 ($0.065)
- **⚡ AnimateDiff**: 텍스트→동영상 직접 ($0.018)

### 🌐 **한국어 번역 시스템**
- Google Translate 무료 API
- HuggingFace 번역 모델
- Anthropic Claude API (백업)
- 스마트 키워드 매핑

### 👥 **게스트 모드 & 관리**
- 모델별 1회 사용 제한
- 프리미엄 모델 관리자 전용
- 친근한 안내 메시지
- 대안 모델 자동 제시

## 🛠️ 설치 및 실행

### 1️⃣ **프로젝트 클론**
```bash
git clone https://github.com/araeLaver/short-form-automation.git
cd short-form-automation
```

### 2️⃣ **의존성 설치**
```bash
npm install
```

### 3️⃣ **환경 변수 설정**
```bash
cp .env.example .env
```

`.env` 파일에서 API 키를 설정하세요:
```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4️⃣ **서버 실행**
```bash
# 🔥 메인 AI 생성기 실행 (추천)
node fixed-ai-generator.js

# 또는 다른 서버들
npm run server-dev    # http://localhost:3003
node simple-server.js # http://localhost:3005
```

### 5️⃣ **브라우저 접속**
```
http://localhost:3015
```

## 🎮 사용법

### 📝 **기본 사용법**
1. **브라우저에서 접속**: `http://localhost:3015`
2. **한국어 프롬프트 입력**: "서울 야경", "아름다운 산" 등
3. **번역 미리보기**: "🔄 한→영 번역 미리보기" 클릭
4. **모델 선택**: 원하는 이미지/동영상 모델 클릭
5. **생성 실행**: 📸 이미지 또는 🎬 동영상 생성 버튼
6. **결과 확인**: 갤러리에서 생성된 콘텐츠 확인

### 🎯 **모델 선택 가이드**
```
🆓 무료 체험:     FLUX.1 [schnell] (3초)
💰 저비용:       SDXL, AnimateDiff ($0.002-0.02)
🎨 고품질:       FLUX Pro Ultra, Ideogram v3 ($0.04-0.08)
👑 프리미엄:     Google Veo 3 ($0.20) - 관리자만
```

### 💡 **프롬프트 예시**
```
이미지: "석양이 지는 아름다운 산", "현대적인 카페 인테리어"
동영상: "파도가 치는 바다", "도시의 밤 풍경"
```

## 📁 프로젝트 구조

```
short-form-automation/
├── 🔥 fixed-ai-generator.js    # 메인 AI 생성기
├── 📄 README.md                # 이 파일
├── ⚙️ package.json            # 의존성 관리
├── 🔐 .env.example            # 환경 변수 템플릿
├── 📚 CLAUDE.md               # 개발 기록
├── 🏗️ .github/workflows/      # GitHub Actions
├── 📊 storage/                # 생성된 콘텐츠 저장소
└── 🎛️ src/                   # 추가 모듈들
    ├── api/                   # API 라우터
    ├── services/              # 비즈니스 로직
    └── utils/                 # 유틸리티
```

## 🔧 기술 스택

### **Backend**
- Node.js + Express.js
- ES6 Modules
- Environment Variables

### **AI & API**
- Replicate API (16개 이미지 + 8개 동영상 모델)
- Anthropic Claude API (번역)
- Google Translate API (무료)
- HuggingFace API (번역 백업)

### **Frontend**
- 바닐라 JavaScript
- 반응형 디자인
- 실시간 갤러리

### **DevOps**
- GitHub Actions CI/CD
- 자동 테스트 & 배포
- Secret Scanning

## 🎯 게스트 vs 관리자 모드

### 👥 **게스트 모드** (기본)
- ✅ 모든 무료 모델 사용 가능
- ✅ 저비용 모델 ($0.05 이하) 각 1회씩
- ❌ 프리미엄 모델 제한
- 💡 친근한 안내 + 대안 모델 제시

### 👨‍💼 **관리자 모드**
- ✅ 모든 모델 무제한 사용
- ✅ 프리미엄 모델 (Google Veo 3 등)
- ✅ 사용량 제한 없음

## 🚀 CI/CD 파이프라인

이 프로젝트는 GitHub Actions를 통한 완전 자동화된 CI/CD를 제공합니다:

### 🧪 **테스트 단계**
- Node.js 18.x, 20.x 매트릭스 테스트
- 문법 검사 & 린팅
- 보안 스캐닝

### 🚀 **배포 단계**
- 자동 배포 준비
- 릴리즈 노트 자동 생성
- 배포 기록 관리

## 🔒 보안

### **API 키 관리**
- ✅ 환경 변수 사용
- ✅ .env.example 템플릿
- ✅ GitHub Secret Scanning 통과
- ❌ 하드코딩된 키 없음

### **사용량 제한**
- 게스트 모드 자동 제한
- IP 기반 사용량 추적
- 프리미엄 모델 접근 제어

## 📝 개발 기록

상세한 개발 과정과 업데이트 내역은 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

## 🤝 기여하기

1. 이 저장소를 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🆘 지원

- 🐛 **버그 리포트**: [Issues](https://github.com/araeLaver/short-form-automation/issues)
- 💡 **기능 요청**: [Issues](https://github.com/araeLaver/short-form-automation/issues)
- 📧 **이메일**: 프로젝트 관련 문의

## 🎉 감사의 말

- **Replicate**: 놀라운 AI 모델 API 제공
- **Anthropic**: Claude API로 번역 지원  
- **Google**: 무료 번역 서비스
- **GitHub**: Actions를 통한 무료 CI/CD

---

<div align="center">

**🤖 Powered by [Claude Code](https://claude.ai/code)**

*AI 기반 개발 도구로 제작된 숏폼 자동화 시스템*

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!

</div>