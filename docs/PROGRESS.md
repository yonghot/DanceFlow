# DanceFlow 진행 현황

## 방법론 마이그레이션 (2026-03-08)

### 현재 상태

**구현된 기능 (P0 전체 완료)**
- 실시간 포즈 감지 (MediaPipe BlazePose, 33관절, GPU 가속)
- 정확도 스코어링 (정확도 70% + 타이밍 DTW 30% 가중 평균)
- 신체부위별 분석 (5구역 개별 점수)
- 인증 시스템 (이메일 + Google OAuth, Supabase Auth)
- 레퍼런스 녹화 (CompactPoseData + Gzip 압축, Storage 저장)
- 게임 이펙트 (판정 팝업, 콤보, 글로우, 플래시, 프로그레스)
- 결과 화면 (카운트업, 등급 배지, 파티클, 축하 메시지)
- 홈 (안무 6곡 목록, 난이도 필터, 모바일 최적화)
- 온보딩 (닉네임 + 카메라 설정)
- 마이페이지 (통계, 연습 기록, 연속일수)

**배포**
- GitHub: https://github.com/yonghot/DanceFlow
- Vercel: https://danceflow-2bmkpwu8l-sk1597530-3914s-projects.vercel.app

**기술 스택**
- Next.js 14 (App Router) + TypeScript
- shadcn/ui + Tailwind CSS + framer-motion
- MediaPipe BlazePose (WebGL/WASM)
- Zustand (상태관리)
- Supabase (Auth + PostgreSQL + Storage)
- Vitest + Istanbul (110 테스트, 30% 커버리지)

### 기술 결정

| 결정 | 선택 | 이유 |
|------|------|------|
| 인증 | Supabase Auth | 이메일 + OAuth, RLS 연동, 서버리스 |
| DB | Supabase PostgreSQL | RLS로 보안, 실시간 구독 가능, 마이그레이션 관리 |
| 파일 저장 | Supabase Storage | 포즈 데이터 Gzip 압축 저장, CDN |
| API 응답 | Supabase Client SDK | REST 대신 SDK 직접 호출, 타입 안전 |
| AI 처리 | 클라이언트 전용 | 서버 비용 0, 실시간 피드백, 개인정보 보호 |
| DTW | Windowed (10%) | O(n²)→~O(n), 클라이언트 실행 가능 |
| 렌더링 | force-dynamic | 인증 상태 항상 최신 |
| 디자인 | Just Dance 네온 | 게임적 몰입감, 다크 모드 전용 |

### 알려진 이슈 / TODO

1. **레퍼런스 포즈 미확보**: 6곡 시드 데이터 모두 빈 배열 → 실제 녹화 데이터 필요
2. **테스트 커버리지 30%**: 코어 로직 (DTW, normalizer, compression) 중심 확대 필요
3. **Supabase 환경변수 필수**: `.env.local`에 URL + ANON_KEY 설정 필요 (미설정 시 로컬 모드)
4. **esbuild/unrs-resolver 빌드 스크립트 경고**: `pnpm approve-builds` 필요할 수 있음
5. **Navigation 연습 탭 비활성화**: 직접 연습 진입 경로 없음 (홈 카드에서만 접근)

---

## 프리미엄 UI/UX 개선 (2026-03-08)

### 개선 영역

**1. 타이포그래피 시스템**
- Pretendard Variable 웹폰트 적용 (CDN: jsdelivr, dynamic subset)
- Tailwind fontSize 확장: display-xl(72px) ~ subheading(18px) 7단계 위계
- 네온 글로우 텍스트 스타일 (neon-text-pink, neon-text-cyan, text-gradient-primary)

**2. 히어로/랜딩 섹션 (홈)**
- 대형 타이틀 (text-display) + 감성적 서브카피 + 그라데이션 CTA 버튼
- 네온 radial-gradient 배경 (hero-gradient)
- 소셜 프루프 통계 섹션 (1,200+ 댄서, 15,000+ 세션, 98% 만족도)
- 하단 CTA glass-neon 카드

