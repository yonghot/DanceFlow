# DanceFlow - 제품 요구사항 정의서 (PRD)

> Version 2.0 | 2026년 3월

## 2-1. 제품 개요

**DanceFlow**는 웹캠 기반 AI 모션인식 댄스 평가 웹 애플리케이션이다.
사용자의 댄스 동작을 실시간으로 인식하고, 레퍼런스 안무와 비교하여 정확도 점수와 신체 부위별 교정 피드백을 제공한다.

**핵심 가치**: "모든 연습실을 개인 트레이닝 스튜디오로" — 브라우저와 웹캠만으로 객관적인 댄스 피드백 제공

**타겟 사용자**: 20-30대 여성 취미 댄서 (K-pop 커버댄스)
**이용 환경**: 댄스 연습실 태블릿 또는 개인 노트북
**비즈니스 모델**: B2B (댄스 연습실 프랜차이즈 월 구독)

## 2-2. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | TypeScript, force-dynamic |
| UI | shadcn/ui + Tailwind CSS | 네온 테마 커스터마이징 |
| AI/포즈 | MediaPipe BlazePose | WebGL/WASM, 33개 관절점, GPU 가속 |
| 상태관리 | Zustand | 경량 전역 상태 |
| 인증/DB | Supabase | PostgreSQL + Auth + Storage |
| 애니메이션 | framer-motion | 페이지 전환, 게임 이펙트 |
| 아이콘 | lucide-react | stroke 1.5px |
| 패키지 매니저 | pnpm | 권장 |
| 테스트 | Vitest + istanbul | jsdom 환경 |

