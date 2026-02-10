'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Music, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { choreographies } from '@/lib/data/choreographies';
import type { Difficulty } from '@/types';

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

export default function HomePage() {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const filtered =
    filter === 'all'
      ? choreographies
      : choreographies.filter((c) => c.difficulty === filter);

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">안무 선택</h1>
        <p className="text-muted-foreground text-sm">연습할 안무를 선택하세요</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              filter === opt.value
                ? 'gradient-primary text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((choreo) => (
          <Link key={choreo.id} href={`/practice/${choreo.id}`}>
            <Card className="group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-primary/50">
              <div className="h-40 gradient-energy rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Music className="h-12 w-12 text-white/60" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
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
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
