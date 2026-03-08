'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, ArrowRight, Sparkles, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { useUserStore } from '@/stores/userStore';
import { createClient } from '@/lib/supabase/client';

type Step = 'nickname' | 'camera';

export default function SetupPage(): React.ReactElement {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const [step, setStep] = useState<Step>('nickname');
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const { videoRef, isReady, error, startCamera, stopCamera } = useCamera();

  const handleNicknameSubmit = useCallback(() => {
    if (nickname.trim().length < 2) return;
    setStep('camera');
  }, [nickname]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleNicknameSubmit();
    },
    [handleNicknameSubmit]
  );

  const handleComplete = useCallback(async () => {
    stopCamera();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', user.id);

    const fetchProfile = useUserStore.getState().fetchProfile;
    await fetchProfile(user.id);

    router.replace('/');
  }, [nickname, stopCamera, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-grid relative overflow-hidden">
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-12"
      >
        <Music2 className="h-6 w-6 text-neon-pink animate-neon-pulse" />
        <span className="text-xl font-bold neon-text-pink">DanceFlow</span>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex gap-3 mb-12">
        {(['nickname', 'camera'] as const).map((s, i) => (
          <motion.div
            key={s}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`h-1.5 w-16 rounded-full transition-all duration-500 ${
              i <= (['nickname', 'camera'] as const).indexOf(step)
                ? 'gradient-primary shadow-neon-pink'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'nickname' && (
          <motion.div
            key="nickname"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="w-full max-w-sm text-center"
          >
            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-neon-pink">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-heading-sm font-bold mb-2">프로필 설정</h1>
            <p className="text-muted-foreground mb-8">
              닉네임을 입력해주세요
            </p>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="닉네임 (2자 이상)"
              className="w-full px-5 py-4 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink/50 transition-all mb-4 text-center text-lg"
              maxLength={20}
              autoFocus
            />
            <Button
              onClick={handleNicknameSubmit}
              disabled={nickname.trim().length < 2}
              variant="gradient"
              className="w-full shadow-neon-pink"
              size="lg"
            >
              다음
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="w-full max-w-sm text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 mx-auto mb-6 flex items-center justify-center">
              <Camera className="h-8 w-8 text-neon-cyan" />
            </div>
            <h1 className="text-heading-sm font-bold mb-2">카메라 설정</h1>
            <p className="text-muted-foreground mb-8">
              댄스 연습을 위해 카메라 권한이 필요합니다
            </p>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted/50 mb-6 border border-white/5 shadow-premium">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              {!isReady && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    카메라 미리보기
                  </p>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 rounded-xl">
                  <p className="text-sm text-destructive px-4">{error}</p>
                </div>
              )}
              {isReady && (
                <div className="absolute top-3 right-3 rounded-full bg-green-500/90 p-1.5 shadow-lg">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {!isReady ? (
              <Button
                onClick={startCamera}
                variant="gradient"
                className="w-full shadow-neon-pink"
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                카메라 허용
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                variant="gradient"
                className="w-full shadow-neon-pink"
                size="lg"
              >
                시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative orbs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-neon-pink/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
