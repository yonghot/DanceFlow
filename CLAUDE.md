# DanceFlow 개발 지침서

## 1-1. 언어

- **반드시 한국어로 응답**할 것
- 코드 주석은 한국어 허용, 변수/함수명은 영어
- 사용자 대면 에러 메시지는 항상 한국어로 변환

## 1-2. 코드 작성

### 스타일
- Google TypeScript Style Guide 준수
- 들여쓰기 2 spaces, 세미콜론 사용, 싱글 쿼트 (JSX 속성은 더블 쿼트)
- ESLint + Prettier 준수, 커밋 전 린트 통과 필수

### 네이밍
- 컴포넌트/타입: PascalCase (`ScoreDisplay.tsx`)
- 함수/변수: camelCase (`getUserData`)
- 상수: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- 파일: 컴포넌트 PascalCase, 유틸리티 camelCase
- 타입에 접두사 I 사용하지 않음

### 타입 안전성
- `any` 금지 → `unknown` + 타입 가드
- 함수 반환 타입 명시, strict 모드 활성화
- framer-motion ease 값에는 `as const` 사용 (TS-007)

## 1-3. 아키텍처 (레이어 구조)

```
app/           → 라우트, 페이지 컴포넌트 (App Router)
components/    → UI 컴포넌트 (도메인별: layout, auth, practice, result, score, ui)
hooks/         → 커스텀 훅 (useCamera, usePoseDetection, useScore, useAuth, useReference)
stores/        → Zustand 전역 상태 (userStore, practiceStore, poseStore)
lib/pose/      → 포즈 감지/정규화/압축 (detector, normalizer, compression)
lib/scoring/   → 스코어링 엔진 (DTW, grading)
lib/supabase/  → DB 클라이언트/서버/미들웨어/리포지토리
types/         → 공통 타입 정의
```

- 기능/도메인 기준 파일 정리 (파일 타입 기준 X)
- 모듈 간 단방향 의존: app → components → hooks → lib/stores
- 순환 의존성 금지, 각 모듈 단일 책임 (SRP)

### 기술 스택
- Next.js 14 (App Router) + TypeScript
- shadcn/ui + Tailwind CSS + framer-motion
- MediaPipe BlazePose (WebGL/WASM, 클라이언트 전용)
- Zustand (상태관리) + Supabase (인증/DB/스토리지)
- 패키지 매니저: pnpm

## 1-4. 최소 구현

- **요청한 내용에 대해서만 최소한으로, 매우 보수적으로 구현**
- 임의로 관련 기능 추가 구현 금지
- TODO 주석으로 미완성 코드 남기지 않음
- 플레이스홀더/목업 데이터 사용 금지

## 1-5. 트러블슈팅

- 근본 원인(root cause) 파악 후 해결 (임시 우회 금지)
- 디버깅 순서: 에러 분석 → 원인 추적 → 근본 수정 → 검증
- 테스트 비활성화/건너뛰기로 문제 회피 금지
- 해결 사례는 하단 트러블슈팅 로그에 기록

## 1-6. 토큰 효율

- 불필요한 예시 코드, 장황한 설명 지양
- 답변은 간결하고 핵심 위주로
- 코드 블록은 변경 부분만 표시

## 1-7. YAGNI

- YAGNI (You Aren't Gonna Need It) 엄격 적용
- MVP 우선 → 필요 시 점진적 확장
- 미래 요구사항 추측 금지

## 1-8. 버전 관리

- 작업 전 `git status`, `git branch` 확인
- 기능 브랜치에서 작업 (main 직접 작업 금지)
- 의미 있는 단위로 커밋, 명확한 한국어 커밋 메시지
- 커밋 전 `git diff`로 변경 사항 확인
- 테스트 파일은 `tests/` 디렉토리에 배치

## 1-9. 추가 원칙

> 프로젝트 진행 중 발견되는 추가 원칙을 여기에 기록합니다.

---

## 트러블슈팅 로그

### TS-001: Set spread 에러
- **증상**: `[...new Set()]`에서 TypeScript 컴파일 에러
- **해결**: `tsconfig.json`에 `"target": "es2017"` 추가
- **예방**: ES2015+ 기능 사용 시 target 설정 확인

### TS-002: 동적 require 타입 에러
- **증상**: `require()` 사용 시 ref prop 타입 불일치
- **해결**: 정적 ES module import로 변경
- **예방**: 컴포넌트는 반드시 정적 import

### TS-003: 빈 interface ESLint 에러
- **해결**: `type` alias로 변경 (`interface {} → type = React.HTMLAttributes<>`)

### TS-004: video.play() 중단 에러
- **해결**: play() try-catch로 감싸고 AbortError 무시
- **예방**: 비동기 미디어 API에 AbortError 핸들링 필수

### TS-005: 카메라 에러 원시 메시지 노출
- **해결**: DOMException 에러명을 한국어 안내로 매핑

### TS-006: vitest v4 + v8 커버리지 0%
- **해결**: istanbul 프로바이더로 변경
- **예방**: vitest v4에서는 istanbul 사용

### TS-007: framer-motion ease 타입 에러
- **해결**: `ease: 'easeOut' as const`
- **예방**: Variants 객체 ease 값에 `as const`
