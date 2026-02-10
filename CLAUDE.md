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

(아직 기록된 항목 없음)
