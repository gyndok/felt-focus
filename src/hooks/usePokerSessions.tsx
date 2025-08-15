import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type PokerSession = Database['public']['Tables']['poker_sessions']['Row'];
type PokerSessionInsert = Database['public']['Tables']['poker_sessions']['Insert'];
type PokerSessionUpdate = Database['public']['Tables']['poker_sessions']['Update'];

export const usePokerSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PokerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('poker_sessions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setSessions((data as PokerSession[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (sessionData: Omit<PokerSessionInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('poker_sessions')
        .insert([{
          ...sessionData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Add to local state immediately
      setSessions(prev => [data as PokerSession, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add session');
    }
  };

  const updateSession = async (id: string, updates: PokerSessionUpdate) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('poker_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSessions(prev => prev.map(session => 
        session.id === id ? { ...session, ...data } as PokerSession : session
      ));
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update session');
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('poker_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setSessions(prev => prev.filter(session => session.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete session');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    loading,
    error,
    addSession,
    updateSession,
    deleteSession,
    refetch: fetchSessions
  };
};

export type { PokerSession, PokerSessionInsert, PokerSessionUpdate };