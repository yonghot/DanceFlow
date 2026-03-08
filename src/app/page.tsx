'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Music, ChevronRight, Video, Zap, Users, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getChoreographies } from '@/lib/supabase/repos/choreographyRepo';
import type { Choreography, Difficulty } from '@/types';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

const DIFFICULTY_BADGE_VARIANT: Record<Difficulty, 'beginner' | 'intermediate' | 'advanced'> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

const FILTER_OPTIONS: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
];

const CARD_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1547153760-18fc86c3d385?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535525153412-30a0d2be5439?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=400&fit=crop&q=80',
];

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min > 0) return `${min}분 ${sec > 0 ? `${sec}초` : ''}`;
  return `${sec}초`;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const SOCIAL_STATS = [
  { icon: Users, value: '1,200+', label: '댄서', color: 'text-neon-cyan' },
  { icon: Zap, value: '15,000+', label: '연습 세션', color: 'text-neon-pink' },
  { icon: Trophy, value: '98%', label: '만족도', color: 'text-neon-gold' },
];

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="relative overflow-hidden hero-gradient"
      >
        <div className="section-container py-16 sm:py-20 lg:py-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <Badge variant="outline" className="mb-6 border-neon-pink/30 bg-neon-pink/10 text-neon-pink px-4 py-1.5 text-sm">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              AI 기반 실시간 모션 분석
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-4xl sm:text-5xl lg:text-display font-extrabold tracking-tight mb-6"
          >
            <span className="neon-text-pink">Dance</span>{' '}
            <span className="text-foreground">Like a</span>{' '}
            <span className="text-gradient-primary">Star</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI가 당신의 춤을 실시간으로 분석합니다.
            <br className="hidden sm:block" />
            웹캠 하나로 프로 댄서처럼 연습하세요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button variant="gradient" size="lg" className="text-base px-8 py-6 shadow-neon-pink" asChild>
              <Link href="#choreographies">
                <Music className="h-5 w-5 mr-2" />
                연습 시작하기
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-neon-pink/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-neon-purple/5 rounded-full blur-3xl" />
      </motion.section>

      {/* Social Proof */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariants}
        className="border-y border-white/5"
      >
        <div className="section-container py-10">
          <div className="grid grid-cols-3 gap-6">
            {SOCIAL_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' as const }}
                className="text-center"
              >
                <stat.icon className={cn('h-5 w-5 mx-auto mb-2', stat.color)} />
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Choreographies Section */}
      <section id="choreographies" className="section-container py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={sectionVariants}
          className="text-center mb-12"
        >
          <h2 className="text-heading-xl sm:text-display-sm font-bold mb-3">
            안무 라이브러리
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            K-pop 인기 안무를 선택하고 AI 코치와 함께 연습하세요
          </p>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          className="flex gap-2 mb-10 overflow-x-auto justify-center"
        >
          {FILTER_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-5 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation',
                filter === opt.value
                  ? 'gradient-primary text-white shadow-neon-pink'
                  : 'glass text-muted-foreground hover:text-foreground hover:border-neon-pink/30'
              )}
            >
              {opt.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass border-white/5 overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            key={filter}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((choreo, index) => (
              <motion.div key={choreo.id} variants={cardVariants}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card className="group glass border-white/5 hover:border-neon-pink/30 transition-all duration-300 hover:shadow-card-hover overflow-hidden rounded-xl">
                    <Link href={`/practice/${choreo.id}`}>
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={CARD_IMAGES[index % CARD_IMAGES.length]}
                          alt={`${choreo.title} - ${choreo.artist}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                          <div>
                            <p className="text-xs text-white/70">{choreo.artist}</p>
                            <h3 className="font-bold text-white text-lg leading-tight">
                              {choreo.title}
                            </h3>
                          </div>
                          <div className="rounded-full bg-white/10 backdrop-blur-sm p-2 group-hover:bg-neon-pink/80 transition-colors">
                            <ChevronRight className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={DIFFICULTY_BADGE_VARIANT[choreo.difficulty]}>
                            {DIFFICULTY_LABELS[choreo.difficulty]}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDuration(choreo.duration)}
                          </span>
                          {choreo.hasReference && (
                            <Badge variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 text-xs">
                              <Star className="h-2.5 w-2.5 mr-0.5" />
                              레퍼런스
                            </Badge>
                          )}
                        </div>
                        <Link
                          href={`/reference/${choreo.id}/record`}
                          className="flex items-center gap-1 text-xs text-neon-gold hover:text-neon-gold/80 transition-colors"
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

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Music className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">
              해당 난이도의 안무가 없습니다
            </p>
            <p className="text-sm text-muted-foreground/60">
              다른 난이도를 선택해보세요
            </p>
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariants}
        className="section-container py-16 sm:py-20"
      >
        <div className="relative glass-neon rounded-2xl p-10 sm:p-16 text-center overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-heading-xl sm:text-display-sm font-bold mb-4 neon-text-pink">
              지금 바로 시작하세요
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto mb-8">
              무료로 AI 댄스 코칭을 체험하고, 나만의 실력을 키워보세요
            </p>
            <Button variant="gradient" size="lg" className="px-8 py-6 text-base shadow-neon-pink" asChild>
              <Link href="#choreographies">
                <Zap className="h-5 w-5 mr-2" />
                안무 선택하기
              </Link>
            </Button>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-pink/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neon-cyan/10 rounded-full blur-3xl" />
        </div>
      </motion.section>
    </div>
  );
}
