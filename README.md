# Title Battle - 칭호 배틀

칭호를 얻고 강화하며 전투하는 게임입니다.

## 기능

- **배틀 시스템**: AI(Gemini 2.5 Flash Lite) 기반 자동 전투
- **칭호 시스템**: 5개 등급 (일반, 고급, 영웅, 전설, 신화)
- **칭호 강화**: 골드로 칭호 등급 업그레이드
- **칭호 판매**: 필요없는 칭호를 골드로 판매
- **Elo 점수 시스템**: 승패에 따른 점수 변동
- **배틀 쿨타임**: 30초 쿨타임으로 무한 배틀 방지
- **모바일 반응형**: 모바일과 데스크톱 모두 지원

## Vercel 배포

### 환경 변수 설정

Vercel 프로젝트 설정에서 다음 환경 변수를 추가하세요:

- `GOOGLE_API_KEY`: Google AI Studio에서 발급받은 Gemini API 키

### 배포 방법

1. GitHub 저장소와 Vercel 연결
2. 환경 변수 설정
3. 자동 배포

## 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.local 파일 생성)
GOOGLE_API_KEY=your_api_key_here

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Lite
- **Storage**: LocalStorage (클라이언트 측 데이터 저장)

## 파일 구조

```
src/
├── app/
│   ├── api/
│   │   └── battle/
│   │       └── route.ts       # 배틀 및 칭호 생성 백엔드
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # 메인 게임 화면
├── components/
│   ├── ui/
│   │   ├── ActionButton.tsx   # 로딩/비활성화 버튼
│   │   ├── BattleLog.tsx      # 배틀 로그 출력
│   │   └── Modal.tsx          # 모달 컴포넌트
│   └── game/
│       └── TitleCard.tsx      # 칭호 카드 컴포넌트
├── lib/
│   ├── gemini.ts              # Gemini AI 설정
│   ├── elo.ts                 # Elo 점수 계산
│   └── utils.ts               # 유틸리티 함수
└── types/
    └── game.ts                # 타입 정의
```
