import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">
        페이지를 찾을 수 없습니다
      </p>
      <Link
        href="/"
        className="text-primary hover:underline"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
