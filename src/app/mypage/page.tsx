'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Flame, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/stores/userStore';
import { getPracticeRecords, getStreak } from '@/lib/db/practiceRepo';
import { getChoreographyById } from '@/lib/data/choreographies';
import type { PracticeRecord, Grade } from '@/types';

const GRADE_COLORS: Record<Grade, string> = {
  perfect: 'text-grade-perfect',
  great: 'text-primary',
  good: 'text-accent',
  ok: 'text-muted-foreground',
  miss: 'text-destructive',
};

const GRADE_LABELS: Record<Grade, string> = {
  perfect: '퍼펙트',
  great: '훌륭해요',
  good: '좋아요',
  ok: '괜찮아요',
  miss: '다시 도전',
};

export default function MyPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData(): Promise<void> {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const [recs, str] = await Promise.all([
        getPracticeRecords(user.id),
        getStreak(user.id),
      ]);

      setRecords(recs);
      setStreak(str);
      setIsLoading(false);
    }

    loadData();
  }, [user]);

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
      iconColor: 'text-primary',
      bgColor: 'bg-primary/20',
      value: totalPractices,
      label: '총 연습',
    },
    {
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      value: `${streak}일`,
      label: '연속 연습',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-accent',
      bgColor: 'bg-accent/20',
      value: avgScore,
      label: '평균 점수',
    },
    {
      icon: Star,
      iconColor: 'text-grade-perfect',
      bgColor: 'bg-grade-perfect/20',
      value: bestScore,
      label: '최고 점수',
    },
  ];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{user?.nickname ?? '게스트'}</h1>
        <p className="text-sm text-muted-foreground">마이페이지</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <h2 className="font-semibold mb-3">최근 연습</h2>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              아직 연습 기록이 없습니다
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="gradient"
              size="sm"
            >
              연습 시작하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {records.slice(0, 20).map((record, index) => {
            const choreo = getChoreographyById(record.choreographyId);

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">
                        {choreo?.title ?? '알 수 없는 안무'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.practicedAt.toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${GRADE_COLORS[record.grade]}`}
                      >
                        {record.totalScore}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {GRADE_LABELS[record.grade]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
