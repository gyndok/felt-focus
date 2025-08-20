import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  tos_accepted_at: string | null;
  tos_version: string | null;
  created_at: string;
  updated_at: string;
}

export const useTermsOfService = () => {
  const { user, loading: authLoading } = useAuth();
  const [tosAccepted, setTosAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTosAcceptance = async () => {
      if (authLoading) return;
      
      if (!user) {
        setTosAccepted(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('tos_accepted_at, tos_version')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile exists yet - user hasn't accepted ToS
            setTosAccepted(false);
          } else {
            console.error('Error checking ToS acceptance:', error);
            setTosAccepted(false);
          }
        } else {
          // Check if user has accepted current version of ToS
          const hasAcceptedCurrentVersion = profile?.tos_accepted_at && profile?.tos_version === '1.0';
          setTosAccepted(hasAcceptedCurrentVersion);
        }
      } catch (err) {
        console.error('Error checking ToS acceptance:', err);
        setTosAccepted(false);
      } finally {
        setLoading(false);
      }
    };

    checkTosAcceptance();
  }, [user, authLoading]);

  const acceptTerms = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // First, try to update existing record
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let profileError;
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            tos_accepted_at: new Date().toISOString(),
            tos_version: '1.0'
          })
          .eq('user_id', user.id);
        profileError = error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            tos_accepted_at: new Date().toISOString(),
            tos_version: '1.0'
          });
        profileError = error;
      }

      if (profileError) throw profileError;

      setTosAccepted(true);
      return true;
    } catch (err) {
      console.error('Error accepting ToS:', err);
      return false;
    }
  };

  return {
    tosAccepted,
    loading: loading || authLoading,
    acceptTerms
  };
};