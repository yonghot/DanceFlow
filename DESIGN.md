# DanceFlow - 디자인 시스템

> Version 2.0 | 2026년 3월

## 3-1. 디자인 컨셉

**방향성**: Just Dance 스타일 네온 게임 UI — K-pop 댄스의 에너지와 생동감을 시각적으로 전달
**테마**: 다크 모드 전용 (연습실 환경 최적화)

**디자인 원칙**
- **명확성**: 연습 중 한눈에 파악 가능한 정보 구조
- **몰입감**: 연습 화면에서 불필요한 UI 최소화 (AppShell 조건부 크롬)
- **피드백 즉시성**: 점수/판정을 게임 이펙트로 즉시 전달
- **접근성**: 연습실 태블릿 환경 (넓은 시야각, 터치 인터랙션)

## 3-2. 컬러 시스템

### 기본 컬러
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--background` | `#0A0A0F` | 배경 |
| `--foreground` | `#FAFAFA` | 기본 텍스트 |
| `--card` | `#12121A` | 카드 배경 |
| `--muted` | `#1E1E2A` | 비활성 배경 |
| `--muted-foreground` | `#A0A0B0` | 비활성 텍스트 |
| `--border` | `#2A2A3A` | 테두리 |

### 네온 컬러 (Tailwind 확장)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `neon-pink` | `#FF2D78` | 주요 액센트 |
| `neon-cyan` | `#00F0FF` | 보조 강조 |
| `neon-gold` | `#FFD700` | Perfect 등급 |
| `neon-purple` | `#B537F2` | Great 등급, 그라데이션 |
| `neon-red` | `#FF3355` | Miss/에러 |

### 등급 컬러
| 등급 | 컬러 | 값 |
|------|------|-----|
| Perfect | 골드 글로우 | `#FFD700` |
| Great | 퍼플-시안 그라데이션 | `#B537F2 → #00F0FF` |
| Good | 시안 | `#00F0FF` |
| OK | 슬레이트 | `#64748B` |
| Miss | 레드 | `#FF3355` |

### 그라데이션
| 이름 | 값 | 용도 |
|------|-----|------|
| `gradient-primary` | `#FF2D78 → #B537F2` | CTA 버튼, 프로그레스 바 |
| `gradient-score` | `#FFD700 → #B537F2` | 점수 게이지 |
| `gradient-energy` | `#FF2D78 → #B537F2 → #00F0FF` | 에너제틱 배경 |

## 3-3. 타이포그래피

### 폰트
- **Primary**: Pretendard Variable (CDN: jsdelivr, subset: dynamic)
- **Fallback**: Pretendard, system-ui, sans-serif

### 타이포그래피 스케일 (Tailwind 확장)
| 토큰 | 크기 | 행간 | 굵기 | 용도 |
|------|------|------|------|------|
| `display-xl` | 4.5rem (72px) | 1 | 800 | 점수 대형 |
| `display` | 3.75rem (60px) | 1 | 700 | 히어로 타이틀 |
| `display-sm` | 3rem (48px) | 1 | 700 | 서브 히어로 |
| `heading-xl` | 2.25rem (36px) | 1.2 | 700 | 페이지 타이틀 |
| `heading` | 1.875rem (30px) | 1.2 | 600 | 섹션 제목 |
| `heading-sm` | 1.5rem (24px) | 1.3 | 600 | 카드 제목 |
| `subheading` | 1.125rem (18px) | 1.4 | 500 | 부제, 강조 텍스트 |
| 본문 | 1rem (16px) | 1.5 | 400 | 기본 텍스트 |
| 캡션 | 0.875rem (14px) | 1.5 | 400 | 보조 텍스트 |
| 판정 텍스트 | 1.75rem (28px) | 1 | 700 | 게임 판정 팝업 |

