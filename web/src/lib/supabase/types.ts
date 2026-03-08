export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "in_production"
  | "completed"
  | "cancelled";

export type InventoryMovementType = "adjustment" | "sale" | "restock" | "return";
export type ContactMessageStatus = "new" | "in_progress" | "resolved";

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          notes: string | null;
          product_option: string;
          quantity: number;
          amount_cents: number;
          design_path: string;
          status: OrderStatus;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          notes?: string | null;
          product_option: string;
          quantity: number;
          amount_cents: number;
          design_path: string;
          status?: OrderStatus;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          notes?: string | null;
          product_option?: string;
          quantity?: number;
          amount_cents?: number;
          design_path?: string;
          status?: OrderStatus;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          name: string;
          sort_order: number;
          active: boolean;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug: string;
          name: string;
          sort_order?: number;
          active?: boolean;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug?: string;
          name?: string;
          sort_order?: number;
          active?: boolean;
          image_url?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          sku: string;
          slug: string;
          title: string;
          description: string;
          category_id: string;
          price_cents: number;
          stock_on_hand: number;
          is_featured: boolean;
          is_hot: boolean;
          sale_enabled: boolean;
          sale_percent_off: number;
          sale_label: string;
          cart_cta_text: string;
          product_type: "apparel" | "accessory";
          size_profiles: string[];
          size_values: string[];
          active: boolean;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sku: string;
          slug: string;
          title: string;
          description?: string;
          category_id: string;
          price_cents: number;
          stock_on_hand?: number;
          is_featured?: boolean;
          is_hot?: boolean;
          sale_enabled?: boolean;
          sale_percent_off?: number;
          sale_label?: string;
          cart_cta_text?: string;
          product_type?: "apparel" | "accessory";
          size_profiles?: string[];
          size_values?: string[];
          active?: boolean;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sku?: string;
          slug?: string;
          title?: string;
          description?: string;
          category_id?: string;
          price_cents?: number;
          stock_on_hand?: number;
          is_featured?: boolean;
          is_hot?: boolean;
          sale_enabled?: boolean;
          sale_percent_off?: number;
          sale_label?: string;
          cart_cta_text?: string;
          product_type?: "apparel" | "accessory";
          size_profiles?: string[];
          size_values?: string[];
          active?: boolean;
          image_url?: string | null;
        };
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: number;
          created_at: string;
          product_id: string;
          movement_type: InventoryMovementType;
          quantity_delta: number;
          reason: string | null;
          reference_order_id: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          product_id: string;
          movement_type: InventoryMovementType;
          quantity_delta: number;
          reason?: string | null;
          reference_order_id?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          product_id?: string;
          movement_type?: InventoryMovementType;
          quantity_delta?: number;
          reason?: string | null;
          reference_order_id?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
      };
      upload_product_options: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          sort_order: number;
          name: string;
          description: string;
          amount_cents: number;
          active: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          sort_order?: number;
          name: string;
          description?: string;
          amount_cents: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sort_order?: number;
          name?: string;
          description?: string;
          amount_cents?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      homepage_settings: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          singleton_key: string;
          hero_badge: string;
          hero_title: string;
          hero_description: string;
          primary_cta_label: string;
          primary_cta_href: string;
          secondary_cta_label: string;
          secondary_cta_href: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          singleton_key?: string;
          hero_badge?: string;
          hero_title?: string;
          hero_description?: string;
          primary_cta_label?: string;
          primary_cta_href?: string;
          secondary_cta_label?: string;
          secondary_cta_href?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          singleton_key?: string;
          hero_badge?: string;
          hero_title?: string;
          hero_description?: string;
          primary_cta_label?: string;
          primary_cta_href?: string;
          secondary_cta_label?: string;
          secondary_cta_href?: string;
        };
        Relationships: [];
      };
      welcome_posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          body: string;
          cta_label: string | null;
          cta_href: string | null;
          sort_order: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          body: string;
          cta_label?: string | null;
          cta_href?: string | null;
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          body?: string;
          cta_label?: string | null;
          cta_href?: string | null;
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      promo_popups: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          singleton_key: string;
          enabled: boolean;
          show_cta: boolean;
          promo_label: string;
          title: string;
          message: string;
          cta_text: string;
          cta_href: string;
          product_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          singleton_key?: string;
          enabled?: boolean;
          show_cta?: boolean;
          promo_label?: string;
          title?: string;
          message?: string;
          cta_text?: string;
          cta_href?: string;
          product_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          singleton_key?: string;
          enabled?: boolean;
          show_cta?: boolean;
          promo_label?: string;
          title?: string;
          message?: string;
          cta_text?: string;
          cta_href?: string;
          product_id?: string | null;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: ContactMessageStatus;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: ContactMessageStatus;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: ContactMessageStatus;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
