export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          ab_variant: string | null
          clicks: number | null
          created_at: string
          cta: string | null
          daily_budget: number | null
          description: string | null
          external_campaign_id: string | null
          funnel_id: string | null
          headline: string | null
          id: string
          impressions: number | null
          leads_generated: number | null
          name: string
          platform: string
          status: string
          target_audience: Json | null
          total_spend: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ab_variant?: string | null
          clicks?: number | null
          created_at?: string
          cta?: string | null
          daily_budget?: number | null
          description?: string | null
          external_campaign_id?: string | null
          funnel_id?: string | null
          headline?: string | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          name: string
          platform?: string
          status?: string
          target_audience?: Json | null
          total_spend?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ab_variant?: string | null
          clicks?: number | null
          created_at?: string
          cta?: string | null
          daily_budget?: number | null
          description?: string | null
          external_campaign_id?: string | null
          funnel_id?: string | null
          headline?: string | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          name?: string
          platform?: string
          status?: string
          target_audience?: Json | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_idx_credentials: {
        Row: {
          api_key_encrypted: string
          connected_at: string | null
          created_at: string
          id: string
          idx_connected: boolean
          login_id: string
          mls_provider: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          connected_at?: string | null
          created_at?: string
          id?: string
          idx_connected?: boolean
          login_id: string
          mls_provider: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          connected_at?: string | null
          created_at?: string
          id?: string
          idx_connected?: boolean
          login_id?: string
          mls_provider?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_settings: {
        Row: {
          auto_send_enabled: boolean | null
          confidence_threshold: number
          created_at: string
          daily_ad_budget: number
          id: string
          max_daily_messages: number | null
          preferred_channel: string
          preferred_time_slot: string
          quiet_hours_end: number | null
          quiet_hours_start: number | null
          script_length: string
          timezone: string | null
          tone_preference: string
          updated_at: string
          user_id: string
          voice_enabled: boolean
        }
        Insert: {
          auto_send_enabled?: boolean | null
          confidence_threshold?: number
          created_at?: string
          daily_ad_budget?: number
          id?: string
          max_daily_messages?: number | null
          preferred_channel?: string
          preferred_time_slot?: string
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          script_length?: string
          timezone?: string | null
          tone_preference?: string
          updated_at?: string
          user_id: string
          voice_enabled?: boolean
        }
        Update: {
          auto_send_enabled?: boolean | null
          confidence_threshold?: number
          created_at?: string
          daily_ad_budget?: number
          id?: string
          max_daily_messages?: number | null
          preferred_channel?: string
          preferred_time_slot?: string
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          script_length?: string
          timezone?: string | null
          tone_preference?: string
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean
        }
        Relationships: []
      }
      contacts: {
        Row: {
          agent_id: string
          contact_score: number
          created_at: string
          email: string | null
          full_name: string
          id: string
          last_contacted_at: string | null
          notes: string | null
          phone: string | null
          relationship_type: Database["public"]["Enums"]["contact_relationship_type"]
          source: Database["public"]["Enums"]["contact_source"]
          updated_at: string
        }
        Insert: {
          agent_id: string
          contact_score?: number
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          phone?: string | null
          relationship_type?: Database["public"]["Enums"]["contact_relationship_type"]
          source?: Database["public"]["Enums"]["contact_source"]
          updated_at?: string
        }
        Update: {
          agent_id?: string
          contact_score?: number
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          phone?: string | null
          relationship_type?: Database["public"]["Enums"]["contact_relationship_type"]
          source?: Database["public"]["Enums"]["contact_source"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          body: string | null
          created_at: string
          duration: string | null
          id: string
          likes: number
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          body?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          likes?: number
          status?: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          body?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          likes?: number
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      funnel_hero_images: {
        Row: {
          conversions: number
          created_at: string
          download_location_url: string | null
          download_triggered: boolean
          funnel_id: string
          id: string
          image_url: string
          is_active: boolean
          photographer_name: string | null
          photographer_profile_url: string | null
          source: string
          unsplash_photo_id: string | null
          unsplash_photo_page_url: string | null
          updated_at: string
          variant: string
          views: number
        }
        Insert: {
          conversions?: number
          created_at?: string
          download_location_url?: string | null
          download_triggered?: boolean
          funnel_id: string
          id?: string
          image_url: string
          is_active?: boolean
          photographer_name?: string | null
          photographer_profile_url?: string | null
          source?: string
          unsplash_photo_id?: string | null
          unsplash_photo_page_url?: string | null
          updated_at?: string
          variant?: string
          views?: number
        }
        Update: {
          conversions?: number
          created_at?: string
          download_location_url?: string | null
          download_triggered?: boolean
          funnel_id?: string
          id?: string
          image_url?: string
          is_active?: boolean
          photographer_name?: string | null
          photographer_profile_url?: string | null
          source?: string
          unsplash_photo_id?: string | null
          unsplash_photo_page_url?: string | null
          updated_at?: string
          variant?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "funnel_hero_images_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_leads: {
        Row: {
          actual_revenue: number | null
          ai_next_step: string | null
          ai_score: number | null
          ai_score_reasons: Json | null
          assigned_to: string | null
          behavior_timeline: Json | null
          budget: string | null
          close_date: string | null
          closed_at: string | null
          created_at: string
          deal_side: string | null
          email: string | null
          equity_estimate: number | null
          estimated_revenue: number | null
          financing_status: string | null
          funnel_id: string
          id: string
          intent: string | null
          name: string | null
          ownership_timeline: string | null
          phone: string | null
          prediction_reasons: Json | null
          revenue_status: string | null
          seller_prediction_score: number | null
          status: string | null
          tags: string[] | null
          temperature: string | null
          timeline: string | null
          urgency_score: number | null
        }
        Insert: {
          actual_revenue?: number | null
          ai_next_step?: string | null
          ai_score?: number | null
          ai_score_reasons?: Json | null
          assigned_to?: string | null
          behavior_timeline?: Json | null
          budget?: string | null
          close_date?: string | null
          closed_at?: string | null
          created_at?: string
          deal_side?: string | null
          email?: string | null
          equity_estimate?: number | null
          estimated_revenue?: number | null
          financing_status?: string | null
          funnel_id: string
          id?: string
          intent?: string | null
          name?: string | null
          ownership_timeline?: string | null
          phone?: string | null
          prediction_reasons?: Json | null
          revenue_status?: string | null
          seller_prediction_score?: number | null
          status?: string | null
          tags?: string[] | null
          temperature?: string | null
          timeline?: string | null
          urgency_score?: number | null
        }
        Update: {
          actual_revenue?: number | null
          ai_next_step?: string | null
          ai_score?: number | null
          ai_score_reasons?: Json | null
          assigned_to?: string | null
          behavior_timeline?: Json | null
          budget?: string | null
          close_date?: string | null
          closed_at?: string | null
          created_at?: string
          deal_side?: string | null
          email?: string | null
          equity_estimate?: number | null
          estimated_revenue?: number | null
          financing_status?: string | null
          funnel_id?: string
          id?: string
          intent?: string | null
          name?: string | null
          ownership_timeline?: string | null
          phone?: string | null
          prediction_reasons?: Json | null
          revenue_status?: string | null
          seller_prediction_score?: number | null
          status?: string | null
          tags?: string[] | null
          temperature?: string | null
          timeline?: string | null
          urgency_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_leads_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          body_content: string | null
          color_theme: string | null
          content_metadata: Json | null
          conversion_rate: number | null
          corner_style: string | null
          created_at: string
          cta: string | null
          cta_style: string | null
          custom_colors: Json | null
          density: string | null
          focus: string | null
          headline: string | null
          hero_image_url: string | null
          id: string
          layout_style: string | null
          leads_count: number
          name: string
          nurture_sequence: Json | null
          price_max: string | null
          price_min: string | null
          problem_section: Json | null
          section_order: string[] | null
          slug: string
          social_copy: Json | null
          status: string
          subheadline: string | null
          target_area: string | null
          tone: string | null
          trust_block: string | null
          type: string
          typography: string | null
          updated_at: string
          user_id: string | null
          value_props: Json | null
          video_script: string | null
          views: number
          zip_codes: string | null
        }
        Insert: {
          body_content?: string | null
          color_theme?: string | null
          content_metadata?: Json | null
          conversion_rate?: number | null
          corner_style?: string | null
          created_at?: string
          cta?: string | null
          cta_style?: string | null
          custom_colors?: Json | null
          density?: string | null
          focus?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          layout_style?: string | null
          leads_count?: number
          name: string
          nurture_sequence?: Json | null
          price_max?: string | null
          price_min?: string | null
          problem_section?: Json | null
          section_order?: string[] | null
          slug: string
          social_copy?: Json | null
          status?: string
          subheadline?: string | null
          target_area?: string | null
          tone?: string | null
          trust_block?: string | null
          type: string
          typography?: string | null
          updated_at?: string
          user_id?: string | null
          value_props?: Json | null
          video_script?: string | null
          views?: number
          zip_codes?: string | null
        }
        Update: {
          body_content?: string | null
          color_theme?: string | null
          content_metadata?: Json | null
          conversion_rate?: number | null
          corner_style?: string | null
          created_at?: string
          cta?: string | null
          cta_style?: string | null
          custom_colors?: Json | null
          density?: string | null
          focus?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          layout_style?: string | null
          leads_count?: number
          name?: string
          nurture_sequence?: Json | null
          price_max?: string | null
          price_min?: string | null
          problem_section?: Json | null
          section_order?: string[] | null
          slug?: string
          social_copy?: Json | null
          status?: string
          subheadline?: string | null
          target_area?: string | null
          tone?: string | null
          trust_block?: string | null
          type?: string
          typography?: string | null
          updated_at?: string
          user_id?: string | null
          value_props?: Json | null
          video_script?: string | null
          views?: number
          zip_codes?: string | null
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          content_text: string
          content_type: string
          created_at: string
          id: string
          market_area: string
          platform: string
          user_id: string
        }
        Insert: {
          content_text: string
          content_type: string
          created_at?: string
          id?: string
          market_area?: string
          platform: string
          user_id: string
        }
        Update: {
          content_text?: string
          content_type?: string
          created_at?: string
          id?: string
          market_area?: string
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      hero_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          funnel_id: string
          hero_image_id: string | null
          id: string
          session_id: string
          traffic_source: string | null
          variant: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          funnel_id: string
          hero_image_id?: string | null
          id?: string
          session_id: string
          traffic_source?: string | null
          variant: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          funnel_id?: string
          hero_image_id?: string | null
          id?: string
          session_id?: string
          traffic_source?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_events_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_events_hero_image_id_fkey"
            columns: ["hero_image_id"]
            isOneToOne: false
            referencedRelation: "funnel_hero_images"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          created_at: string
          credentials: Json | null
          id: string
          last_synced_at: string | null
          provider: string
          status: string
          sync_config: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credentials?: Json | null
          id?: string
          last_synced_at?: string | null
          provider: string
          status?: string
          sync_config?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credentials?: Json | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          status?: string
          sync_config?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      launch_program_progress: {
        Row: {
          agent_type: string
          completed: boolean
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_conversations: {
        Row: {
          channel: string
          content: string
          created_at: string
          direction: string
          id: string
          lead_id: string
          metadata: Json | null
          role: string
          sentiment_score: number | null
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          direction?: string
          id?: string
          lead_id: string
          metadata?: Json | null
          role?: string
          sentiment_score?: number | null
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          role?: string
          sentiment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
          note_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
          note_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          note_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_verifications: {
        Row: {
          created_at: string
          fraud_flags: Json | null
          id: string
          is_verified: boolean
          lead_id: string
          quality_score: number | null
          verification_data: Json | null
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          fraud_flags?: Json | null
          id?: string
          is_verified?: boolean
          lead_id: string
          quality_score?: number | null
          verification_data?: Json | null
          verification_type?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          fraud_flags?: Json | null
          id?: string
          is_verified?: boolean
          lead_id?: string
          quality_score?: number | null
          verification_data?: Json | null
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_verifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string
          baths: number | null
          beds: number | null
          created_at: string
          days_on_market: number
          id: string
          image: string | null
          price: string | null
          sqft: string | null
          status: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          address: string
          baths?: number | null
          beds?: number | null
          created_at?: string
          days_on_market?: number
          id?: string
          image?: string | null
          price?: string | null
          sqft?: string | null
          status?: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          address?: string
          baths?: number | null
          beds?: number | null
          created_at?: string
          days_on_market?: number
          id?: string
          image?: string | null
          price?: string | null
          sqft?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      market_areas: {
        Row: {
          ai_highlights: Json | null
          ai_summary: string | null
          avg_sale_price: number | null
          city: string | null
          competition_score: number | null
          created_at: string
          demand_score: number | null
          id: string
          inventory_count: number | null
          last_analyzed_at: string | null
          latitude: number | null
          leads_captured: number | null
          longitude: number | null
          market_temp: string | null
          median_dom: number | null
          name: string
          opportunity_score: number | null
          price_trend: string | null
          seo_content: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          state: string | null
          status: string
          structured_data: Json | null
          updated_at: string
          user_id: string
          views: number | null
          zip_codes: string[] | null
        }
        Insert: {
          ai_highlights?: Json | null
          ai_summary?: string | null
          avg_sale_price?: number | null
          city?: string | null
          competition_score?: number | null
          created_at?: string
          demand_score?: number | null
          id?: string
          inventory_count?: number | null
          last_analyzed_at?: string | null
          latitude?: number | null
          leads_captured?: number | null
          longitude?: number | null
          market_temp?: string | null
          median_dom?: number | null
          name: string
          opportunity_score?: number | null
          price_trend?: string | null
          seo_content?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          state?: string | null
          status?: string
          structured_data?: Json | null
          updated_at?: string
          user_id: string
          views?: number | null
          zip_codes?: string[] | null
        }
        Update: {
          ai_highlights?: Json | null
          ai_summary?: string | null
          avg_sale_price?: number | null
          city?: string | null
          competition_score?: number | null
          created_at?: string
          demand_score?: number | null
          id?: string
          inventory_count?: number | null
          last_analyzed_at?: string | null
          latitude?: number | null
          leads_captured?: number | null
          longitude?: number | null
          market_temp?: string | null
          median_dom?: number | null
          name?: string
          opportunity_score?: number | null
          price_trend?: string | null
          seo_content?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          state?: string | null
          status?: string
          structured_data?: Json | null
          updated_at?: string
          user_id?: string
          views?: number | null
          zip_codes?: string[] | null
        }
        Relationships: []
      }
      nlp_commands: {
        Row: {
          command_text: string
          executed_at: string
          id: string
          parsed_intent: string | null
          parsed_params: Json | null
          result: Json | null
          user_id: string
        }
        Insert: {
          command_text: string
          executed_at?: string
          id?: string
          parsed_intent?: string | null
          parsed_params?: Json | null
          result?: Json | null
          user_id: string
        }
        Update: {
          command_text?: string
          executed_at?: string
          id?: string
          parsed_intent?: string | null
          parsed_params?: Json | null
          result?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      outreach_queue: {
        Row: {
          ai_generated: boolean
          attempts: number | null
          body: string
          channel: string
          created_at: string
          delivery_error: string | null
          delivery_id: string | null
          delivery_provider: string | null
          id: string
          last_attempt_at: string | null
          lead_id: string
          max_attempts: number | null
          metadata: Json | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string | null
          trigger_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          attempts?: number | null
          body: string
          channel?: string
          created_at?: string
          delivery_error?: string | null
          delivery_id?: string | null
          delivery_provider?: string | null
          id?: string
          last_attempt_at?: string | null
          lead_id: string
          max_attempts?: number | null
          metadata?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          trigger_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          attempts?: number | null
          body?: string
          channel?: string
          created_at?: string
          delivery_error?: string | null
          delivery_id?: string | null
          delivery_provider?: string | null
          id?: string
          last_attempt_at?: string | null
          lead_id?: string
          max_attempts?: number | null
          metadata?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          trigger_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_queue_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_sequences: {
        Row: {
          channel: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          steps: Json
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          steps?: Json
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          steps?: Json
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_type: string | null
          avatar_url: string | null
          avg_sale_price: number | null
          bio: string | null
          brand_color: string | null
          city: string | null
          commission_rate: number | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          growth_goal: string | null
          id: string
          idx_connected: boolean
          license_state: string | null
          market_area: string | null
          onboarding_complete: boolean | null
          phone: string | null
          primary_focus: string | null
          target_closings: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          agent_type?: string | null
          avatar_url?: string | null
          avg_sale_price?: number | null
          bio?: string | null
          brand_color?: string | null
          city?: string | null
          commission_rate?: number | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          growth_goal?: string | null
          id?: string
          idx_connected?: boolean
          license_state?: string | null
          market_area?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          primary_focus?: string | null
          target_closings?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          agent_type?: string | null
          avatar_url?: string | null
          avg_sale_price?: number | null
          bio?: string | null
          brand_color?: string | null
          city?: string | null
          commission_rate?: number | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          growth_goal?: string | null
          id?: string
          idx_connected?: boolean
          license_state?: string | null
          market_area?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          primary_focus?: string | null
          target_closings?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      seller_valuations: {
        Row: {
          address: string
          confidence_score: number | null
          created_at: string
          estimated_value: number | null
          funnel_id: string | null
          id: string
          lead_id: string | null
          status: string
          updated_at: string
          user_id: string
          valuation_data: Json | null
        }
        Insert: {
          address: string
          confidence_score?: number | null
          created_at?: string
          estimated_value?: number | null
          funnel_id?: string | null
          id?: string
          lead_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valuation_data?: Json | null
        }
        Update: {
          address?: string
          confidence_score?: number | null
          created_at?: string
          estimated_value?: number | null
          funnel_id?: string | null
          id?: string
          lead_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valuation_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_valuations_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_valuations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_period: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          extra_seat_price: number | null
          id: string
          max_seats: number | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_period?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          extra_seat_price?: number | null
          id?: string
          max_seats?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_period?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          extra_seat_price?: number | null
          id?: string
          max_seats?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string
          joined_at: string | null
          member_user_id: string | null
          role: string
          status: string
          team_owner_id: string
          team_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          member_user_id?: string | null
          role?: string
          status?: string
          team_owner_id: string
          team_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          member_user_id?: string | null
          role?: string
          status?: string
          team_owner_id?: string
          team_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_subscription_id_fkey"
            columns: ["team_subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_requests: {
        Row: {
          ai_confirmed: boolean
          created_at: string
          id: string
          lead_id: string
          listing_id: string | null
          notes: string | null
          requested_date: string
          requested_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confirmed?: boolean
          created_at?: string
          id?: string
          lead_id: string
          listing_id?: string | null
          notes?: string | null
          requested_date: string
          requested_time: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confirmed?: boolean
          created_at?: string
          id?: string
          lead_id?: string
          listing_id?: string | null
          notes?: string | null
          requested_date?: string
          requested_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funnel_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      unsplash_cache: {
        Row: {
          expires_at: string
          fetched_at: string
          id: string
          keyword_set: string
          photographer_ids: string[] | null
          results: Json
          scoring_version: string | null
        }
        Insert: {
          expires_at?: string
          fetched_at?: string
          id?: string
          keyword_set: string
          photographer_ids?: string[] | null
          results?: Json
          scoring_version?: string | null
        }
        Update: {
          expires_at?: string
          fetched_at?: string
          id?: string
          keyword_set?: string
          photographer_ids?: string[] | null
          results?: Json
          scoring_version?: string | null
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          last_sign_in_at: string
          role: string
        }[]
      }
      admin_update_user: {
        Args: {
          new_display_name?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      capture_lead: {
        Args: { p_funnel_id: string; p_lead_data: Json }
        Returns: Json
      }
      check_user_limits: { Args: { p_user_id: string }; Returns: Json }
      get_brokerage_overview: { Args: { p_user_id: string }; Returns: Json }
      get_feature_flags: { Args: { p_user_id: string }; Returns: Json }
      get_team_seat_info: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_funnel_views: {
        Args: { p_funnel_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      contact_relationship_type:
        | "sphere"
        | "past_client"
        | "personal"
        | "professional"
        | "met_once"
        | "funnel_lead"
        | "buyer_lead"
        | "seller_prospect"
      contact_source:
        | "google_import"
        | "csv_import"
        | "manual"
        | "funnel_capture"
        | "pipeline_entry"
      subscription_tier: "free" | "growth" | "pro" | "team" | "brokerage"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      contact_relationship_type: [
        "sphere",
        "past_client",
        "personal",
        "professional",
        "met_once",
        "funnel_lead",
        "buyer_lead",
        "seller_prospect",
      ],
      contact_source: [
        "google_import",
        "csv_import",
        "manual",
        "funnel_capture",
        "pipeline_entry",
      ],
      subscription_tier: ["free", "growth", "pro", "team", "brokerage"],
    },
  },
} as const
