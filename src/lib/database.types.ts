// Hand-written to match supabase/migrations/0001_init.sql.
// If you evolve the schema, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts

export type UserRole = "provider" | "seeker";

export type ProviderCategory =
  | "Resort"
  | "Trainer"
  | "Therapist / Practitioner"
  | "Studio"
  | "Retreat Center"
  | "Nutritionist";

export type VartaType = "reel" | "insight";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          email: string;
          role: UserRole;
        }>;
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string;
          business_name: string;
          category: ProviderCategory;
          location: string;
          description: string | null;
          price_range: string | null;
          payment_link: string | null;
          wrs_score: number | null;
          wrs_tier: string | null;
          wrs_breakdown: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          business_name: string;
          category: ProviderCategory;
          location: string;
          description?: string | null;
          price_range?: string | null;
          payment_link?: string | null;
          wrs_score?: number | null;
          wrs_tier?: string | null;
          wrs_breakdown?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<{
          business_name: string;
          category: ProviderCategory;
          location: string;
          description: string | null;
          price_range: string | null;
          payment_link: string | null;
          wrs_score: number | null;
          wrs_tier: string | null;
          wrs_breakdown: Record<string, unknown> | null;
        }>;
        Relationships: [];
      };
      varta_posts: {
        Row: {
          id: string;
          type: VartaType;
          category: string;
          title: string;
          blurb: string | null;
          instagram_id: string | null;
          curator: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: VartaType;
          category: string;
          title: string;
          blurb?: string | null;
          instagram_id?: string | null;
          curator?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          type: VartaType;
          category: string;
          title: string;
          blurb: string | null;
          instagram_id: string | null;
          curator: string | null;
        }>;
        Relationships: [];
      };
      era_responses: {
        Row: {
          id: string;
          seeker_id: string;
          answers: Record<string, unknown>;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seeker_id: string;
          answers: Record<string, unknown>;
          score?: number | null;
          created_at?: string;
        };
        Update: Partial<{
          answers: Record<string, unknown>;
          score: number | null;
        }>;
        Relationships: [];
      };
      retreat_leads: {
        Row: {
          id: string;
          seeker_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seeker_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
        }>;
        Relationships: [];
      };
      module_quiz_progress: {
        Row: {
          id: string;
          seeker_id: string;
          module_id: string;
          passed: boolean;
          best_score: number;
          attempts: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seeker_id: string;
          module_id: string;
          passed?: boolean;
          best_score?: number;
          attempts?: number;
          updated_at?: string;
        };
        Update: Partial<{
          passed: boolean;
          best_score: number;
          attempts: number;
          updated_at: string;
        }>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          seeker_id: string;
          name: string;
          issued_at: string;
        };
        Insert: {
          id?: string;
          seeker_id: string;
          name: string;
          issued_at?: string;
        };
        Update: Partial<{
          name: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      provider_category: ProviderCategory;
      varta_type: VartaType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type VartaPost = Database["public"]["Tables"]["varta_posts"]["Row"];
export type EraResponse = Database["public"]["Tables"]["era_responses"]["Row"];
export type RetreatLead = Database["public"]["Tables"]["retreat_leads"]["Row"];
export type ModuleQuizProgress = Database["public"]["Tables"]["module_quiz_progress"]["Row"];
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"];
