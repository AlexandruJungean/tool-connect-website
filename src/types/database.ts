/**
 * Database types matching Supabase schema
 */

export interface User {
  id: string;
  phone_number: string;
  email?: string;
  created_at: string;
  updated_at: string;
  is_banned: boolean;
  banned_at?: string;
  banned_reason?: string;
  is_admin: boolean;
  last_login_at?: string;
  app_language: 'en' | 'cs';
  preferred_language?: 'en' | 'cs';
  preferred_profile_type?: 'client' | 'service_provider';
}

export interface ClientProfile {
  id: string;
  user_id: string;
  name: string;
  surname?: string | null;
  avatar_url?: string | null;
  languages: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
  phone_number?: string;
  phone_visible?: boolean;
  location?: string;
  city?: string;
  country?: string;
  location_coordinates?: { lat: number; lng: number };
  preferred_category?: string;
  preferred_subcategories?: string[];
  max_distance_km?: number;
  preferred_provider_type?: 'company' | 'self-employed' | 'any';
  preferred_languages?: string[];
  has_active_request?: boolean;
  request_description?: string;
}

export interface ServiceProviderProfile {
  id: string;
  user_id: string;
  name: string;
  surname?: string | null;
  // specialty removed - using category instead
  avatar_url?: string | null;
  background_image_url?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  location_coordinates?: { lat: number; lng: number } | null;
  services: string[];
  subcategories?: string[];
  category?: string | null;
  languages: string[];
  phone?: string | null;
  phone_number?: string | null;
  type: 'company' | 'self-employed';
  account_type?: 'company' | 'self-employed';
  company_name?: string | null;
  ico?: string | null;
  about_me?: string | null;
  bio?: string | null;
  price_info?: string | null;
  price_from?: number | null;
  price_currency?: string | null;
  currency?: string | null;
  price_period?: 'hour' | 'day' | 'week' | 'project' | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  website_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  profile_video_url?: string | null;
  additional_images?: string[] | null;
  is_visible: boolean;
  is_active: boolean;
  phone_visible?: boolean;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
  profile_views_count: number;
  average_rating?: number | null;
  total_reviews?: number | null;
}

export interface PortfolioProject {
  id: string;
  service_provider_id: string;
  title: string;
  description?: string;
  image_url?: string;
  background_image_url?: string;
  additional_images_urls: string[];
  client_website_url?: string;
  video_link?: string;
  reference_link?: string;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  service_provider_id: string;
  client_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    surname?: string;
    avatar_url?: string;
  };
}

export interface Favorite {
  id: string;
  client_id: string;
  service_provider_id: string;
  created_at: string;
}

export interface WorkRequest {
  id: string;
  client_id: string;
  description: string;
  category: string;
  subcategory: string;
  budget?: string;
  location?: string;
  city?: string;
  country?: string;
  location_coordinates?: { lat: number; lng: number };
  status: 'active' | 'paused' | 'closed' | 'completed';
  attachments?: string[];
  created_at: string;
  updated_at: string;
  expires_at?: string;
  client?: ClientProfile;
}

export interface Application {
  id: string;
  work_request_id: string;
  service_provider_id: string;
  message: string;
  proposed_price?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  service_provider?: ServiceProviderProfile;
}

export interface Conversation {
  id: string;
  client_id: string;
  service_provider_id: string;
  last_message_at: string;
  created_at: string;
  client?: ClientProfile;
  service_provider?: ServiceProviderProfile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text?: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'file';
  attachment_name?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  deleted_by_sender: boolean;
  deleted_by_recipient: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  body?: string;
  data?: Record<string, any>;
  related_entity_id?: string;
  is_read: boolean;
  is_urgent?: boolean;
  created_at: string;
  read_at?: string;
}

export interface Database {
  public: {
    Tables: {
      users: { Row: User };
      client_profiles: { Row: ClientProfile };
      service_provider_profiles: { Row: ServiceProviderProfile };
      portfolio_projects: { Row: PortfolioProject };
      reviews: { Row: Review };
      favorites: { Row: Favorite };
      work_requests: { Row: WorkRequest };
      applications: { Row: Application };
      conversations: { Row: Conversation };
      messages: { Row: Message };
      notifications: { Row: Notification };
    };
  };
}

