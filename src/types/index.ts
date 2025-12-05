export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistVideo {
  id: string;
  channel_id: string;
  video_url: string;
  title: string;
  duration: number | null;
  position: number;
  created_at: string;
}
