import Dexie, { type Table } from 'dexie';
import type { DBUser, DBPracticeRecord, DBChoreography } from '@/lib/db/types';

export class DanceFlowDB extends Dexie {
  users!: Table<DBUser, string>;
  practiceRecords!: Table<DBPracticeRecord, string>;
  choreographies!: Table<DBChoreography, string>;

  constructor() {
    super('DanceFlowDB');

    this.version(1).stores({
      users: 'id, nickname',
      practiceRecords: 'id, userId, choreographyId, practicedAt, [userId+choreographyId]',
      choreographies: 'id, artist, difficulty',
    });
  }
}

export const db = new DanceFlowDB();
