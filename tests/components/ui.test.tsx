import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

describe('Button', () => {
  it('렌더링', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('variant 적용', () => {
    render(<Button variant="gradient">그라디언트</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('gradient-primary');
  });

  it('size 적용', () => {
    render(<Button size="lg">큰 버튼</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-11');
  });

  it('disabled 상태', () => {
    render(<Button disabled>비활성</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Badge', () => {
  it('렌더링', () => {
    render(<Badge>초급</Badge>);
    expect(screen.getByText('초급')).toBeInTheDocument();
  });

  it('variant 적용', () => {
    render(<Badge variant="perfect">퍼펙트</Badge>);
    const badge = screen.getByText('퍼펙트');
    expect(badge.className).toContain('neon-gold');
  });
});

describe('Card', () => {
  it('기본 렌더링', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>제목</CardTitle>
          <CardDescription>설명</CardDescription>
        </CardHeader>
        <CardContent>내용</CardContent>
        <CardFooter>푸터</CardFooter>
      </Card>
    );
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명')).toBeInTheDocument();
    expect(screen.getByText('내용')).toBeInTheDocument();
    expect(screen.getByText('푸터')).toBeInTheDocument();
  });
});

describe('Progress', () => {
  it('progressbar role 렌더링', () => {
    render(<Progress value={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
  });

  it('값이 0-100으로 클램프됨', () => {
    render(<Progress value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
  });

  it('음수도 0으로 클램프', () => {
    render(<Progress value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0'
    );
  });

  it('gradientVariant 적용', () => {
    const { container } = render(<Progress value={50} gradientVariant />);
    const fill = container.querySelector('[class*="gradient-primary"]');
    expect(fill).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('렌더링', () => {
    const { container } = render(<Skeleton className="h-10 w-20" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('animate-pulse');
  });
});