## 2-3. 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx          # 루트 레이아웃 (다크 모드, AppShell)
│   ├── page.tsx            # 홈 (안무 목록)
│   ├── login/page.tsx      # 로그인
│   ├── signup/page.tsx     # 회원가입
│   ├── setup/page.tsx      # 온보딩 (닉네임 + 카메라)
│   ├── practice/[id]/      # 연습 화면
│   ├── reference/[choreographyId]/record/ # 레퍼런스 녹화
│   ├── result/[id]/        # 결과 화면
│   ├── mypage/             # 마이페이지
│   ├── auth/callback/      # OAuth 콜백
│   └── not-found.tsx       # 404
├── components/
│   ├── layout/             # AppShell, Header, Navigation
│   ├── auth/               # LoginForm, SignupForm
│   ├── practice/           # ComboCounter, JudgementPopup
│   ├── result/             # GradeMessage, ParticleBackground
│   ├── reference/          # RecordingPreview
│   ├── score/              # ScoreDisplay, GradeIndicator, BodyPartScore
│   └── ui/                 # shadcn/ui (Button, Card, Badge, Progress, Skeleton)
├── hooks/                  # useCamera, usePoseDetection, useScore, useAuth, useReference
├── stores/                 # userStore, practiceStore, poseStore (Zustand)
├── lib/
│   ├── pose/               # detector, normalizer, compression, types
│   ├── scoring/            # dtw, grading
│   ├── supabase/           # client, server, middleware, repos/, poseStorage
│   └── utils.ts            # cn() 유틸리티
├── types/index.ts          # 공통 타입
└── middleware.ts            # 인증 미들웨어
```

## 2-4. 핵심 기능

### P0 — MVP 필수

**F1. 실시간 포즈 감지**
- MediaPipe BlazePose 33개 랜드마크 추적 (GPU 가속, CPU 폴백)
- 30fps+ 처리, 카메라 권한/조명/전신 감지 안내
- 클라이언트 전용 (서버 전송 없음)

**F2. 정확도 스코어링**
- 레퍼런스 비교: 정확도(70%) + 타이밍 DTW(30%) 가중 평균
- 트래킹 품질 모드: 레퍼런스 없을 시 관절점 visibility 기반 평가
- 5단계 판정: Perfect(95+), Great(80-94), Good(65-79), OK(50-64), Miss(0-49)

**F3. 신체부위별 분석**
- 5개 구역: 좌팔, 우팔, 상체, 좌다리, 우다리
- 구역별 개별 점수, 취약 부위 하이라이트

**F4. 인증 시스템**
- Supabase Auth (이메일/비밀번호 + Google OAuth)
- 미들웨어 기반 보호 라우트 (/mypage, /practice/*, /reference/*)
- 자동 프로필 생성 (DB 트리거)

**F5. 레퍼런스 녹화**
- 카메라로 레퍼런스 안무 녹화 (30초)
- 포즈 데이터 압축 (CompactPoseData + Gzip) → Supabase Storage
- 안무별 Primary 레퍼런스 관리

### P1 — 베타 이후

**F6. 성장 기록 관리**: 연습 이력, 연속일수, 안무별 최고점수
**F7. 재생 컨트롤**: 속도 조절 (0.5x/0.75x/1x), 미러 모드, 구간 반복
**F8. SplitView**: 좌우 분할 (레퍼런스/사용자) 비교 화면

## 2-5. 사용자 플로우

1. **회원가입/로그인** → 이메일 또는 Google OAuth
2. **온보딩(setup)** → 닉네임 설정 + 카메라 권한 허용
3. **안무 선택** → 홈에서 난이도 필터링, 카드 선택
4. **연습** → 전체화면 카메라 + 스켈레톤 오버레이 + 게임 이펙트
5. **결과** → 종합 점수 + 등급 + 부위별 분석 + 축하 애니메이션
6. **마이페이지** → 통계, 연습 기록, 연속일수

## 2-6. 데이터 모델

### profiles (auth.users 확장)
`id` UUID PK, `nickname` 2-20자, `avatar_url`, `settings` JSONB (mirrorMode, playbackSpeed), `created_at`, `updated_at`

### choreographies
`id` UUID PK, `title`, `artist`, `difficulty` (beginner|intermediate|advanced), `duration` 초, `thumbnail_url`, `audio_url`, `created_by` FK, `created_at`, `updated_at`

### reference_poses
`id` UUID PK, `choreography_id` FK, `recorder_id` FK, `pose_data_url` Storage경로, `frame_count`, `duration_ms`, `status` (processing|active|archived), `is_primary` BOOLEAN, `created_at`

### practice_sessions
`id` UUID PK, `user_id` FK, `choreography_id` FK, `reference_id` FK nullable, `total_score`, `grade`, `accuracy_score`, `timing_score`, `body_part_scores` JSONB, `pose_data_url`, `frame_count`, `duration_ms`, `created_at`

## 2-7. 라우팅

| 경로 | 페이지 | 접근 |
|------|--------|------|
| `/` | 홈 (안무 목록) | 공개 |
| `/login` | 로그인 | 공개 |
| `/signup` | 회원가입 | 공개 |
| `/setup` | 온보딩 | 인증 |
| `/practice/[id]` | 연습 | 인증 |
| `/reference/[choreographyId]/record` | 레퍼런스 녹화 | 인증 |
| `/result/[id]` | 결과 | 인증 |
| `/mypage` | 마이페이지 | 인증 |
| `/auth/callback` | OAuth 콜백 | 공개 |

## 2-8. 핵심 지표

| 지표 | 목표 |
|------|------|
| 모션 인식 정확도 | 85%+ |
| 스코어링 지연 | < 100ms |
| FPS | 30+ |
| 초기 로딩 | < 3초 |
| 포즈 압축률 | 85-90% (Gzip) |

## 2-9. 개발 로드맵

| Phase | 기간 | 목표 |
|-------|------|------|
| Phase 1 (MVP) | 4개월 | 포즈 감지 + 스코어링 + 인증 + 레퍼런스 녹화 |
| Phase 2 (Beta) | 3개월 | 3개 가맹점 파일럿, 정확도 80% |
| Phase 3 (Launch) | 3개월 | 30개 가맹점, 안무 30개+ |
| Phase 4 (Growth) | 3개월+ | AR, B2C, 글로벌 확장 |

## 2-10. 제약 사항

- 모든 AI 처리는 클라이언트(브라우저)에서 수행 → 서버 비용 최소화, 개인정보 보호
- WebGL/WASM 지원 브라우저 필수 (Chrome, Edge 권장)
- 웹캠 필수, 전신 카메라 프레임 내 필요
- Supabase 미설정 시 인증/DB 기능 없이 로컬 모드 동작 (graceful degradation)

## 2-11. 현재 구현 상태

### 배포
- **GitHub**: https://github.com/yonghot/DanceFlow
- **Vercel**: https://danceflow-2bmkpwu8l-sk1597530-3914s-projects.vercel.app

### 구현 완료
| 기능 | 상태 |
|------|------|
| 회원가입/로그인 (이메일+Google) | ✅ |
| 온보딩 (닉네임+카메라) | ✅ |
| 홈 (안무 목록+난이도 필터) | ✅ |
| 연습 (카메라+스켈레톤+타이머+게임이펙트) | ✅ |
| 레퍼런스 녹화 + 압축 저장 | ✅ |
| DTW 스코어링 (정확도+타이밍) | ✅ |
| 결과 (점수+등급+부위별+파티클) | ✅ |
| 마이페이지 (통계+기록) | ✅ |
| 테스트 110개 (vitest+istanbul) | ✅ |

### MVP와 원안 차이점
- 연습 화면: 좌우 분할 대신 전체화면 카메라 + 스켈레톤 오버레이
- AppShell 패턴 추가 (PRD 미기재)
- Just Dance 스타일 네온 게임 UI/UX 리디자인
- Supabase 기반 인증/DB로 전환 (원안: IndexedDB/Dexie.js)
