/*
  # Update RLS Policies for Admin Access

  Modify policies to allow public access to manage channels and videos
  for the admin panel. Data is public read anyway, so we open up writes
  as well for administrative purposes.
*/

DROP POLICY IF EXISTS "Authenticated users can create channels" ON channels;
DROP POLICY IF EXISTS "Authenticated users can update channels" ON channels;
DROP POLICY IF EXISTS "Authenticated users can delete channels" ON channels;
DROP POLICY IF EXISTS "Authenticated users can create playlist videos" ON playlist_videos;
DROP POLICY IF EXISTS "Authenticated users can update playlist videos" ON playlist_videos;
DROP POLICY IF EXISTS "Authenticated users can delete playlist videos" ON playlist_videos;

CREATE POLICY "Anyone can create channels"
  ON channels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update channels"
  ON channels FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete channels"
  ON channels FOR DELETE
  USING (true);

CREATE POLICY "Anyone can create playlist videos"
  ON playlist_videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update playlist videos"
  ON playlist_videos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete playlist videos"
  ON playlist_videos FOR DELETE
  USING (true);