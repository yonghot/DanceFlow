'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Music2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-grid relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-8"
        >
          <Music2 className="h-16 w-16 text-neon-pink/40 mx-auto mb-6 animate-float" />
          <h1 className="text-8xl sm:text-9xl font-extrabold text-gradient-primary mb-2">
            404
          </h1>
        </motion.div>

        <h2 className="text-heading-sm font-bold mb-3">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          홈으로 돌아가서 댄스를 계속하세요!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="gradient" size="lg" className="shadow-neon-pink" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              홈으로 가기
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/" onClick={() => history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              이전 페이지
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
