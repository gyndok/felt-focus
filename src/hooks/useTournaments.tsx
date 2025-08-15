import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];
type TournamentUpdate = Database['public']['Tables']['tournaments']['Update'];
type TournamentUpdateRecord = Database['public']['Tables']['tournament_updates']['Row'];
type TournamentUpdateInsert = Database['public']['Tables']['tournament_updates']['Insert'];

export const useTournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = async () => {
    if (!user) {
      setTournaments([]);
      setActiveTournament(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      const tournamentList = (data as Tournament[]) || [];
      setTournaments(tournamentList);
      
      // Find active tournament
      const active = tournamentList.find(t => t.status === 'active');
      setActiveTournament(active || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (tournamentData: Omit<TournamentInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // End any existing active tournaments first
      await supabase
        .from('tournaments')
        .update({ status: 'finished', ended_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { data, error } = await supabase
        .from('tournaments')
        .insert([{
          ...tournamentData,
          user_id: user.id,
          current_chips: tournamentData.starting_chips,
          bb_stack: tournamentData.starting_chips / tournamentData.big_blind
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newTournament = data as Tournament;
      setTournaments(prev => [newTournament, ...prev]);
      setActiveTournament(newTournament);
      return newTournament;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create tournament');
    }
  };

  const updateTournament = async (id: string, updates: TournamentUpdate) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTournament = data as Tournament;
      setTournaments(prev => prev.map(tournament => 
        tournament.id === id ? updatedTournament : tournament
      ));
      
      if (activeTournament?.id === id) {
        setActiveTournament(updatedTournament);
      }
      
      return updatedTournament;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update tournament');
    }
  };

  const addTournamentUpdate = async (tournamentId: string, updateData: Omit<TournamentUpdateInsert, 'id' | 'tournament_id' | 'timestamp'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('tournament_updates')
        .insert([{
          ...updateData,
          tournament_id: tournamentId
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Also update the main tournament record
      await updateTournament(tournamentId, {
        level: updateData.level,
        small_blind: updateData.small_blind,
        big_blind: updateData.big_blind,
        current_chips: updateData.current_chips,
        players_left: updateData.players_left,
        avg_stack: updateData.avg_stack,
        bb_stack: updateData.bb_stack
      });

      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add tournament update');
    }
  };

  const endTournament = async (tournamentId: string, finalPosition?: number, prizeWon: number = 0) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updates: TournamentUpdate = {
        status: finalPosition ? 'finished' : 'eliminated',
        ended_at: new Date().toISOString(),
        final_position: finalPosition,
        prize_won: prizeWon
      };

      const tournament = await updateTournament(tournamentId, updates);
      
      if (activeTournament?.id === tournamentId) {
        setActiveTournament(null);
      }

      return tournament;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to end tournament');
    }
  };

  const getTournamentUpdates = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_updates')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as TournamentUpdateRecord[];
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch tournament updates');
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [user]);

  return {
    tournaments,
    activeTournament,
    loading,
    error,
    createTournament,
    updateTournament,
    addTournamentUpdate,
    endTournament,
    getTournamentUpdates,
    refetch: fetchTournaments
  };
};

export type { Tournament, TournamentInsert, TournamentUpdate, TournamentUpdateRecord, TournamentUpdateInsert };