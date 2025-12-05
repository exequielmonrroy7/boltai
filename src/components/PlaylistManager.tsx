import { useState, useEffect } from 'react';
import { PlaylistVideo, Channel } from '../types';
import { Plus, Trash2, GripVertical, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PlaylistManagerProps {
  channel: Channel;
}

export function PlaylistManager({ channel }: PlaylistManagerProps) {
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, [channel.id]);

  const loadVideos = async () => {
    const { data, error } = await supabase
      .from('playlist_videos')
      .select('*')
      .eq('channel_id', channel.id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading videos:', error);
      return;
    }

    setVideos(data || []);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const maxPosition = videos.length > 0 ? Math.max(...videos.map(v => v.position)) : -1;

    const { error } = await supabase
      .from('playlist_videos')
      .insert({
        channel_id: channel.id,
        video_url: videoUrl,
        title: videoTitle,
        position: maxPosition + 1,
      });

    if (error) {
      console.error('Error adding video:', error);
      alert('Error al añadir el video');
    } else {
      setVideoUrl('');
      setVideoTitle('');
      setIsAdding(false);
      loadVideos();
    }

    setLoading(false);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('¿Eliminar este video de la playlist?')) return;

    const { error } = await supabase
      .from('playlist_videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      console.error('Error deleting video:', error);
      alert('Error al eliminar el video');
    } else {
      loadVideos();
    }
  };

  const moveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (
      (direction === 'up' && videoIndex === 0) ||
      (direction === 'down' && videoIndex === videos.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
    const newVideos = [...videos];
    [newVideos[videoIndex], newVideos[newIndex]] = [newVideos[newIndex], newVideos[videoIndex]];

    const updates = newVideos.map((video, index) => ({
      id: video.id,
      position: index,
    }));

    for (const update of updates) {
      await supabase
        .from('playlist_videos')
        .update({ position: update.position })
        .eq('id', update.id);
    }

    loadVideos();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="w-6 h-6" />
            Playlist: {channel.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} en la playlist
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Añadir Video
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddVideo} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del Video
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/video.mp4"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                URL directa del video (mp4, m3u8, etc.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Video
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del video"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Añadiendo...' : 'Añadir'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setVideoUrl('');
                  setVideoTitle('');
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay videos en la playlist</p>
          <p className="text-sm mt-1">Añade videos para comenzar la transmisión</p>
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveVideo(video.id, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => moveVideo(video.id, 'down')}
                  disabled={index === videos.length - 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate">{video.title}</h4>
                <p className="text-xs text-gray-500 truncate">{video.video_url}</p>
              </div>

              <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>

              <button
                onClick={() => handleDeleteVideo(video.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
