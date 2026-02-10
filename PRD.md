# DanceFlow - 제품 요구사항 정의서 (PRD)

> Version 1.0 | 2026년 2월

## 1. 제품 개요

### 정의
DanceFlow는 웹캠 기반 AI 모션인식 댄스 평가 웹 애플리케이션이다. 사용자의 댄스 동작을 실시간으로 인식하고, 레퍼런스 안무와 비교하여 정확도 점수와 신체 부위별 교정 피드백을 제공한다.

### 핵심 가치
"모든 연습실을 개인 트레이닝 스튜디오로" — 별도 앱 설치나 특수 장비 없이, 브라우저와 웹캠만으로 객관적인 댄스 피드백을 제공한다.

### 타겟 사용자
- **주요 타겟**: 20-30대 여성 취미 댄서 (K-pop 커버댄스)
- **이용 환경**: 댄스 연습실 태블릿 또는 개인 노트북
- **비즈니스 모델**: B2B (댄스 연습실 프랜차이즈 월 구독)

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | TypeScript, 서버 컴포넌트 |
| UI | shadcn/ui + Tailwind CSS | 커스터마이징 가능한 컴포넌트 |
| AI/포즈 | MediaPipe BlazePose | WebGL/WASM, 33개 관절점 |
| 상태관리 | Zustand | 경량, 간결한 API |
| 로컬DB | IndexedDB (Dexie.js) | 오프라인 지원 |
| 패키지 매니저 | pnpm | 권장 |

### 핵심 라이브러리
- `@mediapipe/tasks-vision`: BlazePose 모델
- `zustand`: 전역 상태 관리
- `dexie`: IndexedDB 래퍼
- `framer-motion`: 애니메이션
- `lucide-react`: 아이콘

## 3. 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈 (안무 목록)
│   ├── practice/
│   │   └── [id]/page.tsx   # 연습 화면
│   ├── result/
│   │   └── [id]/page.tsx   # 결과 화면
│   ├── mypage/
│   │   └── page.tsx        # 마이페이지
│   └── onboarding/
│       └── page.tsx        # 온보딩
├── components/             # UI 컴포넌트
│   ├── ui/                 # shadcn/ui 기본 컴포넌트
│   ├── pose/               # 포즈 관련 컴포넌트
│   │   ├── CameraView.tsx
│   │   ├── PoseOverlay.tsx
│   │   └── SkeletonRenderer.tsx
│   ├── score/              # 스코어링 컴포넌트
│   │   ├── ScoreDisplay.tsx
│   │   ├── GradeIndicator.tsx
│   │   └── BodyPartScore.tsx
│   ├── practice/           # 연습 화면 컴포넌트
│   │   ├── SplitView.tsx
│   │   ├── ReferencePlayer.tsx
│   │   └── PlaybackControls.tsx
│   └── layout/             # 레이아웃 컴포넌트
│       ├── Header.tsx
│       └── Navigation.tsx
├── lib/                    # 핵심 로직
│   ├── pose/               # 포즈 감지 모듈
│   │   ├── detector.ts     # MediaPipe 초기화/감지
│   │   ├── normalizer.ts   # 관절점 정규화
│   │   └── types.ts        # 포즈 관련 타입
│   ├── scoring/            # 스코어링 모듈
│   │   ├── dtw.ts          # DTW 알고리즘
│   │   ├── scorer.ts       # 점수 계산
│   │   ├── grading.ts      # 등급 판정
│   │   └── bodyParts.ts    # 부위별 분석
│   └── db/                 # 데이터베이스 모듈
│       ├── database.ts     # Dexie DB 정의
│       ├── practiceRepo.ts # 연습 기록 CRUD
│       └── types.ts        # DB 타입
├── stores/                 # Zustand 스토어
│   ├── practiceStore.ts    # 연습 상태
│   ├── poseStore.ts        # 포즈 감지 상태
│   └── userStore.ts        # 사용자 상태
├── hooks/                  # 커스텀 훅
│   ├── useCamera.ts        # 카메라 접근
│   ├── usePoseDetection.ts # 포즈 감지
│   └── useScore.ts         # 스코어 계산
└── types/                  # 공통 타입
    └── index.ts
