import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface FeedbackItem {
  id: string;
  user_id: string;
  type: string;
  message: string;
  user_display_name: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function useFeedbackNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isAdmin = user?.email === 'gyndok@yahoo.com';

  const fetchFeedback = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllFeedback(data || []);
      setUnreadCount(data?.filter(item => !item.reviewed_at).length || 0);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (feedbackId: string) => {
    if (!isAdmin || !user) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', feedbackId);

      if (error) throw error;

      // Update local state
      setAllFeedback(prev => 
        prev.map(item => 
          item.id === feedbackId 
            ? { ...item, reviewed_at: new Date().toISOString(), reviewed_by: user.id }
            : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking feedback as reviewed:', error);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      // Update local state
      setAllFeedback(prev => prev.filter(item => item.id !== feedbackId));
      setUnreadCount(prev => {
        const deletedFeedback = allFeedback.find(item => item.id === feedbackId);
        return deletedFeedback && !deletedFeedback.reviewed_at ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [isAdmin]);

  // Set up real-time subscription for new feedback
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback'
        },
        (payload) => {
          const newFeedback = payload.new as FeedbackItem;
          setAllFeedback(prev => [newFeedback, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback'
        },
        (payload) => {
          const updatedFeedback = payload.new as FeedbackItem;
          setAllFeedback(prev => 
            prev.map(item => 
              item.id === updatedFeedback.id ? updatedFeedback : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return {
    unreadCount,
    allFeedback,
    loading,
    isAdmin,
    markAsReviewed,
    deleteFeedback,
    refreshFeedback: fetchFeedback
  };
}