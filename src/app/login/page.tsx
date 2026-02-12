'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Sparkles className="h-12 w-12 text-neon-pink mx-auto mb-4 animate-neon-pulse" />
          <h1 className="text-3xl font-bold neon-text-pink mb-2">
            DanceFlow
          </h1>
          <p className="text-muted-foreground">
            로그인하여 댄스 연습을 시작하세요
          </p>
        </div>

        <div className="glass-neon rounded-xl p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="text-neon-pink hover:underline">
            가입하기
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
