import { Channel } from '../types';
import { Tv, Edit, Trash2, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ChannelListProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: string) => void;
  selectedChannelId?: string;
}

export function ChannelList({
  channels,
  onSelectChannel,
  onDeleteChannel,
  selectedChannelId
}: ChannelListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyStreamUrl = (slug: string, channelId: string) => {
    const streamUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream/${slug}`;
    navigator.clipboard.writeText(streamUrl);
    setCopiedId(channelId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Tv className="w-6 h-6" />
          Canales
        </h2>
      </div>

      {channels.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No hay canales. Crea uno para empezar.
        </p>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`border rounded-lg p-4 transition-all ${
                selectedChannelId === channel.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {channel.name}
                  </h3>
                  {channel.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {channel.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      /{channel.slug}
                    </span>
                    <button
                      onClick={() => copyStreamUrl(channel.slug, channel.id)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs"
                      title="Copiar URL del stream .m3u8"
                    >
                      {copiedId === channel.id ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar URL
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onSelectChannel(channel)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar canal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteChannel(channel.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Eliminar canal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
