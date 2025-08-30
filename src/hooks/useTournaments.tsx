import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getCurrentLocalDateTime } from '@/utils/dateHelpers';
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
      
      // Find active tournament (including paused ones)
      const active = tournamentList.find(t => t.status === 'active' || t.status === 'paused');
      setActiveTournament(active || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (tournamentData: Omit<TournamentInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { location?: string }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // End any existing active tournaments first
      await supabase
        .from('tournaments')
        .update({ status: 'finished', ended_at: getCurrentLocalDateTime() })
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { data, error } = await supabase
        .from('tournaments')
        .insert([{
          ...tournamentData,
          user_id: user.id,
          current_chips: tournamentData.current_chips || tournamentData.starting_chips,
          bb_stack: (tournamentData.current_chips || tournamentData.starting_chips) / tournamentData.big_blind
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
        ended_at: getCurrentLocalDateTime(),
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

  const pauseTournament = async (tournamentId: string) => {
    try {
      const pausedAt = getCurrentLocalDateTime();
      
      const { error } = await supabase
        .from('tournaments')
        .update({
          is_paused: true,
          paused_at: pausedAt,
          status: 'paused',
          updated_at: pausedAt
        })
        .eq('id', tournamentId);

      if (error) throw error;
      await fetchTournaments();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to pause tournament');
    }
  };

  const resumeTournament = async (tournamentId: string) => {
    try {
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) throw new Error('Tournament not found');

      const resumedAt = getCurrentLocalDateTime();
      const pausedDuration = tournament.paused_at 
        ? Math.floor((new Date(resumedAt).getTime() - new Date(tournament.paused_at).getTime()) / 1000)
        : 0;

      const { error } = await supabase
        .from('tournaments')
        .update({
          is_paused: false,
          resumed_at: resumedAt,
          status: 'active',
          total_paused_duration: (tournament.total_paused_duration || 0) + pausedDuration,
          updated_at: resumedAt
        })
        .eq('id', tournamentId);

      if (error) throw error;
      await fetchTournaments();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to resume tournament');
    }
  };

  const getUniqueLocations = useCallback(async () => {
    if (!user) return [];

    try {
      // Get locations from both tournaments and poker sessions
      const [tournamentData, sessionData] = await Promise.all([
        supabase
          .from('tournaments')
          .select('location')
          .eq('user_id', user.id)
          .not('location', 'is', null)
          .not('location', 'eq', ''),
        supabase
          .from('poker_sessions')
          .select('location')
          .eq('user_id', user.id)
          .not('location', 'is', null)
          .not('location', 'eq', '')
      ]);

      if (tournamentData.error) throw tournamentData.error;
      if (sessionData.error) throw sessionData.error;

      // Combine locations from both sources
      const tournamentLocations = tournamentData.data?.map(item => item.location).filter(Boolean) || [];
      const sessionLocations = sessionData.data?.map(item => item.location).filter(Boolean) || [];
      const allLocations = [...tournamentLocations, ...sessionLocations];
      
      return [...new Set(allLocations)].sort(); // Remove duplicates and sort alphabetically
    } catch (err) {
      console.error('Failed to fetch unique locations:', err);
      return [];
    }
  }, [user]);

  const deleteTournamentUpdate = async (updateId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    console.log('Attempting to delete tournament update:', updateId);

    try {
      const { data, error } = await supabase
        .from('tournament_updates')
        .delete()
        .eq('id', updateId)
        .select();

      console.log('Delete result:', { data, error });
      
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      console.log('Successfully deleted tournament update:', updateId);
      return data;
    } catch (err) {
      console.error('Delete failed:', err);
      throw err instanceof Error ? err : new Error('Failed to delete tournament update');
    }
  };

  const updateTournamentUpdate = async (updateId: string, updateData: Partial<Omit<TournamentUpdateInsert, 'id' | 'tournament_id' | 'timestamp'>>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('tournament_updates')
        .update(updateData)
        .eq('id', updateId)
        .select()
        .single();

      if (error) throw error;
      return data as TournamentUpdateRecord;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update tournament update');
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
    pauseTournament,
    resumeTournament,
    getUniqueLocations,
    deleteTournamentUpdate,
    updateTournamentUpdate,
    refetch: fetchTournaments
  };
};

export type { Tournament, TournamentInsert, TournamentUpdate, TournamentUpdateRecord, TournamentUpdateInsert };