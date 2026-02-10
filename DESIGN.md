# DanceFlow - 디자인 시스템

> Version 1.0 | 2026년 2월

## 1. 디자인 컨셉

### 방향성
**다이나믹 / 에너제틱** — K-pop 댄스의 에너지와 생동감을 시각적으로 전달하는 UI. 밝고 대담한 컬러, 부드러운 애니메이션, 직관적 인터랙션.

### 디자인 원칙
- **명확성**: 연습 중 한눈에 파악 가능한 정보 구조
- **몰입감**: 연습 화면에서 불필요한 UI 요소 최소화
- **피드백 즉시성**: 점수와 판정을 시각적으로 즉시 전달
- **접근성**: 연습실 환경 (태블릿, 넓은 시야각) 고려

## 2. 컬러 시스템

### 기본 컬러

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--background` | `#0A0A0F` | 배경 (다크) |
| `--foreground` | `#FAFAFA` | 기본 텍스트 |
| `--card` | `#12121A` | 카드 배경 |
| `--card-foreground` | `#FAFAFA` | 카드 텍스트 |
| `--muted` | `#1E1E2A` | 비활성 배경 |
| `--muted-foreground` | `#A0A0B0` | 비활성 텍스트 |
| `--border` | `#2A2A3A` | 테두리 |

### 액센트 컬러

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--primary` | `#7C3AED` | 주요 액션 (바이올렛) |
| `--primary-foreground` | `#FFFFFF` | 주요 액션 텍스트 |
| `--accent` | `#06B6D4` | 보조 강조 (시안) |
| `--accent-foreground` | `#FFFFFF` | 보조 강조 텍스트 |

### 등급 컬러

| 등급 | 컬러 | 값 |
|------|------|-----|
| Perfect | 골드 글로우 | `#FFD700` |
| Great | 바이올렛 | `#7C3AED` |
| Good | 시안 | `#06B6D4` |
| OK | 슬레이트 | `#64748B` |
| Miss | 레드 | `#EF4444` |

### 그라데이션

| 이름 | 값 | 용도 |
|------|-----|------|
| `gradient-primary` | `#7C3AED → #06B6D4` | CTA 버튼, 주요 강조 |
| `gradient-score` | `#FFD700 → #7C3AED` | 점수 게이지 |
| `gradient-energy` | `#EC4899 → #7C3AED → #06B6D4` | 에너제틱 배경 효과 |

## 3. 타이포그래피

| 용도 | 폰트 | 크기 | 굵기 |
|------|------|------|------|
| 제목 (H1) | Pretendard | 32px | Bold (700) |
| 부제목 (H2) | Pretendard | 24px | SemiBold (600) |
| 본문 | Pretendard | 16px | Regular (400) |
| 캡션 | Pretendard | 14px | Regular (400) |
| 점수 대형 | Pretendard | 72px | ExtraBold (800) |
| 판정 텍스트 | Pretendard | 28px | Bold (700) |

## 4. 컴포넌트 시스템

### shadcn/ui 활용 목록

| 컴포넌트 | 용도 | 커스터마이징 |
|----------|------|-------------|
| `Button` | CTA, 액션 버튼 | 그라데이션 variant 추가 |
| `Card` | 안무 카드, 결과 카드 | 다크 테마 + 글로우 효과 |
| `Dialog` | 카메라 권한, 확인창 | 다크 배경 |
| `Progress` | 점수 게이지, 로딩 | 그라데이션 fill |
| `Badge` | 등급 표시, 난이도 | 등급별 컬러 |
| `Tabs` | 마이페이지 탭 | 기본 사용 |
| `Avatar` | 사용자 프로필 | 기본 사용 |
| `Slider` | 속도 조절 | 커스텀 트랙 컬러 |
| `Select` | 필터 드롭다운 | 다크 테마 |
| `Calendar` | 연습 기록 캘린더 | 연습일 하이라이트 |
| `Tooltip` | 도움말 | 기본 사용 |
| `Skeleton` | 로딩 상태 | 다크 테마 |

### 커스텀 컴포넌트 (직접 구현)

| 컴포넌트 | 설명 |
|----------|------|
| `SplitView` | 연습 화면 좌우 분할 (레퍼런스 / 사용자) |
| `PoseOverlay` | 카메라 위에 관절점 스켈레톤 오버레이 |
| `ScorePopup` | 판정 팝업 애니메이션 (Perfect, Great 등) |
| `BodyPartHeatmap` | 부위별 점수 시각화 (인체 실루엣) |
| `GradeGauge` | 원형/반원형 점수 게이지 |
| `StreakCounter` | 연속 연습일 카운터 |

## 5. 레이아웃

### 화면별 레이아웃

**홈 화면**
- 상단: 헤더 (로고, 프로필)
- 중앙: 안무 카드 그리드 (2-3열)
- 하단: 네비게이션

**연습 화면** (몰입 모드)
- 좌측 50%: 레퍼런스 영상
- 우측 50%: 사용자 카메라 + 스켈레톤 오버레이
- 상단 오버레이: 실시간 점수
- 하단 오버레이: 재생 컨트롤

**결과 화면**
- 상단: 종합 점수 + 등급 (대형)
- 중앙: 부위별 분석 차트
- 하단: 개선 팁, 다시 연습 CTA

### 반응형 브레이크포인트

