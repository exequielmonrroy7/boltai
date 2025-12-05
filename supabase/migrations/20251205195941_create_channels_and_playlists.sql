/*
  # Create 24/7 Loop Channels System

  1. New Tables
    - `channels`
      - `id` (uuid, primary key)
      - `name` (text) - Channel name
      - `slug` (text, unique) - URL-friendly identifier for .m3u8 endpoint
      - `description` (text) - Channel description
      - `is_active` (boolean) - Whether the channel is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `playlist_videos`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, foreign key) - Reference to channels table
      - `video_url` (text) - URL of the video
      - `title` (text) - Video title
      - `duration` (integer) - Video duration in seconds (optional)
      - `position` (integer) - Order position in playlist
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Public can read channels and playlist videos (for streaming)
    - Authenticated users can manage channels and videos (admin panel)
  
  3. Indexes
    - Index on channel slug for fast lookups
    - Index on channel_id and position for playlist ordering
*/

CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS playlist_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  title text NOT NULL,
  duration integer,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channels_slug ON channels(slug);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_channel_position ON playlist_videos(channel_id, position);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active channels"
  ON channels FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create channels"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update channels"
  ON channels FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete channels"
  ON channels FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view playlist videos"
  ON playlist_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = playlist_videos.channel_id
      AND channels.is_active = true
    )
  );

CREATE POLICY "Authenticated users can create playlist videos"
  ON playlist_videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update playlist videos"
  ON playlist_videos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete playlist videos"
  ON playlist_videos FOR DELETE
  TO authenticated
  USING (true);