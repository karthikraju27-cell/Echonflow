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

export type LeadStatus = "new" | "contacted" | "booked";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          slug: string;
          name: string;
          min_report_threshold: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          min_report_threshold?: number;
          created_at?: string;
        };
        Update: Partial<{
          slug: string;
          name: string;
          min_report_threshold: number;
        }>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          phone: string | null;
          service: string | null;
          public_profile: boolean;
          company_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          phone?: string | null;
          service?: string | null;
          public_profile?: boolean;
          company_id?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          email: string;
          role: UserRole;
          phone: string | null;
          service: string | null;
          public_profile: boolean;
          company_id: string | null;
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
          era_section_tags: string[] | null;
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
          era_section_tags?: string[] | null;
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
          era_section_tags: string[] | null;
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
          section_scores: Record<string, unknown> | null;
          nudge_sent_at: string | null;
          company_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seeker_id: string;
          answers: Record<string, unknown>;
          score?: number | null;
          section_scores?: Record<string, unknown> | null;
          nudge_sent_at?: string | null;
          company_id?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          answers: Record<string, unknown>;
          score: number | null;
          section_scores: Record<string, unknown> | null;
          nudge_sent_at: string | null;
          company_id: string | null;
        }>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          seeker_id: string | null;
          listing_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
          status: LeadStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          seeker_id?: string | null;
          listing_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          message?: string | null;
          status?: LeadStatus;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
          status: LeadStatus;
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

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type VartaPost = Database["public"]["Tables"]["varta_posts"]["Row"];
export type EraResponse = Database["public"]["Tables"]["era_responses"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type ModuleQuizProgress = Database["public"]["Tables"]["module_quiz_progress"]["Row"];
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"];
