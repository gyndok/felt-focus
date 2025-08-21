import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useActiveSession = (userId: string | undefined) => {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch active session on load
  useEffect(() => {
    if (!userId) return;
    
    const fetchActiveSession = async () => {
      const { data, error } = await supabase
        .from('poker_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching active session:', error);
        return;
      }
      
      setActiveSession(data);
    };

    fetchActiveSession();
  }, [userId]);

  const startSession = async () => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      // First check if there's already an active session
      const { data: existingSession } = await supabase
        .from('poker_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (existingSession) {
        toast({
          title: "Session already active",
          description: "You already have an active session running.",
          variant: "destructive"
        });
        return null;
      }

      // Create new active session
      const { data, error } = await supabase
        .from('poker_sessions')
        .insert({
          user_id: userId,
          is_active: true,
          started_at: new Date().toISOString(),
          // Set placeholder values for required fields
          date: new Date().toISOString().split('T')[0],
          location: 'TBD',
          stakes: 'TBD',
          game_type: 'TBD',
          type: 'TBD',
          buy_in: 0,
          cash_out: 0,
          duration: 0
        })
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
      return data;
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!activeSession) return null;
    
    setLoading(true);
    try {
      const duration = (Date.now() - new Date(activeSession.started_at).getTime()) / 1000 / 3600; // hours
      
      // Update the session to mark it as ended
      const { data, error } = await supabase
        .from('poker_sessions')
        .update({
          is_active: false,
          duration: Number(duration.toFixed(1))
        })
        .eq('id', activeSession.id)
        .select()
        .single();

      if (error) throw error;

      setActiveSession(null);
      return { ...data, calculatedDuration: Number(duration.toFixed(1)) };
    } catch (error: any) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = async () => {
    if (!activeSession) return;
    
    setLoading(true);
    try {
      // Delete the active session
      const { error } = await supabase
        .from('poker_sessions')
        .delete()
        .eq('id', activeSession.id);

      if (error) throw error;

      setActiveSession(null);
    } catch (error: any) {
      console.error('Error canceling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSessionTime = () => {
    if (!activeSession?.started_at) return 0;
    return Math.floor((Date.now() - new Date(activeSession.started_at).getTime()) / 1000);
  };

  return {
    activeSession,
    loading,
    startSession,
    endSession,
    cancelSession,
    getCurrentSessionTime,
    isActive: !!activeSession
  };
};