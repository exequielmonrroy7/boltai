import { Channel } from '../types';
import { Play, ExternalLink } from 'lucide-react';

interface StreamPlayerProps {
  channel: Channel;
}

export function StreamPlayer({ channel }: StreamPlayerProps) {
  const streamUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream/${channel.slug}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Play className="w-6 h-6" />
          Probar Stream
        </h2>
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir stream
        </a>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <video
          controls
          autoPlay
          muted
          className="w-full h-full"
          src={streamUrl}
        >
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">
          URL del Stream (M3U8):
        </h3>
        <code className="block text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
          {streamUrl}
        </code>
        <p className="text-xs text-gray-600 mt-2">
          Usa esta URL en cualquier reproductor compatible con HLS (VLC, OBS, reproductores web, etc.)
        </p>
      </div>
    </div>
  );
}