**3. 여백과 레이아웃**
- section-container 유틸리티 (max-w-7xl + 반응형 패딩)
- 섹션 간 py-16~py-24 넉넉한 여백
- 카드 내부 p-6 sm:p-8 충분한 패딩
- pb-safe (iOS) + pb-20 (하단 네비게이션) 안전 영역

**4. 카드와 컴포넌트**
- card-premium: rounded-xl + hover lift (translateY -4px) + shadow 변화
- 프리미엄 쉐도우 시스템 (card-hover, premium, premium-hover)
- glass + glass-neon 스타일 일관 적용
- 버튼 hover/active 트랜지션 (duration-200~300)

**5. 이미지와 비주얼**
- Unsplash 실사 이미지 적용 (next.config.mjs remotePatterns)
- next/image 컴포넌트 (width/height/alt 필수)
- 카드 이미지: aspect-[4/3] + object-cover + hover scale-110
- 로그인/회원가입: 좌우 분할 레이아웃 + Unsplash 배경 이미지 (lg+)
- 그라데이션 오버레이 (img-overlay, from-black/60)

**6. 마이크로 인터랙션 (framer-motion)**
- sectionVariants: 순차 페이드인 (delay 기반)
- whileInView: 스크롤 기반 요소 등장 (once: true)
- staggerChildren: 카드/리스트 아이템 순차 등장
- 커스텀 ease: [0.22, 1, 0.36, 1] as const (TS 호환)
- animate-float: 로고/아이콘 y축 무한 반복

**7. 로딩/에러/빈 상태**
- Skeleton UI: 홈 카드, 마이페이지 기록, AppShell 초기 로딩
- 404 페이지: framer-motion 애니메이션 + 그라데이션 404 + 이중 CTA + 장식 orbs
- 빈 상태: Music 아이콘 + 안내 메시지 + CTA 버튼 (홈, 마이페이지)

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `next.config.mjs` | Unsplash remotePatterns 추가 |
| `src/app/layout.tsx` | Pretendard Variable 폰트 CDN 링크 |
| `tailwind.config.ts` | fontFamily, fontSize 스케일, boxShadow 확장 |
| `src/app/globals.css` | 프리미엄 유틸리티 클래스 추가 |
| `src/app/page.tsx` | 히어로+소셜프루프+카드+CTA 전면 재작성 |
| `src/app/login/page.tsx` | 좌우 분할 + Unsplash 이미지 |
| `src/app/signup/page.tsx` | 좌우 분할 + Unsplash 이미지 |
| `src/app/not-found.tsx` | 애니메이션 404 + 장식 orbs |
| `src/app/mypage/page.tsx` | 프로필 카드 + 통계 그리드 + Skeleton |
| `src/app/result/[id]/page.tsx` | 순차 애니메이션 + glass 점수 카드 |
| `src/app/setup/page.tsx` | 브랜드 헤더 + 단계 인디케이터 |
| `src/components/layout/Header.tsx` | glass 인라인 스타일 + 그룹 호버 |
| `src/components/layout/Navigation.tsx` | glass + pb-safe + 그라데이션 인디케이터 |
| `src/components/layout/AppShell.tsx` | 프리미엄 로딩 스켈레톤 |
| `DESIGN.md` | 실제 적용 스타일 반영 업데이트 |

### 빌드 검증
- `npx next build` ✅ 성공 (ESLint + TypeScript 통과)
- 모든 P0 페이지 빌드 확인 완료

---

### 다음 작업 후보

| 우선순위 | 작업 | 복잡도 |
|----------|------|--------|
| 1 | 레퍼런스 포즈 데이터 확보 (실제 녹화) | 중 |
| 2 | 테스트 커버리지 확대 (목표 80%) | 중 |
| 3 | F7 재생 컨트롤 (속도/미러/구간반복) | 중 |
| 4 | F8 SplitView 비교 화면 | 상 |
| 5 | F6 캘린더 뷰 + 뱃지 시스템 | 중 |
| 6 | 오디오 연동 | 중 |
