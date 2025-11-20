# Vercel 배포 가이드 (2025년 11월 기준)

## 문제 해결 완료 ✅

기존 `vercel.json` 파일에 사용된 설정이 2025년 현재 **deprecated(더 이상 사용되지 않음)** 되어 배포가 되지 않던 문제를 해결했습니다.

### 변경 사항

1. **`vercel.json` 파일 제거**
   - 기존에 사용하던 `@google_api_key` 문법은 더 이상 지원되지 않습니다
   - Next.js 14 프로젝트는 Vercel이 자동으로 감지하므로 별도 설정 파일이 필요 없습니다

2. **환경 변수 설정 방식 변경**
   - 환경 변수는 반드시 Vercel 대시보드에서 설정해야 합니다
   - `vercel.json`에서 환경 변수를 설정하는 방식은 폐지되었습니다

## 배포 방법

### 1단계: Vercel 프로젝트 재설정 (권장)

기존에 연결했던 프로젝트가 작동하지 않는다면, 프로젝트를 다시 생성하는 것을 권장합니다:

1. **Vercel 대시보드** (https://vercel.com/dashboard) 접속
2. 기존 프로젝트가 있다면:
   - Project Settings → General → "Delete Project" (선택사항)
3. **"Add New Project"** 클릭
4. **"Import Git Repository"** 선택
5. GitHub 저장소 `pokemonrgby-crypto/Title-Battle` 선택

### 2단계: 프로젝트 설정 확인

Import 화면에서 다음을 확인하세요:

- **Framework Preset**: `Next.js` (자동 감지됨)
- **Root Directory**: `.` (기본값, 변경 불필요)
- **Build Command**: `next build` (자동 설정됨)
- **Output Directory**: `.next` (자동 설정됨)
- **Install Command**: `npm install` (자동 설정됨)

> ⚠️ **중요**: 이 설정들은 모두 자동으로 감지되므로 별도로 수정할 필요가 없습니다!

### 3단계: 환경 변수 설정

배포하기 전에 환경 변수를 설정해야 합니다:

1. Import 화면에서 **"Environment Variables"** 섹션 펼치기
2. 다음 환경 변수 추가:
   ```
   Name: GOOGLE_API_KEY
   Value: [여기에 Google AI Studio에서 발급받은 API 키 입력]
   ```
3. Environment를 **Production, Preview, Development** 모두 선택

### 4단계: 배포

1. **"Deploy"** 버튼 클릭
2. 빌드 로그를 확인하면서 대기
3. 배포 완료 후 제공되는 URL로 접속하여 확인

## 배포 후 확인사항

### ✅ 성공 시 나타나는 화면

- 빌드가 성공적으로 완료됨
- "Visit" 버튼을 클릭하면 게임이 정상 작동
- 배틀 시스템이 정상적으로 작동 (AI 응답 확인)

### ❌ 실패 시 확인사항

1. **빌드 로그 확인**
   - Deployment → 실패한 배포 클릭 → "Build Logs" 확인
   - 에러 메시지를 자세히 읽어보세요

2. **환경 변수 확인**
   - Project Settings → Environment Variables
   - `GOOGLE_API_KEY`가 올바르게 설정되었는지 확인
   - 값에 공백이나 잘못된 문자가 없는지 확인

3. **API 키 유효성 확인**
   - Google AI Studio에서 API 키가 활성화되어 있는지 확인
   - API 할당량이 남아있는지 확인

## 자동 배포 설정

이제 GitHub에 코드를 푸시할 때마다 자동으로 배포됩니다:

- **main/master 브랜치**: Production 배포
- **다른 브랜치**: Preview 배포 (테스트용)

## 추가 최적화 (선택사항)

### Node.js 버전 지정

`package.json`에 다음을 추가하여 Node.js 버전을 명시할 수 있습니다:

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 성능 최적화

Vercel은 자동으로 다음 최적화를 적용합니다:
- ✅ 이미지 최적화
- ✅ Edge 네트워크를 통한 전역 CDN
- ✅ 자동 HTTPS
- ✅ 서버리스 함수 최적화

## 문제 해결

### "Deployment not found" 또는 빈 화면

1. Vercel 대시보드에서 프로젝트 재생성
2. GitHub 연결 확인
3. 환경 변수 재설정

### "API Error" 또는 배틀이 작동하지 않음

1. Vercel 대시보드 → Project Settings → Environment Variables
2. `GOOGLE_API_KEY` 값 확인 및 재설정
3. Deployments → Redeploy

### 빌드 실패

1. 로컬에서 `npm run build` 실행하여 에러 확인
2. `node_modules` 삭제 후 `npm install` 재실행
3. Vercel 대시보드에서 "Redeploy" 시도

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [환경 변수 설정](https://vercel.com/docs/environment-variables)

## 요약

2025년 11월 기준으로:
- ✅ `vercel.json` 파일은 필요 없음 (자동 감지)
- ✅ 환경 변수는 Vercel 대시보드에서만 설정
- ✅ Next.js는 zero-configuration으로 배포 가능
- ✅ Git push 시 자동 배포

문제가 계속되면 위의 "1단계: Vercel 프로젝트 재설정"부터 다시 시도해보세요!
