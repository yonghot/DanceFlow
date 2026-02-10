import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ScoreDisplay } from '@/components/score/ScoreDisplay';
import { GradeIndicator } from '@/components/score/GradeIndicator';
import { BodyPartScoreDisplay } from '@/components/score/BodyPartScore';

describe('ScoreDisplay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('점수 표시', () => {
    render(<ScoreDisplay score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('aria-label 포함', () => {
    render(<ScoreDisplay score={90} />);
    expect(screen.getByLabelText('90')).toBeInTheDocument();
  });

  it('animate=false일 때 즉시 점수 표시', () => {
    render(<ScoreDisplay score={75} animate={false} />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('animate=true일 때 0부터 시작', () => {
    vi.useFakeTimers();
    render(<ScoreDisplay score={80} animate />);
    expect(screen.getByText('0')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('animate=true일 때 최종 점수에 도달', () => {
    vi.useFakeTimers();
    render(<ScoreDisplay score={80} animate />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('80')).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('GradeIndicator', () => {
  it('등급 라벨 표시', () => {
    render(<GradeIndicator grade="perfect" />);
    expect(screen.getByText('퍼펙트')).toBeInTheDocument();
  });

  it('role=status', () => {
    render(<GradeIndicator grade="great" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('모든 등급 렌더링', () => {
    const grades = ['perfect', 'great', 'good', 'ok', 'miss'] as const;
    const labels = ['퍼펙트', '훌륭해요', '좋아요', '괜찮아요', '다시 도전'];

    for (let i = 0; i < grades.length; i++) {
      const { unmount } = render(<GradeIndicator grade={grades[i]} />);
      expect(screen.getByText(labels[i])).toBeInTheDocument();
      unmount();
    }
  });

  it('size 적용', () => {
    const { container } = render(<GradeIndicator grade="good" size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('text-4xl');
  });
});

describe('BodyPartScoreDisplay', () => {
  const mockScores = [
    { part: 'leftArm' as const, score: 90, feedback: '왼팔 동작이 훌륭해요!' },
    { part: 'rightArm' as const, score: 85, feedback: '오른팔 동작이 훌륭해요!' },
    { part: 'torso' as const, score: 70, feedback: '상체 동작이 좋아요.' },
    { part: 'leftLeg' as const, score: 60, feedback: '왼다리 동작을 좀 더 크게.' },
    { part: 'rightLeg' as const, score: 95, feedback: '오른다리 동작이 완벽해요!' },
  ];

  it('모든 부위 라벨 표시', () => {
    render(<BodyPartScoreDisplay scores={mockScores} />);
    expect(screen.getByText('좌팔')).toBeInTheDocument();
    expect(screen.getByText('우팔')).toBeInTheDocument();
    expect(screen.getByText('상체')).toBeInTheDocument();
    expect(screen.getByText('좌다리')).toBeInTheDocument();
    expect(screen.getByText('우다리')).toBeInTheDocument();
  });

  it('점수 표시', () => {
    render(<BodyPartScoreDisplay scores={mockScores} />);
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('피드백 텍스트 표시', () => {
    render(<BodyPartScoreDisplay scores={mockScores} />);
    expect(screen.getByText('왼팔 동작이 훌륭해요!')).toBeInTheDocument();
  });

  it('리스트 역할 존재', () => {
    render(<BodyPartScoreDisplay scores={mockScores} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
});
