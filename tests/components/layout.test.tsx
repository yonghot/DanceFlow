import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';

// Next.js 모듈 모킹
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header', () => {
  it('DanceFlow 로고 렌더링', () => {
    render(<Header />);
    expect(screen.getByText('DanceFlow')).toBeInTheDocument();
  });

  it('홈 링크 존재', () => {
    render(<Header />);
    const homeLink = screen.getByLabelText('DanceFlow 홈으로 이동');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('마이페이지 링크 존재', () => {
    render(<Header />);
    const mypageLink = screen.getByLabelText('마이페이지');
    expect(mypageLink).toHaveAttribute('href', '/mypage');
  });
});

describe('Navigation', () => {
  it('네비게이션 렌더링', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('3개 메뉴 아이템 표시', () => {
    render(<Navigation />);
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('연습')).toBeInTheDocument();
    expect(screen.getByText('마이')).toBeInTheDocument();
  });

  it('연습 메뉴는 비활성화', () => {
    render(<Navigation />);
    const disabledItem = screen.getByText('연습').closest('[aria-disabled]');
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  });

  it('현재 경로에 aria-current=page 적용', () => {
    render(<Navigation />);
    const homeLink = screen.getByText('홈').closest('a');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });
});
