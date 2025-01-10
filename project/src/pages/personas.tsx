import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Bot, Plus, ChevronLeft, Heart, Users, Globe2, Lock } from 'lucide-react';
import { Database } from '@/lib/database.types';
import { models } from '@/lib/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Persona = Database['public']['Tables']['personas']['Row'];

export default function PersonasPage() {
  // ... (keep existing state and hooks)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* ... (keep existing header) */}

        {creating && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Persona</h2>
            <div className="space-y-4">
              {/* ... (keep name and avatar inputs) */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Short Description</label>
                <input
                  type="text"
                  value={newPersona.system_prompt}
                  onChange={(e) => setNewPersona({ ...newPersona, system_prompt: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Enter a brief description of the persona's personality"
                  maxLength={100}
                />
              </div>
              {/* ... (keep rest of the form) */}
            </div>
          </div>
        )}

        <Tabs defaultValue="my-personas" className="space-y-6">
          {/* ... (keep tabs header) */}

          <TabsContent value="my-personas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={persona.avatar_url}
                        alt={persona.name}
                        className="w-12 h-12 rounded-xl"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{persona.name}</h3>
                          {persona.is_public ? (
                            <Globe2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {models.find(m => m.id === persona.model)?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                    {persona.system_prompt}
                  </p>
                  {/* ... (keep action buttons) */}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="public-personas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicPersonas.map((persona) => (
                <div
                  key={persona.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={persona.avatar_url}
                        alt={persona.name}
                        className="w-12 h-12 rounded-xl"
                      />
                      <div>
                        <h3 className="font-semibold">{persona.name}</h3>
                        <p className="text-sm text-gray-400">
                          {models.find(m => m.id === persona.model)?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLikePersona(persona.id)}
                      className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-sm">{persona.likes}</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                    {persona.system_prompt}
                  </p>
                  {/* ... (keep action button) */}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}