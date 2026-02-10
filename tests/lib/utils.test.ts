import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('단일 클래스', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('여러 클래스 병합', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('조건부 클래스', () => {
    expect(cn('base', false && 'hidden')).toBe('base');
    expect(cn('base', true && 'visible')).toBe('base visible');
  });

  it('Tailwind 충돌 해결 (tailwind-merge)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('빈 입력 처리', () => {
    expect(cn('')).toBe('');
    expect(cn()).toBe('');
  });

  it('undefined, null 무시', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra');
  });
});
