import type { Choreography } from '@/types';

export const choreographies: Choreography[] = [
  {
    id: 'newjeans-super-shy',
    title: 'Super Shy',
    artist: 'NewJeans',
    difficulty: 'beginner',
    duration: 30,
    referencePoses: [],
    thumbnailUrl: '',
  },
  {
    id: 'ive-eleven',
    title: 'ELEVEN',
    artist: 'IVE',
    difficulty: 'beginner',
    duration: 30,
    referencePoses: [],
    thumbnailUrl: '',
  },
  {
    id: 'twice-set-me-free',
    title: 'SET ME FREE',
    artist: 'TWICE',
    difficulty: 'beginner',
    duration: 35,
    referencePoses: [],
    thumbnailUrl: '',
  },
  {
    id: 'aespa-next-level',
    title: 'Next Level',
    artist: 'aespa',
    difficulty: 'intermediate',
    duration: 45,
    referencePoses: [],
    thumbnailUrl: '',
  },
  {
    id: 'lesserafim-antifragile',
    title: 'ANTIFRAGILE',
    artist: 'LE SSERAFIM',
    difficulty: 'intermediate',
    duration: 40,
    referencePoses: [],
    thumbnailUrl: '',
  },
  {
    id: 'blackpink-pink-venom',
    title: 'Pink Venom',
    artist: 'BLACKPINK',
    difficulty: 'advanced',
    duration: 50,
    referencePoses: [],
    thumbnailUrl: '',
  },
];

export function getChoreographyById(id: string): Choreography | undefined {
  return choreographies.find((c) => c.id === id);
}
