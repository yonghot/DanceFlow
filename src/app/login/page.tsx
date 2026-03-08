'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex">
      {/* Left: Visual Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1547153760-18fc86c3d385?w=1200&h=1600&fit=crop&q=80"
          alt="댄스 실루엣"
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
            <h2 className="text-display-sm font-bold mb-4 neon-text-pink">
              Feel the Rhythm
            </h2>
            <p className="text-lg text-white/70 max-w-sm mx-auto">
              AI가 당신의 춤을 실시간으로 분석하고 피드백합니다
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Login Form */}
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
            <h1 className="text-heading-sm font-bold mb-2">다시 오신 것을 환영합니다</h1>
            <p className="text-muted-foreground">
              로그인하여 댄스 연습을 이어가세요
            </p>
          </div>

          <div className="glass-neon rounded-2xl p-6 sm:p-8 shadow-premium">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="text-neon-pink font-medium hover:underline">
              가입하기
            </Link>
          </p>
        </motion.div>

        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-pink/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
