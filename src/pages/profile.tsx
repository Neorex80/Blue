import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Settings, LogOut, ChevronLeft, Bot, MessageSquare, Users, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { models } from '@/lib/models';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    totalPersonas: 0
  });
  const [settings, setSettings] = useState({
    defaultModel: 'mixtral-8x7b-32768'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setUser(user);
        
        // Get user settings
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userSettings) {
          setSettings({
            defaultModel: userSettings.default_model
          });
        }

        // Get total chats
        const { count: chatsCount } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get total personas
        const { count: personasCount } = await supabase
          .from('personas')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get total messages
        const { data: chats } = await supabase
          .from('chats')
          .select('id')
          .eq('user_id', user.id);

        let messagesCount = 0;
        if (chats && chats.length > 0) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('chat_id', chats.map(chat => chat.id));
          messagesCount = count || 0;
        }

        setStats({
          totalChats: chatsCount || 0,
          totalMessages: messagesCount,
          totalPersonas: personasCount || 0
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('user_settings')
          .update({
            default_model: settings.defaultModel,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            default_model: settings.defaultModel
          });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="loading-dots flex space-x-2">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Chat</span>
        </button>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Account Details</h2>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Member Since</label>
                <p className="text-lg">
                  {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm text-gray-400">Total Chats</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalChats}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-600/10 text-purple-400">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-sm text-gray-400">Messages</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalMessages}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-green-600/10 text-green-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm text-gray-400">Personas</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalPersonas}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Model Settings</h2>
              <Gauge className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Default Model</label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-3 transition-all duration-300 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}