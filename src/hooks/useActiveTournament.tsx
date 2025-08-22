import { useState, useEffect } from 'react';
import { Tournament } from './useTournaments';

export const useActiveTournament = (tournament: Tournament | null) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (tournament && tournament.status === 'active' && tournament.started_at) {
      // Calculate initial time
      const calculateCurrentTime = () => {
        const startTime = new Date(tournament.started_at).getTime();
        const now = Date.now();
        
        // Account for paused time
        const totalPausedMs = (tournament.total_paused_duration || 0) * 1000;
        
        // If currently paused, don't include time since pause started
        let additionalPausedTime = 0;
        if (tournament.is_paused && tournament.paused_at) {
          additionalPausedTime = now - new Date(tournament.paused_at).getTime();
        }
        
        const elapsedMs = now - startTime - totalPausedMs - additionalPausedTime;
        return Math.max(0, Math.floor(elapsedMs / 1000));
      };

      // Set initial time
      setCurrentTime(calculateCurrentTime());
      
      // Only update timer if tournament is not paused
      if (!tournament.is_paused) {
        interval = setInterval(() => {
          setCurrentTime(calculateCurrentTime());
        }, 1000);
      }
    } else {
      setCurrentTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tournament?.id, tournament?.status, tournament?.started_at, tournament?.is_paused, tournament?.paused_at, tournament?.total_paused_duration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    currentTime,
    formattedTime: formatTime(currentTime),
    formattedDuration: formatDuration(currentTime),
    isRunning: tournament?.status === 'active' && !tournament?.is_paused
  };
};