'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Sparkles className="h-12 w-12 text-neon-pink mx-auto mb-4 animate-neon-pulse" />
          <h1 className="text-3xl font-bold neon-text-pink mb-2">가입하기</h1>
          <p className="text-muted-foreground">
            DanceFlow에 가입하고 댄스를 시작하세요
          </p>
        </div>

        <div className="glass-neon rounded-xl p-6">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-neon-pink hover:underline">
            로그인
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
