import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PlaylistVideo {
  id: string;
  channel_id: string;
  video_url: string;
  title: string;
  duration: number | null;
  position: number;
}

interface Channel {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const channelSlug = pathParts[pathParts.length - 1];

    if (!channelSlug) {
      return new Response(
        JSON.stringify({ error: "Channel slug is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: channel, error: channelError } = await supabase
      .from("channels")
      .select("*")
      .eq("slug", channelSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (channelError || !channel) {
      return new Response(
        JSON.stringify({ error: "Channel not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: videos, error: videosError } = await supabase
      .from("playlist_videos")
      .select("*")
      .eq("channel_id", channel.id)
      .order("position", { ascending: true });

    if (videosError || !videos || videos.length === 0) {
      return new Response(
        JSON.stringify({ error: "No videos in playlist" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const DEFAULT_VIDEO_DURATION = 300;
    const currentTime = Math.floor(Date.now() / 1000);
    
    let totalDuration = 0;
    const videosWithDuration: PlaylistVideo[] = videos.map((video: PlaylistVideo) => {
      const duration = video.duration || DEFAULT_VIDEO_DURATION;
      totalDuration += duration;
      return { ...video, duration };
    });

    const loopTime = currentTime % totalDuration;
    
    let accumulatedTime = 0;
    let currentVideo = videosWithDuration[0];
    let timeInCurrentVideo = 0;

    for (const video of videosWithDuration) {
      if (loopTime < accumulatedTime + (video.duration || DEFAULT_VIDEO_DURATION)) {
        currentVideo = video;
        timeInCurrentVideo = loopTime - accumulatedTime;
        break;
      }
      accumulatedTime += video.duration || DEFAULT_VIDEO_DURATION;
    }

    const videoUrl = currentVideo.video_url;
    
    if (videoUrl.endsWith(".m3u8")) {
      const videoResponse = await fetch(videoUrl);
      const m3u8Content = await videoResponse.text();
      
      return new Response(m3u8Content, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-cache",
        },
      });
    }

    const m3u8Content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${currentVideo.duration || DEFAULT_VIDEO_DURATION}
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:${currentVideo.duration || DEFAULT_VIDEO_DURATION},${currentVideo.title}
${videoUrl}
#EXT-X-ENDLIST`;

    return new Response(m3u8Content, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in stream function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});