### 텍스트 스타일
- `neon-text-pink`: 핑크 네온 글로우 (text-shadow)
- `neon-text-cyan`: 시안 네온 글로우
- `text-gradient-primary`: pink→purple 그라데이션 텍스트
- `text-muted-foreground`: 보조 텍스트 색상 (#A0A0B0)

## 3-4. 컴포넌트 시스템

### shadcn/ui 구현 완료
| 컴포넌트 | 커스터마이징 |
|----------|-------------|
| `Button` | `gradient` variant (gradient-primary) |
| `Card` | 다크 테마 + glassmorphism |
| `Badge` | 등급별 variant (perfect/great/good/ok/miss) |
| `Progress` | `gradientVariant` prop, 값 클램핑 |
| `Skeleton` | 다크 테마 |

### 커스텀 컴포넌트
| 컴포넌트 | 설명 |
|----------|------|
| `AppShell` | Zustand hydration 대기 + 조건부 크롬 (몰입 페이지 숨김) |
| `Header` | sticky, 로고 + 프로필/로그아웃 |
| `Navigation` | 하단 탭 (홈/연습[disabled]/마이) |
| `ScoreDisplay` | 0→최종 점수 카운트업 (1.5s easing) |
| `GradeIndicator` | 등급 배지 + 글로우/레인보우 효과, sm/lg |
| `BodyPartScoreDisplay` | 5부위 점수 + Progress bar |
| `JudgementPopup` | 실시간 판정 (PERFECT/GREAT/GOOD), scale+fade |
| `ComboCounter` | 콤보 3+ 표시, 10+ 그라데이션, spring 바운스 |
| `GradeMessage` | 등급별 한글 축하 메시지 |
| `ParticleBackground` | Perfect/Great 20개 상승 파티클 |
| `RecordingPreview` | Canvas 기반 포즈 프레임 재생 (바이너리 서치) |
| `LoginForm` / `SignupForm` | 이메일/비밀번호 + Google OAuth |

## 3-5. 레이아웃

### 컨테이너 & 여백
- **섹션 컨테이너**: `section-container` → max-w-7xl + px-4 sm:px-6 lg:px-8
- **섹션 간 여백**: py-16~py-24 (넉넉한 호흡 공간)
- **카드 내부**: p-6 sm:p-8, gap-6
- **안전 영역**: `pb-safe` (iOS safe area), `pb-20` (하단 네비게이션)

### 화면별
- **홈**: 히어로 섹션 (배지+타이틀+CTA+Orbs) + 소셜프루프 통계 + 안무 카드 그리드 (2열) + 하단 CTA
- **연습/레퍼런스 녹화**: 전체화면 카메라 + 스켈레톤 오버레이 + 게임 이펙트 (Header/Nav 숨김)
- **결과**: 곡 정보 + 종합 점수(카운트업) + 등급 + 상세 점수(2열) + 부위별 분석 + 파티클 배경
- **로그인/회원가입**: 좌우 분할 (lg+), 좌측 Unsplash 이미지, 우측 폼 (모바일은 폼만)
- **마이페이지**: 프로필 카드 (아바타+이름) + 통계 그리드 (4열→2열) + 연습 기록 리스트
- **설정**: 브랜드 헤더 + 단계 인디케이터 + 중앙 정렬 폼
- **404**: 중앙 정렬 (애니메이션 아이콘 + 그라데이션 404 + 이중 CTA)

### 반응형 브레이크포인트
| 명칭 | 크기 | 대상 |
|------|------|------|
| `sm` | 640px | 모바일 |
| `md` | 768px | 태블릿 세로 |
| `lg` | 1024px | 태블릿 가로 (우선 지원) |
| `xl` | 1280px | 데스크톱 |

## 3-6. 애니메이션 & 게임 이펙트

### 기본 트랜지션
- 페이지 전환: ease-out 300ms
- 카드 호버: scale(1.03~1.05) + shadow-xl + translate-y(-4px), stagger 0.08초
- 버튼 클릭: scale(0.97) 100ms
- 이미지 호버: scale(1.10) + transition-transform duration-500

### 페이지 애니메이션 (framer-motion)
- **섹션 진입**: `sectionVariants` (opacity: 0→1, y: 24→0, delay 순차)
- **whileInView**: 스크롤 기반 요소 등장 (once: true, amount: 0.3)
- **staggerChildren**: 카드/리스트 아이템 순차 등장 (0.08~0.1초 간격)
- **커스텀 ease**: `[0.22, 1, 0.36, 1] as const` (TypeScript 호환)
- **로고 float**: `animate-float` (y축 무한 반복)

### 게임 이펙트 시스템
| 이펙트 | 위치 | 트리거 |
|--------|------|--------|
| 실시간 판정 팝업 | 연습 화면 중앙 | 품질 95+ PERFECT, 85+ GREAT, 75+ GOOD (0.5초 쿨다운) |
| 콤보 카운터 | 연습 화면 우상단 | 품질 75+ 연속 시 증가, 60 미만 리셋 |
| 스켈레톤 글로우 | 카메라 오버레이 | 품질에 따라 관절점 크기/선 두께/투명도 동적 조절 |
| 화면 플래시 | 연습 화면 전체 | PERFECT/GREAT 판정 시 0.15초 테두리 |
| 프로그레스 바 | 하단 | gradient-primary, 시간 경과 |
| 파티클 배경 | 결과 화면 | Perfect(골드)/Great(퍼플-시안) 20개 상승 |
| 점수 카운트업 | 결과 화면 | 0→최종 점수 1.5초 easing |

### 라이브러리
- `framer-motion`: 페이지 전환, 복잡한 시퀀스 애니메이션
- Tailwind `animate-*` + `@keyframes`: 글로우, 펄스, 셰이크

## 3-7. Glassmorphism & 스타일 패턴

### CSS 클래스
- `glass`: backdrop-blur + 반투명 배경 + 미묘한 테두리
- `glass-neon`: glass + 네온 컬러 그림자 효과
- `hero-gradient`: 네온 컬러 radial-gradient 배경 (히어로 섹션)
- `card-premium`: rounded-xl + hover lift(translateY -4px) + shadow 변화
- `section-container`: max-w-7xl + 반응형 패딩
- `img-overlay`: ::after pseudo-element 그라데이션 오버레이
- `divider-neon`: 네온 그라데이션 구분선
- `gradient-primary`: pink→purple 그라데이션 배경
- `shadow-neon-pink`: 핑크 네온 박스 쉐도우
- 카운트다운: 스케일 애니메이션 (3, 2, 1)
- 스켈레톤: 미러링 비디오 (scaleX(-1))

### 프리미엄 쉐도우 (Tailwind 확장)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `card-hover` | `0 8px 30px rgba(0,0,0,0.3)` | 카드 호버 |
| `premium` | `0 4px 20px rgba(0,0,0,0.25)` | 프리미엄 카드 |
| `premium-hover` | `0 8px 40px rgba(0,0,0,0.35)` | 프리미엄 호버 |

### 이미지 시스템
- **실사 이미지**: Unsplash CDN (next.config.mjs remotePatterns 설정)
- **컴포넌트**: next/image (width/height/alt 필수)
- **오버레이**: 그라데이션 오버레이 (from-black/60 via-black/40 to-black/80)
- **카드 이미지**: aspect-[4/3], object-cover, rounded-t-xl
- **호버 효과**: scale-110 + transition-transform duration-500

### 아이콘
- **라이브러리**: lucide-react
- **크기**: 기본 20px (h-5 w-5), 네비게이션 20px, 히어로 24px
- **스타일**: stroke width 1.5px
- **색상**: text-neon-pink (활성), text-muted-foreground (비활성)

### 로딩/에러/빈 상태
- **Skeleton**: shadcn/ui Skeleton 컴포넌트 (홈 카드, 마이페이지 기록, AppShell 초기)
- **에러 페이지**: 아이콘 + 그라데이션 텍스트 + 안내 메시지 + CTA (404 페이지)
- **빈 상태**: Music 아이콘 + 설명 텍스트 + CTA 버튼 (홈, 마이페이지)

## 3-8. 미구현 (P1 이후)

- `SplitView`, `ReferencePlayer`, `PlaybackControls` — 레퍼런스 비교 뷰
- `BodyPartHeatmap` — 인체 실루엣 시각화
- `Calendar`, `Tabs` — 마이페이지 확장
- `Dialog`, `Slider`, `Select`, `Avatar`, `Tooltip` — 해당 기능 구현 시
- 라이트 모드 — MVP 미지원