```

## 4. 핵심 기능

### P0 — MVP 필수

#### F1. 실시간 포즈 감지
- MediaPipe BlazePose로 33개 신체 랜드마크 추적
- 30fps 이상 처리 목표
- 카메라 권한 요청, 조명 부족 감지, 전신 미감지 시 안내
- WebGL/WASM 기반 브라우저 내 처리 (서버 전송 없음)

#### F2. 정확도 스코어링
- DTW 알고리즘으로 레퍼런스 안무와 비교
- 0-100점 점수 산출
- 5단계 판정: Perfect(95+), Great(80-94), Good(65-79), OK(50-64), Miss(0-49)
- 100ms 이내 결과 표시

#### F3. 신체부위별 분석
- 5개 구역: 좌팔, 우팔, 상체, 좌다리, 우다리
- 구역별 개별 점수 제공
- 취약 부위 하이라이트 및 개선 팁 제공

### P1 — 베타 이후

#### F4. 성장 기록 관리
- IndexedDB에 연습 이력 저장
- 연속 연습일, 안무별 최고 점수 추적
- 캘린더 뷰, 뱃지 시스템

#### F5. 재생 컨트롤
- 속도 조절: 0.5x / 0.75x / 1x
- 미러 모드
- 구간 반복 연습

## 5. 사용자 플로우

1. **온보딩**: 닉네임 설정 → 카메라 권한 허용 → 전신 감지 확인 → 시작
2. **안무 선택**: 홈에서 안무 목록 탐색 → 난이도/아티스트 필터 → 안무 선택
3. **연습**: 좌우 분할 화면 (좌: 레퍼런스, 우: 사용자) → 실시간 점수/피드백 표시
4. **결과 확인**: 전체 점수 + 판정 → 부위별 분석 → 개선 팁
5. **기록 관리**: 마이페이지에서 이력, 캘린더, 뱃지 확인

## 6. 데이터 모델

### User
- `id`: string (UUID)
- `nickname`: string
- `createdAt`: Date
- `settings`: UserSettings

### PracticeRecord
- `id`: string (UUID)
- `userId`: string
- `choreographyId`: string
- `totalScore`: number (0-100)
- `grade`: Grade
- `bodyPartScores`: BodyPartScore[]
- `duration`: number (초)
- `practicedAt`: Date

### Choreography
- `id`: string
- `title`: string
- `artist`: string
- `difficulty`: 'beginner' | 'intermediate' | 'advanced'
- `duration`: number (초)
- `referencePoses`: PoseFrame[]
- `thumbnailUrl`: string

### PoseFrame
- `timestamp`: number
- `landmarks`: Landmark[] (33개)

### Landmark
- `x`: number (0-1 정규화)
- `y`: number (0-1 정규화)
- `z`: number
- `visibility`: number

## 7. 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 홈 | 안무 목록, 필터링 |
| `/onboarding` | 온보딩 | 최초 접속 시 닉네임/카메라 설정 |
| `/practice/[id]` | 연습 | 분할 화면, 실시간 분석 |
| `/result/[id]` | 결과 | 점수, 부위별 분석 |
| `/mypage` | 마이페이지 | 기록, 캘린더, 뱃지 |

## 8. 핵심 지표

| 지표 | 목표 | 설명 |
|------|------|------|
| 모션 인식 정확도 | 85%+ | BlazePose 추적 정확도 |
| 스코어링 지연 | < 100ms | DTW 계산 결과 표시 시간 |
| FPS | 30+ | 포즈 감지 프레임 레이트 |
| 초기 로딩 | < 3초 | BlazePose 모델 로딩 포함 |

## 9. 개발 로드맵

| Phase | 기간 | 목표 |
|-------|------|------|
| Phase 1 (MVP) | 4개월 | 핵심 포즈 감지 + 스코어링, 단일 안무 기술 검증 |
| Phase 2 (Beta) | 3개월 | 3개 가맹점 파일럿, 정확도 80% 달성 |
| Phase 3 (Launch) | 3개월 | 30개 가맹점 배포, 안무 30개+ |
| Phase 4 (Growth) | 3개월+ | AR, B2C, 글로벌 확장 |

## 10. 제약 사항 및 전제

- 모든 AI 처리는 클라이언트(브라우저)에서 수행 → 서버 비용 최소화, 개인정보 보호
- WebGL/WASM 지원 브라우저 필수 (Chrome, Edge 권장)
- 웹캠 필수, 전신이 카메라에 잡혀야 정상 동작
- MVP 단계에서는 별도 백엔드 서버 없이 로컬 데이터만 사용

## 11. 현재 구현 상태 (2026-02-10)

### 배포

- **GitHub**: <https://github.com/yonghot/DanceFlow>
- **Vercel**: <https://danceflow-2bmkpwu8l-sk1597530-3914s-projects.vercel.app>

### MVP 구현 완료 항목

| 기능 | 상태 | 비고 |
| ---- | ---- | ---- |
| 온보딩 (닉네임 + 카메라) | 완료 | 2단계 플로우 |
| 홈 (안무 목록 + 난이도 필터) | 완료 | 6곡 K-pop 시드 데이터 |
| 연습 (카메라 + 스켈레톤 + 타이머) | 완료 | 전체 화면 몰입 모드 |
| 결과 (점수 + 등급 + 부위별 분석) | 완료 | 애니메이션 포함 |
| 마이페이지 (통계 + 기록) | 완료 | IndexedDB 기반 |
| DTW 스코어링 | 완료 | 레퍼런스 포즈 없을 시 트래킹 품질 점수 |
| 포즈 정규화 | 완료 | 엉덩이 중심 정규화 + 3D 각도 계산 |
| 테스트 | 완료 | 110개 테스트, 30% 커버리지 (vitest + istanbul) |
| 연습 게임 이펙트 | 완료 | 실시간 판정/콤보/스켈레톤 글로우/프로그레스 바 |
| 결과 화면 강화 | 완료 | 등급별 축하 메시지 + 파티클 배경 (Perfect/Great) |
| 홈 모바일 최적화 | 완료 | 카드 stagger 애니메이션 + 터치 인터랙션 |

### MVP와 원안 차이점

- **연습 화면**: 원안의 좌우 분할(레퍼런스/사용자) 대신, 전체 화면 카메라 + 스켈레톤 오버레이 방식으로 구현 (레퍼런스 포즈 데이터 미확보 상태)
- **레퍼런스 포즈**: 6곡 모두 `referencePoses: []` 상태. 트래킹 품질 점수(관절점 visibility 기반)로 대체 평가
- **AppShell 패턴**: PRD에 미기재된 `AppShell` 클라이언트 래퍼 컴포넌트 추가 (Zustand hydration 대기 + 온보딩 리다이렉트 + 조건부 Header/Navigation)
- **테스트 프레임워크**: vitest + @testing-library/react + jsdom 환경 구성 (istanbul 커버리지)
- **게임 이펙트**: 연습 중 실시간 판정 팝업(PERFECT/GREAT/GOOD), 콤보 카운터, 스켈레톤 글로우, 화면 플래시, 프로그레스 바 추가
