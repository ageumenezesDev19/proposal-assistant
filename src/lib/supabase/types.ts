/**
 * Hand-written to match supabase/schema.sql. If the schema changes, regenerate
 * with `supabase gen types typescript` instead of editing by hand.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          headline: string;
          bio: string;
          stack: string[];
          avoid_scope: string;
          is_admin: boolean;
          updated_at: string;
        };
        Insert: {
          id: string;
          headline?: string;
          bio?: string;
          stack?: string[];
          avoid_scope?: string;
        };
        Update: {
          headline?: string;
          bio?: string;
          stack?: string[];
          avoid_scope?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cases: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          context: string;
          problem: string;
          result: string;
          stack: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          context?: string;
          problem?: string;
          result?: string;
          stack?: string[];
        };
        Update: {
          title?: string;
          context?: string;
          problem?: string;
          result?: string;
          stack?: string[];
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          id: string;
          user_id: string;
          job_title: string;
          job_post: string;
          budget: string;
          status: "draft" | "sent" | "replied" | "won" | "lost";
          analysis: unknown;
          draft: unknown;
          sent_on: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_title: string;
          job_post?: string;
          budget?: string;
          status?: "draft" | "sent" | "replied" | "won" | "lost";
          analysis?: unknown;
          draft?: unknown;
          sent_on?: string | null;
        };
        Update: {
          job_title?: string;
          job_post?: string;
          budget?: string;
          status?: "draft" | "sent" | "replied" | "won" | "lost";
          analysis?: unknown;
          draft?: unknown;
          sent_on?: string | null;
        };
        Relationships: [];
      };
      snippets: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          body: string;
        };
        Update: {
          label?: string;
          body?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
