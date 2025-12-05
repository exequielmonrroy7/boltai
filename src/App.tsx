import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Channel } from './types';
import { ChannelList } from './components/ChannelList';
import { ChannelForm } from './components/ChannelForm';
import { PlaylistManager } from './components/PlaylistManager';
import { StreamPlayer } from './components/StreamPlayer';
import { Plus, Radio } from 'lucide-react';

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlist' | 'stream'>('playlist');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading channels:', error);
      return;
    }

    setChannels(data || []);
  };

  const handleSaveChannel = async (channelData: Partial<Channel>) => {
    if (editingChannel) {
      const { error } = await supabase
        .from('channels')
        .update({
          ...channelData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingChannel.id);

      if (error) {
        console.error('Error updating channel:', error);
        alert('Error al actualizar el canal');
        return;
      }
    } else {
      const { error } = await supabase
        .from('channels')
        .insert(channelData);

      if (error) {
        console.error('Error creating channel:', error);
        alert('Error al crear el canal');
        return;
      }
    }

    setShowChannelForm(false);
    setEditingChannel(null);
    loadChannels();
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('¿Eliminar este canal y toda su playlist?')) return;

    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);

    if (error) {
      console.error('Error deleting channel:', error);
      alert('Error al eliminar el canal');
      return;
    }

    if (selectedChannel?.id === channelId) {
      setSelectedChannel(null);
    }

    loadChannels();
  };

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setActiveTab('playlist');
    setShowChannelForm(false);
  };

  const handleNewChannel = () => {
    setEditingChannel(null);
    setShowChannelForm(true);
    setSelectedChannel(null);
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setShowChannelForm(true);
    setSelectedChannel(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Radio className="w-10 h-10 text-blue-600" />
                Panel de Canales 24/7
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona tus canales de streaming en loop
              </p>
            </div>
            <button
              onClick={handleNewChannel}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Canal
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChannelList
              channels={channels}
              onSelectChannel={handleSelectChannel}
              onDeleteChannel={handleDeleteChannel}
              selectedChannelId={selectedChannel?.id}
            />
          </div>

          <div className="lg:col-span-2">
            {showChannelForm ? (
              <ChannelForm
                channel={editingChannel || undefined}
                onSave={handleSaveChannel}
                onCancel={() => {
                  setShowChannelForm(false);
                  setEditingChannel(null);
                }}
              />
            ) : selectedChannel ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('playlist')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'playlist'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Gestionar Playlist
                    </button>
                    <button
                      onClick={() => setActiveTab('stream')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'stream'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Probar Stream
                    </button>
                  </div>
                </div>

                {activeTab === 'playlist' ? (
                  <PlaylistManager channel={selectedChannel} />
                ) : (
                  <StreamPlayer channel={selectedChannel} />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Radio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Selecciona un canal
                </h3>
                <p className="text-gray-500">
                  Elige un canal de la lista o crea uno nuevo para comenzar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
