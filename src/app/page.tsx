'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Music, ChevronRight, Loader2, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getChoreographies } from '@/lib/supabase/repos/choreographyRepo';
import type { Choreography, Difficulty } from '@/types';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

const DIFFICULTY_BADGE_STYLES: Record<Difficulty, string> = {
  beginner: 'bg-accent/20 text-accent border-accent/30',
  intermediate: 'bg-primary/20 text-primary border-primary/30',
  advanced: 'bg-destructive/20 text-destructive border-destructive/30',
};

const FILTER_OPTIONS: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
];

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min > 0) return `${min}분 ${sec > 0 ? `${sec}초` : ''}`;
  return `${sec}초`;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export default function HomePage() {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');
  const [choreographies, setChoreographies] = useState<Choreography[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      const data = await getChoreographies();
      setChoreographies(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered =
    filter === 'all'
      ? choreographies
      : choreographies.filter((c) => c.difficulty === filter);

  return (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1">안무 선택</h1>
        <p className="text-muted-foreground text-sm">연습할 안무를 선택하세요</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {FILTER_OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors whitespace-nowrap touch-manipulation',
              filter === opt.value
                ? 'gradient-primary text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div
          key={filter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((choreo) => (
            <motion.div key={choreo.id} variants={cardVariants}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card className="group transition-colors duration-200 hover:border-primary/50">
                  <Link href={`/practice/${choreo.id}`}>
                    <div className="h-40 gradient-energy rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Music className="h-12 w-12 text-white/60" />
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/practice/${choreo.id}`} className="block mb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {choreo.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {choreo.artist}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      </div>
                    </Link>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={DIFFICULTY_BADGE_STYLES[choreo.difficulty]}
                        >
                          {DIFFICULTY_LABELS[choreo.difficulty]}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDuration(choreo.duration)}
                        </span>
                        {choreo.hasReference && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            레퍼런스
                          </Badge>
                        )}
                      </div>
                      <Link
                        href={`/reference/${choreo.id}/record`}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Video className="h-3.5 w-3.5" />
                        녹화
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
