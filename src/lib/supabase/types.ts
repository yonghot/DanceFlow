// Supabase Database 타입 정의
// 실제 프로덕션에서는 `supabase gen types typescript`로 자동 생성 권장

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          settings: ProfileSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          settings?: ProfileSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nickname?: string;
          avatar_url?: string | null;
          settings?: ProfileSettings;
          updated_at?: string;
        };
        Relationships: [];
      };
      choreographies: {
        Row: {
          id: string;
          title: string;
          artist: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration: number;
          thumbnail_url: string | null;
          audio_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration: number;
          thumbnail_url?: string | null;
          audio_url?: string | null;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          artist?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          duration?: number;
          thumbnail_url?: string | null;
          audio_url?: string | null;
        };
        Relationships: [];
      };
      reference_poses: {
        Row: {
          id: string;
          choreography_id: string;
          recorder_id: string;
          pose_data_url: string;
          frame_count: number;
          duration_ms: number;
          status: 'processing' | 'active' | 'archived';
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          choreography_id: string;
          recorder_id: string;
          pose_data_url: string;
          frame_count: number;
          duration_ms: number;
          status?: 'processing' | 'active' | 'archived';
          is_primary?: boolean;
        };
        Update: {
          pose_data_url?: string;
          frame_count?: number;
          duration_ms?: number;
          status?: 'processing' | 'active' | 'archived';
          is_primary?: boolean;
        };
        Relationships: [];
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          choreography_id: string;
          reference_id: string | null;
          total_score: number;
          grade: string;
          accuracy_score: number | null;
          timing_score: number | null;
          body_part_scores: BodyPartScoreJson[];
          pose_data_url: string | null;
          frame_count: number;
          duration_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          choreography_id: string;
          reference_id?: string | null;
          total_score: number;
          grade: string;
          accuracy_score?: number | null;
          timing_score?: number | null;
          body_part_scores?: BodyPartScoreJson[];
          pose_data_url?: string | null;
          frame_count?: number;
          duration_ms?: number;
        };
        Update: {
          total_score?: number;
          grade?: string;
          accuracy_score?: number | null;
          timing_score?: number | null;
          body_part_scores?: BodyPartScoreJson[];
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface ProfileSettings {
  mirrorMode: boolean;
  playbackSpeed: number;
}

export interface BodyPartScoreJson {
  part: string;
  score: number;
  feedback: string;
}
