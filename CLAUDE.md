# DanceFlow 개발 지침서

## 기본 원칙

- **반드시 한국어로 응답**할 것
- 코드 주석은 한국어 허용, 변수/함수명은 영어
- 토큰 효율을 위해 불필요한 예시 코드, 장황한 설명 지양
- 답변은 간결하고 핵심 위주로

## 코드 작성 원칙

### 스타일 가이드

- **JavaScript/TypeScript**: Google TypeScript Style Guide 준수
- **CSS**: BEM 네이밍 또는 프레임워크 컨벤션 따름
- **들여쓰기**: 2 spaces
- **세미콜론**: 사용
- **따옴표**: 싱글 쿼트 (JSX 내 속성은 더블 쿼트)
- **린트**: ESLint + Prettier 설정 준수, 커밋 전 린트 통과 필수

### 네이밍 규칙

- 컴포넌트: PascalCase (`DanceCard.tsx`)
- 함수/변수: camelCase (`getUserData`)
- 상수: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- 파일: 컴포넌트는 PascalCase, 유틸리티는 camelCase
- 타입/인터페이스: PascalCase, 접두사 I 사용하지 않음

### 타입 안전성

- `any` 사용 금지, 불가피한 경우 `unknown` + 타입 가드
- 함수 반환 타입 명시
- strict 모드 활성화

## 모듈화 원칙

- 모든 기능을 적절한 단위로 분리하여 **독립적 모듈**로 구성
- 각 모듈은 명확한 이름과 단일 책임을 가질 것 (SRP)
- 모듈 간 의존성 최소화 → 특정 기능 수정 시 다른 모듈 영향 차단
- 공통 로직은 `utils/`, `hooks/`, `lib/` 등으로 분리
- 순환 의존성(circular dependency) 금지

## 구현 원칙

- **요청한 내용에 대해서만 최소한으로, 매우 보수적으로 구현**
- 임의로 "어울릴 만한" 관련 기능을 추가 구현하지 않음
- YAGNI (You Aren't Gonna Need It) 엄격 적용
- MVP 우선 → 필요 시 점진적 확장
- TODO 주석으로 미완성 코드 남기지 않음
- 플레이스홀더/목업 데이터 사용 금지

## 디버깅 & 트러블슈팅 원칙

- 오류 발생 시 **근본 원인(root cause)을 파악**하여 해결
- 임시 우회(workaround) 방편이 아닌, 동일 오류 재발 방지를 위한 근본 수정
- 디버깅 순서: 에러 메시지 분석 → 원인 추적 → 근본 수정 → 검증
- 테스트를 비활성화하거나 건너뛰어서 문제를 회피하지 않음
- 해결된 트러블슈팅 사례는 아래 섹션에 기록하여 재발 방지

## 프로젝트 기술 스택

- **프레임워크**: Next.js 14 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **AI/포즈**: MediaPipe BlazePose (WebGL/WASM)
- **상태관리**: Zustand
- **로컬DB**: IndexedDB (Dexie.js)
- **애니메이션**: framer-motion
- **아이콘**: lucide-react
- **패키지 매니저**: pnpm

## 프로젝트 구조 원칙

- 파일은 기능/도메인 기준으로 정리 (파일 타입 기준 X)
- 임시 파일, 디버그 파일은 작업 완료 후 반드시 삭제
- 테스트 파일은 `tests/` 또는 `__tests__/` 디렉토리에 배치
- 문서 파일은 프로젝트 루트에 배치
- 상세 프로젝트 구조는 `PRD.md` 참조

## Git 원칙

- 작업 전 `git status`, `git branch` 확인
- 기능 브랜치에서 작업 (main/master 직접 작업 금지)
- 의미 있는 단위로 커밋, 명확한 커밋 메시지
- 커밋 전 `git diff`로 변경 사항 확인

---

## 트러블슈팅 로그

> 개발 중 발견된 주요 이슈와 해결 방법을 기록하여 재발을 방지합니다.

### TS-001: Set spread 에러

- **증상**: `[...new Set()]` 구문에서 TypeScript 컴파일 에러
- **원인**: tsconfig.json에 `target` 미설정 (기본값 ES5에서 Set iterable 미지원)
- **해결**: `tsconfig.json`에 `"target": "es2017"` 추가
- **예방**: ES2015+ 기능 사용 시 target 설정 확인 필수

### TS-002: 동적 require 타입 에러

- **증상**: `button.tsx`에서 `const { Slot } = require(...)` 사용 시 ref prop 타입 불일치
- **원인**: 동적 require는 정확한 타입 추론 불가
- **해결**: `import { Slot } from '@radix-ui/react-slot'` 정적 import로 변경
- **예방**: 컴포넌트 import는 반드시 정적 ES module import 사용

### TS-003: 빈 interface ESLint 에러

- **증상**: `interface SkeletonProps extends HTMLAttributes {}` → `@typescript-eslint/no-empty-object-type`
- **해결**: `type SkeletonProps = React.HTMLAttributes<HTMLDivElement>` type alias로 변경
- **예방**: 빈 interface 대신 type alias 사용

### TS-004: video.play() 중단 에러

- **증상**: 연습 페이지 진입 시 "The play() request was interrupted by a new load request" 에러
- **원인**: 페이지 이동/언마운트 시 play() Promise가 reject되면서 `AbortError` 발생
- **해결**: `useCamera.ts`에서 play() 호출을 try-catch로 감싸고 `AbortError`는 무시 처리
- **예방**: 비동기 미디어 API 호출 시 AbortError 핸들링 필수

### TS-005: 카메라 에러 원시 메시지 노출

- **증상**: 카메라 접근 실패 시 영문 DOMException 메시지가 사용자에게 그대로 표시
- **해결**: `NotAllowedError`, `NotFoundError`, `NotReadableError`를 한국어 안내 메시지로 매핑
- **예방**: 사용자 대면 에러는 항상 한국어 메시지로 변환

### TS-006: vitest v4 + v8 커버리지 0% 버그

- **증상**: 110개 테스트 통과하지만 v8 커버리지 프로바이더가 모든 파일에 0% 보고
- **원인**: vitest v4.0.18의 v8 커버리지 프로바이더 호환성 버그
- **해결**: `@vitest/coverage-istanbul` 설치 후 `vitest.config.ts`에서 `provider: 'istanbul'`로 변경
- **예방**: vitest v4에서는 istanbul 프로바이더 사용 권장

### TS-007: framer-motion Variants ease 타입 에러

- **증상**: `ease: 'easeOut'`이 Variants 타입에서 `string`으로 추론되어 `Easing` 타입 불일치
- **원인**: 객체 리터럴의 문자열이 넓은 `string` 타입으로 추론됨
- **해결**: `ease: 'easeOut' as const`로 리터럴 타입 고정
- **예방**: framer-motion Variants 객체의 ease 값에는 `as const` 사용
