export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  author_role: string | null;
  author_avatar: string | null;
  category: string;
  tags: string[];
  read_time_minutes: number;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
};