| 명칭 | 크기 | 대상 |
|------|------|------|
| `sm` | 640px | 모바일 |
| `md` | 768px | 태블릿 세로 |
| `lg` | 1024px | 태블릿 가로 |
| `xl` | 1280px | 데스크톱 |

**우선 지원**: 태블릿 가로 (lg, 1024px) — 연습실 환경 기준

## 6. 애니메이션 & 모션

### 기본 트랜지션
- 페이지 전환: `ease-out 300ms`
- 카드 호버: `scale(1.02) 200ms`
- 버튼 클릭: `scale(0.97) 100ms`

### 점수 애니메이션
- 판정 팝업: `scale(0→1.2→1) + opacity(0→1→0)` 800ms
- 점수 카운트업: 숫자가 0에서 최종 점수까지 증가 1200ms
- 등급 글로우: `box-shadow pulse` 반복 (Perfect/Great)

### 라이브러리
- `framer-motion`: 페이지 전환, 복잡한 애니메이션
- Tailwind `animate-*`: 간단한 반복 애니메이션

## 7. 아이콘

- **라이브러리**: `lucide-react`
- **크기**: 기본 20px, 네비게이션 24px
- **스타일**: stroke width 1.5px

## 8. 다크 모드

- **기본 테마: 다크 모드** (에너제틱 컨셉 + 연습실 환경에 적합)
- 라이트 모드는 MVP에서 미지원
- shadcn/ui의 `dark` 클래스 기반

## 9. 레퍼런스

| 서비스 | 참고 요소 |
|--------|----------|
| Just Dance (Ubisoft) | 점수 시스템 UI, 판정 애니메이션, 네온 컬러 |
| Steezy Studio | 댄스 연습 UX 플로우, 분할 화면 |
| Spotify Wrapped | 성장 기록 시각화, 카드 기반 리포트 |
| Apple Fitness+ | 운동 중 오버레이 UI, 몰입형 레이아웃 |

## 10. 현재 구현 상태 (2026-02-10)

### shadcn/ui 구현 완료

| 컴포넌트 | 파일 | 커스터마이징 |
|----------|------|-------------|
| `Button` | `ui/button.tsx` | `gradient` variant 추가 (gradient-primary) |
| `Card` | `ui/card.tsx` | 다크 테마 기본 적용 |
| `Badge` | `ui/badge.tsx` | 등급별 variant (perfect/great/good/ok/miss) |
| `Progress` | `ui/progress.tsx` | `gradientVariant` prop, 값 클램핑 |
| `Skeleton` | `ui/skeleton.tsx` | 다크 테마 기본 |

### 커스텀 컴포넌트 구현 완료

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `AppShell` | `layout/AppShell.tsx` | Zustand hydration 대기 + 온보딩 리다이렉트 + 조건부 Chrome |
| `Header` | `layout/Header.tsx` | 로고 + 마이페이지 링크, sticky |
| `Navigation` | `layout/Navigation.tsx` | 하단 탭 (홈/연습[disabled]/마이) |
| `ScoreDisplay` | `score/ScoreDisplay.tsx` | 0→최종 점수 카운트업 애니메이션 (1.5s) |
| `GradeIndicator` | `score/GradeIndicator.tsx` | 등급 배지 + 글로우 효과, sm/lg 사이즈 |
| `BodyPartScoreDisplay` | `score/BodyPartScore.tsx` | 5부위 점수 리스트 + Progress bar |
| `JudgementPopup` | `practice/JudgementPopup.tsx` | 실시간 판정 팝업 (PERFECT/GREAT/GOOD), scale+fade 애니메이션 |
| `ComboCounter` | `practice/ComboCounter.tsx` | 콤보 카운터 (3+표시, 10+ 그라데이션), spring 바운스 |
| `GradeMessage` | `result/GradeMessage.tsx` | 등급별 한글 축하 메시지, delay 등장 |
| `ParticleBackground` | `result/ParticleBackground.tsx` | Perfect/Great 등급 파티클 배경 (20개 CSS 파티클) |

### 게임 이펙트 시스템

| 이펙트 | 위치 | 설명 |
|--------|------|------|
| 실시간 판정 | 연습 화면 | 품질 95+ PERFECT, 85+ GREAT, 75+ GOOD (0.5초 쿨다운) |
| 콤보 카운터 | 연습 화면 우상단 | 품질 75+ 연속 시 증가, 60 미만 리셋 |
| 스켈레톤 글로우 | 연습 화면 | 품질에 따라 관절점 크기/선 두께/투명도 동적 조절, 80+ shadowBlur |
| 화면 플래시 | 연습 화면 | PERFECT/GREAT 판정 시 0.15초 테두리 플래시 |
| 프로그레스 바 | 연습 화면 하단 | gradient-primary, 시간 경과 표시 |
| 파티클 배경 | 결과 화면 | Perfect(골드)/Great(바이올렛-시안) 20개 상승 파티클 |
| 카드 인터랙션 | 홈 화면 | whileHover scale 1.03, whileTap scale 0.97, stagger 0.08초 |

### 미구현 (P1 이후)

- `SplitView`, `ReferencePlayer`, `PlaybackControls` — 레퍼런스 포즈 데이터 확보 후
- `BodyPartHeatmap` — 인체 실루엣 시각화
- `Calendar`, `Tabs` — 마이페이지 확장 시
- `Dialog`, `Slider`, `Select`, `Avatar`, `Tooltip` — 해당 기능 구현 시
