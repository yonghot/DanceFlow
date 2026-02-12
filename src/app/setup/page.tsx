'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, ArrowRight, Sparkles } from 'lucide-react';
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

    // 프로필 업데이트
    await supabase
      .from('profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', user.id);

    // 로컬 스토어 업데이트
    const fetchProfile = useUserStore.getState().fetchProfile;
    await fetchProfile(user.id);

    router.replace('/');
  }, [nickname, stopCamera, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex gap-2 mb-12">
        {(['nickname', 'camera'] as const).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 w-12 rounded-full transition-colors ${
              i <= (['nickname', 'camera'] as const).indexOf(step)
                ? 'gradient-primary'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'nickname' && (
          <motion.div
            key="nickname"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm text-center"
          >
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">프로필 설정</h1>
            <p className="text-muted-foreground mb-8">
              닉네임을 입력해주세요
            </p>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="닉네임 (2자 이상)"
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              maxLength={20}
              autoFocus
            />
            <Button
              onClick={handleNicknameSubmit}
              disabled={nickname.trim().length < 2}
              variant="gradient"
              className="w-full"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm text-center"
          >
            <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">카메라 설정</h1>
            <p className="text-muted-foreground mb-8">
              댄스 연습을 위해 카메라 권한이 필요합니다
            </p>

            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted mb-6">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              {!isReady && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    카메라 미리보기
                  </p>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10">
                  <p className="text-sm text-destructive px-4">{error}</p>
                </div>
              )}
              {isReady && (
                <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {!isReady ? (
              <Button
                onClick={startCamera}
                variant="gradient"
                className="w-full"
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                카메라 허용
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                variant="gradient"
                className="w-full"
                size="lg"
              >
                시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
