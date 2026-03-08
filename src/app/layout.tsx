import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DanceFlow - AI 댄스 코치',
  description: '웹캠 기반 AI 모션인식 댄스 평가',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
