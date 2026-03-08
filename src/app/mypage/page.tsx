'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Flame, TrendingUp, Star, Music, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/stores/userStore';
import { getPracticeSessions, getStreak } from '@/lib/supabase/repos/practiceRepo';
import { getChoreographyById } from '@/lib/supabase/repos/choreographyRepo';
import type { PracticeRecord, Grade, Choreography } from '@/types';

const GRADE_COLORS: Record<Grade, string> = {
  perfect: 'neon-text-gold',
  great: 'text-neon-pink',
  good: 'text-neon-cyan',
  ok: 'text-muted-foreground',
  miss: 'text-neon-red',
};

const GRADE_LABELS: Record<Grade, string> = {
  perfect: '퍼펙트',
  great: '훌륭해요',
  good: '좋아요',
  ok: '괜찮아요',
  miss: '다시 도전',
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function MyPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [choreoMap, setChoreoMap] = useState<Map<string, Choreography>>(new Map());
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData(): Promise<void> {
      if (!profile) {
        setIsLoading(false);
        return;
      }

      const [recs, str] = await Promise.all([
        getPracticeSessions(profile.id),
        getStreak(profile.id),
      ]);

      const uniqueIds = [...new Set(recs.map((r) => r.choreographyId))];
      const choreos = await Promise.all(
        uniqueIds.map((id) => getChoreographyById(id))
      );
      const map = new Map<string, Choreography>();
      for (const c of choreos) {
        if (c) map.set(c.id, c);
      }

      setRecords(recs);
      setChoreoMap(map);
      setStreak(str);
      setIsLoading(false);
    }

    loadData();
  }, [profile]);

  const totalPractices = records.length;
  const avgScore =
    totalPractices > 0
      ? Math.round(
          records.reduce((s, r) => s + r.totalScore, 0) / totalPractices
        )
      : 0;
  const bestScore =
    totalPractices > 0 ? Math.max(...records.map((r) => r.totalScore)) : 0;

  const stats = [
    {
      icon: Trophy,
      iconColor: 'text-neon-pink',
      bgColor: 'bg-neon-pink/10',
      value: totalPractices,
      label: '총 연습',
    },
    {
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      value: `${streak}일`,
      label: '연속 연습',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-neon-cyan',
      bgColor: 'bg-neon-cyan/10',
      value: avgScore,
      label: '평균 점수',
    },
    {
      icon: Star,
      iconColor: 'text-neon-gold',
      bgColor: 'bg-neon-gold/10',
      value: bestScore,
      label: '최고 점수',
    },
  ];

  return (
    <div className="section-container py-8 sm:py-12">
      {/* Profile Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="mb-10"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-neon-pink">
            <span className="text-xl font-bold text-white">
              {(profile?.nickname ?? '?')[0]}
            </span>
          </div>
          <div>
            <h1 className="text-heading-sm font-bold">{profile?.nickname ?? '게스트'}</h1>
            <p className="text-sm text-muted-foreground">마이페이지</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
            }}
          >
            <Card className="glass border-white/5 hover:border-neon-pink/20 transition-all duration-300 hover:shadow-card-hover rounded-xl">
              <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-14" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Practices */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-sm font-bold">최근 연습</h2>
          {records.length > 0 && (
            <span className="text-sm text-muted-foreground">{records.length}건</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass border-white/5 rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : records.length === 0 ? (
          <Card className="glass border-white/5 rounded-xl">
            <CardContent className="py-16 text-center">
              <Music className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">아직 연습 기록이 없습니다</p>
              <p className="text-sm text-muted-foreground mb-6">
                첫 번째 댄스를 시작하고 실력을 기록해보세요!
              </p>
              <Button
                onClick={() => router.push('/')}
                variant="gradient"
                size="lg"
                className="shadow-neon-pink"
              >
                <Music className="h-4 w-4 mr-2" />
                연습 시작하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {records.slice(0, 20).map((record, index) => {
              const choreo = choreoMap.get(record.choreographyId);

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' as const }}
                >
                  <Card className="glass border-white/5 hover:border-neon-pink/20 transition-all duration-300 rounded-xl group cursor-pointer">
                    <CardContent className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg gradient-energy opacity-60 flex items-center justify-center flex-shrink-0">
                          <Music className="h-4 w-4 text-white/80" />
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-neon-pink transition-colors">
                            {choreo?.title ?? '알 수 없는 안무'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.createdAt).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${GRADE_COLORS[record.grade]}`}>
                            {record.totalScore}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {GRADE_LABELS[record.grade]}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-neon-pink transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
