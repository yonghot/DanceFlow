# DanceFlow 아키텍처 문서

> 2026년 3월 기준

## 시스템 개요

DanceFlow는 클라이언트 중심 아키텍처로, 모든 AI 포즈 감지/스코어링을 브라우저에서 처리한다.
서버(Supabase)는 인증, 데이터 저장, 파일 스토리지만 담당한다.

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ Next.js  │  │ MediaPipe│  │  Zustand      │ │
│  │ App      │→ │ BlazePose│→ │  Stores       │ │
│  │ Router   │  │ (GPU/CPU)│  │  (State)      │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
│       │              │              │            │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ React    │  │ DTW      │  │  Gzip         │ │
│  │ Components│  │ Scoring  │  │  Compression  │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
└───────────────────────┬─────────────────────────┘
                        │ HTTPS
┌───────────────────────┴─────────────────────────┐
│                   Supabase                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │   Auth   │  │ PostgreSQL│  │   Storage     │ │
│  │ (JWT)    │  │   (RLS)  │  │ (pose-data)   │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
└─────────────────────────────────────────────────┘
```

## 레이어 구조

### 1. 라우팅 레이어 (`src/app/`)
- Next.js 14 App Router, `force-dynamic` 렌더링
- 미들웨어(`src/middleware.ts`)로 인증 라우트 보호
- 공개: `/`, `/login`, `/signup`, `/auth/callback`
- 보호: `/mypage`, `/setup`, `/practice/*`, `/reference/*`, `/result/*`

### 2. 프레젠테이션 레이어 (`src/components/`)
도메인별 분리:
- `layout/` — AppShell (조건부 크롬), Header, Navigation
- `auth/` — LoginForm, SignupForm
- `practice/` — JudgementPopup, ComboCounter
- `result/` — GradeMessage, ParticleBackground
- `reference/` — RecordingPreview
- `score/` — ScoreDisplay, GradeIndicator, BodyPartScore
- `ui/` — shadcn/ui 기본 컴포넌트 (Button, Card, Badge, Progress, Skeleton)

### 3. 상태 레이어 (`src/stores/`)
Zustand 기반 3개 스토어:
- `userStore` — 프로필, 설정 (mirrorMode, playbackSpeed)
- `practiceStore` — 세션 상태 (idle→countdown→practicing→completed), 점수, 등급
- `poseStore` — 감지기 상태, 현재 포즈, FPS

### 4. 비즈니스 로직 레이어 (`src/hooks/`)
- `useAuth` — 세션 관리, 로그인/로그아웃, 프로필 로드
- `useCamera` — 카메라 스트림 관리, 에러 핸들링
- `usePoseDetection` — MediaPipe 초기화, 프레임별 감지, FPS 계산
- `useReference` — 레퍼런스 포즈 로드/디코딩, 인메모리 캐시
- `useScore` — 스코어링 엔진 (정확도 70% + 타이밍 DTW 30%)

### 5. 코어 라이브러리 (`src/lib/`)

#### 포즈 엔진 (`lib/pose/`)
- `detector.ts` — PoseDetector 클래스, MediaPipe WASM 로드, GPU 가속
- `normalizer.ts` — 엉덩이 중심 정규화 (스케일 불변), 3D 각도 계산
- `compression.ts` — CompactPoseData 변환 (4자리 정밀도) + Gzip 압축
- `types.ts` — Landmark, PoseFrame, NormalizedLandmark 타입

#### 스코어링 엔진 (`lib/scoring/`)
- `dtw.ts` — Windowed DTW (Sakoe-Chiba 밴드, 10% 윈도우, 2행 DP)
- `grading.ts` — 5단계 등급 판정 (Perfect/Great/Good/OK/Miss)

#### 데이터 레이어 (`lib/supabase/`)
- `client.ts` — 브라우저 클라이언트 (`isSupabaseConfigured()` graceful degradation)
- `server.ts` — 서버 컴포넌트용 클라이언트 (쿠키 세션)
- `middleware.ts` — 세션 갱신, 보호 라우트 리다이렉트
- `poseStorage.ts` — Gzip 압축 업로드/다운로드
- `repos/` — choreographyRepo, practiceRepo, referenceRepo

## 데이터 플로우

### 연습 세션 플로우
```
카메라 시작 → 포즈 감지 (30fps) → 스켈레톤 렌더링
       ↓                              ↓
  랜드마크 저장 (useRef)        게임 이펙트 표시
       ↓                     (판정/콤보/글로우)
  타이머 완료
       ↓
  useScore() ← useReference()
       ↓
  DTW 비교 (정확도 + 타이밍)
       ↓
  savePracticeSession() → Supabase
       ↓
  /result/[id] 이동
```

### 레퍼런스 녹화 플로우
```
카메라 시작 → 포즈 감지 → 랜드마크 수집 (useRef)
       ↓
  녹화 완료 (30초)
       ↓
  CompactPoseData 변환 → Gzip 압축
       ↓
  Supabase Storage 업로드 → reference_poses 레코드 생성
```

## 핵심 아키텍처 결정

### 클라이언트 전용 AI
- **이유**: 실시간 피드백, 서버 비용 0, 개인정보 보호
- **트레이드오프**: 디바이스 성능 의존, 서버 검증 불가
- **완화**: GPU 가속 + CPU 폴백, 성능 모니터링 (FPS 표시)

### Windowed DTW
- **이유**: O(n²) → ~O(n) 계산량 감소 (85% 절감)
- **구현**: Sakoe-Chiba 밴드 (10% 윈도우), 2행 DP 메모리 최적화
- **트레이드오프**: 극단적 템포 차이 감지 불가 (10% 이내 허용)

### 이중 스코어링 모드
- 레퍼런스 있음: 정확도(70%) + 타이밍 DTW(30%)
- 레퍼런스 없음: 트래킹 품질 (관절점 visibility 기반)
- **이유**: 레퍼런스 미확보 안무도 연습 가능

### CompactPoseData + Gzip 압축
- 33 랜드마크 × 4값 (x,y,z,visibility) → 1D 배열 (4자리 정밀도)
- Gzip 추가 압축: ~85-90% 절감 (30초 댄스 ≈ 50KB)
- Browser CompressionStream API 사용 (서버 불필요)

### Supabase RLS (Row Level Security)
- profiles: 전체 조회 가능, 본인만 수정
- choreographies: 전체 조회, 인증 사용자만 생성
- reference_poses: active만 조회, 본인만 생성/수정
- practice_sessions: 전체 조회, 본인만 생성

### AppShell 패턴
- Zustand hydration 대기 후 렌더링
- 몰입 페이지 (연습/녹화/로그인 등) Header/Navigation 자동 숨김
- 인증 상태에 따른 조건부 UI

## 테스트 전략

- **프레임워크**: Vitest + @testing-library/react + jsdom
- **커버리지**: Istanbul 프로바이더 (v8 버그 회피)
- **범위**: lib/ 모듈 단위 테스트 중심 (110개)
- **제외**: detector.ts (MediaPipe WASM), layout.tsx (서버 컴포넌트)
- **목표**: 코어 로직 (DTW, normalizer, compression, grading) 80%+

## 성능 최적화

- `requestAnimationFrame` 기반 포즈 루프 (setInterval 미사용)
- Canvas 렌더링 주파수 = 포즈 감지 주파수 (이중 렌더 방지)
- useRef로 성능 크리티컬 데이터 관리 (리렌더 방지)
- 바이너리 서치로 프레임 룩업 (RecordingPreview)
- 적절한 useCallback/useMemo 의존성 관리
