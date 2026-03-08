'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex">
      {/* Left: Visual Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=1200&h=1600&fit=crop&q=80"
          alt="댄스 그룹"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/80" />
        <div className="relative z-10 p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <h2 className="text-display-sm font-bold mb-4 neon-text-cyan">
              Start Your Journey
            </h2>
            <p className="text-lg text-white/70 max-w-sm mx-auto">
              웹캠 하나로 시작하는 AI 댄스 코칭
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 bg-grid relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="inline-flex items-center gap-2.5 mb-6"
            >
              <Music2 className="h-8 w-8 text-neon-pink animate-neon-pulse" />
              <span className="text-3xl font-bold neon-text-pink">DanceFlow</span>
            </motion.div>
            <h1 className="text-heading-sm font-bold mb-2">가입하기</h1>
            <p className="text-muted-foreground">
              DanceFlow에서 댄스 여정을 시작하세요
            </p>
          </div>

          <div className="glass-neon rounded-2xl p-6 sm:p-8 shadow-premium">
            <SignupForm />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-neon-pink font-medium hover:underline">
              로그인
            </Link>
          </p>
        </motion.div>

        <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
