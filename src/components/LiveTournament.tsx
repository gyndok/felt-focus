import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Play, Pause, Square, Trophy, Users, Clock, TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTournaments, type Tournament } from '@/hooks/useTournaments';
import { usePokerSessions } from '@/hooks/usePokerSessions';
import { useActiveTournament } from '@/hooks/useActiveTournament';

interface LiveTournamentProps {
  onSessionAdded?: () => void;
}

const LiveTournament = ({ onSessionAdded }: LiveTournamentProps) => {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    addSession,
    refetch: refetchSessions
  } = usePokerSessions();
  const {
    activeTournament,
    createTournament,
    updateTournament,
    addTournamentUpdate,
    endTournament,
    getTournamentUpdates,
    pauseTournament,
    resumeTournament,
    getUniqueLocations
  } = useTournaments();
  
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showQuickUpdateDialog, setShowQuickUpdateDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [tournamentUpdates, setTournamentUpdates] = useState<any[]>([]);
  const [newTournament, setNewTournament] = useState({
    name: '',
    location: '',
    buy_in: '',
    house_rake: '',
    starting_chips: '30000',
    day_2_stack: '',
    day_2_players_left: '',
    is_day_2: false,
    level: '1',
    guarantee: '',
    total_players: '',
    small_blind: '100',
    big_blind: '200',
    game_type: 'NLHE',
    percent_paid: '15'
  });
  const [updateData, setUpdateData] = useState({
    level: 1,
    small_blind: '',
    big_blind: '',
    current_chips: '',
    players_left: '',
    total_entries: '',
    percent_paid: '',
    notes: ''
  });
  const [quickUpdateData, setQuickUpdateData] = useState({
    total_entries: '',
    players_left: '',
    percent_paid: ''
  });
  const [endData, setEndData] = useState({
    final_position: '',
    prize_won: '0'
  });
  const [chipDialogOpen, setChipDialogOpen] = useState(false);
  const [chipUpdateValue, setChipUpdateValue] = useState('');
  const [tournamentLocations, setTournamentLocations] = useState<string[]>([]);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Tournament timer
  const { currentTime, formattedTime, formattedDuration, isRunning } = useActiveTournament(activeTournament);

  // Calculate tournament economics
  const economics = useMemo(() => {
    if (!activeTournament) return null;
    const totalCollected = activeTournament.buy_in * (activeTournament.total_players || 0);
    const totalRake = activeTournament.house_rake * (activeTournament.total_players || 0);
    const prizePool = totalCollected - totalRake;
    const rakePercentage = activeTournament.house_rake / activeTournament.buy_in * 100;
    const prizePoolPerPlayer = activeTournament.buy_in - activeTournament.house_rake;
    const playersNeededForGuarantee = activeTournament.guarantee ? Math.ceil(activeTournament.guarantee / prizePoolPerPlayer) : 0;
    
    // Money bubble calculations
    const percentPaid = activeTournament.percent_paid || 15; // Use stored value or default to 15%
    const playersInMoney = activeTournament.total_players ? Math.floor((activeTournament.total_players * percentPaid) / 100) : 0;
    const totalChipsInPlay = activeTournament.total_players ? activeTournament.starting_chips * activeTournament.total_players : 0;
    const avgStackAtBubble = playersInMoney > 0 && totalChipsInPlay > 0 ? totalChipsInPlay / (playersInMoney + 1) : 0;
    
    return {
      totalCollected,
      prizePool,
      rakePercentage,
      playersNeededForGuarantee,
      playersInMoney,
      avgStackAtBubble,
      overlay: activeTournament.guarantee && activeTournament.guarantee > prizePool ? activeTournament.guarantee - prizePool : 0
    };
  }, [activeTournament]);

  // Calculate current average stack
  const currentAvgStack = useMemo(() => {
    if (!activeTournament?.players_left || !activeTournament?.total_players) return null;
    const totalChipsInPlay = activeTournament.starting_chips * activeTournament.total_players;
    return totalChipsInPlay / activeTournament.players_left;
  }, [activeTournament]);

  // Calculate stack health
  const stackHealth = useMemo(() => {
    if (!activeTournament?.bb_stack) return 'unknown';
    const bb = activeTournament.bb_stack;
    if (bb >= 20) return 'healthy';
    if (bb >= 10) return 'caution';
    if (bb >= 5) return 'danger';
    return 'critical';
  }, [activeTournament?.bb_stack]);
  const handleStartTournament = async () => {
    if (!newTournament.name || !newTournament.buy_in || !newTournament.starting_chips) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    try {
      console.log('Creating tournament with user:', user);
      if (!user) {
        throw new Error('User not authenticated');
      }
      const startingChips = parseFloat(newTournament.starting_chips);
      const bigBlind = parseFloat(newTournament.big_blind);
      // Use day 2 stack if entering day 2, otherwise use starting chips
      const currentChips = newTournament.is_day_2 && newTournament.day_2_stack 
        ? parseFloat(newTournament.day_2_stack) 
        : startingChips;

      // Use day 2 players left if entering day 2, otherwise use total players
      const playersLeft = newTournament.is_day_2 && newTournament.day_2_players_left
        ? parseInt(newTournament.day_2_players_left)
        : (newTournament.total_players ? parseInt(newTournament.total_players) : null);

      await createTournament({
        name: newTournament.name,
        location: newTournament.location,
        buy_in: parseFloat(newTournament.buy_in),
        house_rake: parseFloat(newTournament.house_rake) || 0,
        starting_chips: startingChips,
        guarantee: newTournament.guarantee ? parseFloat(newTournament.guarantee) : null,
        total_players: newTournament.total_players ? parseInt(newTournament.total_players) : null,
        level: parseInt(newTournament.level) || 1,
        small_blind: parseFloat(newTournament.small_blind),
        big_blind: bigBlind,
        players_left: playersLeft,
        current_chips: currentChips,
        bb_stack: currentChips / bigBlind,
        game_type: newTournament.game_type,
        percent_paid: parseFloat(newTournament.percent_paid) || 15
      });
      setNewTournament({
        name: '',
        location: '',
        buy_in: '',
        house_rake: '',
        starting_chips: '30000',
        day_2_stack: '',
        day_2_players_left: '',
        is_day_2: false,
        level: '1',
        guarantee: '',
        total_players: '',
        small_blind: '100',
        big_blind: '200',
        game_type: 'NLHE',
        percent_paid: '15'
      });
      setShowStartDialog(false);
      toast({
        title: "Tournament Started",
        description: "Good luck at the tables!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start tournament",
        variant: "destructive"
      });
    }
  };
  const handleUpdateTournament = async () => {
    if (!activeTournament || !updateData.current_chips) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }
    try {
      const currentChips = parseFloat(updateData.current_chips);
      const bigBlind = parseFloat(updateData.big_blind) || activeTournament.big_blind;
      const playersLeft = updateData.players_left ? parseInt(updateData.players_left) : activeTournament.players_left;
      const totalEntries = updateData.total_entries ? parseInt(updateData.total_entries) : activeTournament.total_players;

      // Calculate total chips in play from total entries
      const totalChipsInPlay = totalEntries ? activeTournament.starting_chips * totalEntries : null;
      const avgStack = playersLeft && totalChipsInPlay ? totalChipsInPlay / playersLeft : null;
      const bbStack = currentChips / bigBlind;

      // Update tournament with new total entries if provided
      if (updateData.total_entries && totalEntries !== activeTournament.total_players) {
        await updateTournament(activeTournament.id, { total_players: totalEntries });
      }

      // Update tournament with new percent paid if provided
      if (updateData.percent_paid) {
        await updateTournament(activeTournament.id, { percent_paid: parseFloat(updateData.percent_paid) });
      }

      await addTournamentUpdate(activeTournament.id, {
        level: updateData.level || activeTournament.level,
        small_blind: parseFloat(updateData.small_blind) || activeTournament.small_blind,
        big_blind: bigBlind,
        current_chips: currentChips,
        players_left: playersLeft,
        avg_stack: avgStack,
        bb_stack: bbStack,
        notes: updateData.notes || null
      });
      setUpdateData({
        level: 1,
        small_blind: '',
        big_blind: '',
        current_chips: '',
        players_left: '',
        total_entries: '',
        percent_paid: '',
        notes: ''
      });
      setShowUpdateDialog(false);
      toast({
        title: "Tournament Updated",
        description: "Progress saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tournament",
        variant: "destructive"
      });
    }
  };

  const handleQuickUpdate = async () => {
    if (!activeTournament) return;
    
    try {
      const totalEntries = quickUpdateData.total_entries ? parseInt(quickUpdateData.total_entries) : activeTournament.total_players;
      const playersLeft = quickUpdateData.players_left ? parseInt(quickUpdateData.players_left) : activeTournament.players_left;
      
      // Update tournament with new values if provided
      const updates: any = {};
      if (quickUpdateData.total_entries && totalEntries !== activeTournament.total_players) {
        updates.total_players = totalEntries;
      }
      if (quickUpdateData.players_left && playersLeft !== activeTournament.players_left) {
        updates.players_left = playersLeft;
      }
      if (quickUpdateData.percent_paid) {
        updates.percent_paid = parseFloat(quickUpdateData.percent_paid);
      }
      
      if (Object.keys(updates).length > 0) {
        await updateTournament(activeTournament.id, updates);
      }

      setQuickUpdateData({
        total_entries: '',
        players_left: '',
        percent_paid: ''
      });
      setShowQuickUpdateDialog(false);
      toast({
        title: "Tournament Updated",
        description: "Quick update completed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tournament",
        variant: "destructive"
      });
    }
  };
  const handleEndTournament = async () => {
    if (!activeTournament) return;
    try {
      const finalPosition = endData.final_position ? parseInt(endData.final_position) : undefined;
      const prizeWon = parseFloat(endData.prize_won) || 0;
      const endedTournament = await endTournament(activeTournament.id, finalPosition, prizeWon);

      // Add to poker sessions for bankroll tracking
      const profit = prizeWon - activeTournament.buy_in;
      const duration = endedTournament.ended_at && activeTournament.started_at ? (new Date(endedTournament.ended_at).getTime() - new Date(activeTournament.started_at).getTime()) / (1000 * 60 * 60) : 0;
      await addSession({
        date: new Date(activeTournament.started_at).toISOString().split('T')[0],
        type: 'mtt',
        game_type: activeTournament.game_type,
        stakes: `$${activeTournament.buy_in}`,
        location: activeTournament.location || activeTournament.name,
        buy_in: activeTournament.buy_in,
        cash_out: prizeWon,
        duration: duration,
        notes: finalPosition ? `Finished ${finalPosition}` : 'Eliminated'
      });
      
      // Refetch sessions to immediately update the recent sessions list
      await refetchSessions();
      
      // Notify parent component that a session was added
      onSessionAdded?.();
      
      setEndData({
        final_position: '',
        prize_won: '0'
      });
      setShowEndDialog(false);
      toast({
        title: "Tournament Ended",
        description: "Results saved to bankroll"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end tournament",
        variant: "destructive"
      });
    }
  };

  const handlePauseTournament = async () => {
    if (!activeTournament) return;
    try {
      await pauseTournament(activeTournament.id);
      toast({
        title: "Tournament Paused",
        description: "Tournament has been paused for multi-day tracking"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause tournament",
        variant: "destructive"
      });
    }
  };

  const handleResumeTournament = async () => {
    if (!activeTournament) return;
    try {
      await resumeTournament(activeTournament.id);
      toast({
        title: "Tournament Resumed",
        description: "Tournament has been resumed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resume tournament",
        variant: "destructive"
      });
    }
  };

  // Load tournament updates for chart
  useEffect(() => {
    if (activeTournament?.id) {
      getTournamentUpdates(activeTournament.id).then(updates => {
        setTournamentUpdates(updates || []);
      }).catch(console.error);
    }
  }, [activeTournament?.id, getTournamentUpdates]);

  // Load unique tournament locations
  useEffect(() => {
    const loadLocations = async () => {
      if (user) {
        try {
          const locations = await getUniqueLocations();
          console.log('Loaded tournament locations:', locations);
          setTournamentLocations(locations);
        } catch (error) {
          console.error('Failed to load locations:', error);
        }
      } else {
        setTournamentLocations([]);
      }
    };
    
    loadLocations();
  }, [user, getUniqueLocations]);

  // Header auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Always show header at top
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        // Hide header when scrolling down
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Show header when scrolling up
        setHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!activeTournament) return [];
    
    // Create starting data point
    const data = [{
      level: 1,
      chips: Number(activeTournament.starting_chips)
    }];
    
    if (tournamentUpdates && tournamentUpdates.length > 0) {
      // Sort updates by level to ensure proper line drawing
      const sortedUpdates = [...tournamentUpdates].sort((a, b) => a.level - b.level);
      
      sortedUpdates.forEach((update) => {
        const chips = Number(update.current_chips);
        
        // Add all valid data points (including level 1 updates if they exist)
        if (!isNaN(chips)) {
          // Remove existing level 1 entry if we have a level 1 update
          if (update.level === 1) {
            data.splice(0, 1); // Remove the default level 1 entry
          }
          
          data.push({
            level: Number(update.level),
            chips: chips
          });
        }
      });
    }
    
    return data.sort((a, b) => a.level - b.level);
  }, [activeTournament, tournamentUpdates]);

  if (!activeTournament) {
    return <div className="flex flex-col items-center justify-center p-6 pt-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">No Active Tournament</h2>
            <p className="text-muted-foreground">
              Start tracking a live tournament to monitor your stack health and progress.
            </p>
          </div>
          
          <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start New Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto touch-pan-y sm:max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Start Tournament</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input id="name" value={newTournament.name} onChange={e => setNewTournament({
                  ...newTournament,
                  name: e.target.value
                })} placeholder="Main Event" />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="space-y-2">
                      <Select value={newTournament.location === '' ? 'custom' : (tournamentLocations.includes(newTournament.location) ? newTournament.location : 'custom')} onValueChange={value => {
                       if (value === 'custom') {
                         setNewTournament({
                           ...newTournament,
                           location: ''
                         });
                       } else {
                         setNewTournament({
                           ...newTournament,
                           location: value
                         });
                       }
                     }}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select tournament location" />
                       </SelectTrigger>
                       <SelectContent className="bg-background border z-50">
                         {tournamentLocations.length > 0 && tournamentLocations.map(location => (
                           <SelectItem key={location} value={location}>{location}</SelectItem>
                         ))}
                         <SelectItem value="custom">
                           {tournamentLocations.length > 0 ? 'Enter Custom Location...' : 'Enter Location...'}
                         </SelectItem>
                       </SelectContent>
                     </Select>
                    {(newTournament.location === '' || !tournamentLocations.includes(newTournament.location)) && (
                      <Input 
                        placeholder="Enter tournament location (e.g., Aria, Borgata, WSOP, etc.)"
                        value={newTournament.location}
                        onChange={e => setNewTournament({
                          ...newTournament,
                          location: e.target.value
                        })}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="game_type">Game Type</Label>
                  <div className="space-y-2">
                    <Select value={newTournament.game_type} onValueChange={value => {
                      if (value === 'custom') {
                        setNewTournament({
                          ...newTournament,
                          game_type: ''
                        });
                      } else {
                        setNewTournament({
                          ...newTournament,
                          game_type: value
                        });
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or enter custom..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NLHE">No Limit Hold'em</SelectItem>
                        <SelectItem value="PLO">Pot Limit Omaha</SelectItem>
                        <SelectItem value="PLO5">PLO5 (5-card)</SelectItem>
                        <SelectItem value="STUD">7-Card Stud</SelectItem>
                        <SelectItem value="RAZZ">Razz</SelectItem>
                        <SelectItem value="8OB">Omaha Hi-Lo</SelectItem>
                        <SelectItem value="MIXED">Mixed Games</SelectItem>
                        <SelectItem value="custom">Enter Custom Game Type...</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="Enter custom game type (e.g., PLO8, 2-7 Triple Draw, etc.)"
                      value={newTournament.game_type}
                      onChange={e => setNewTournament({
                        ...newTournament,
                        game_type: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="buy_in">Buy-in ($)</Label>
                    <Input id="buy_in" type="number" value={newTournament.buy_in} onChange={e => setNewTournament({
                    ...newTournament,
                    buy_in: e.target.value
                  })} placeholder="240" />
                  </div>
                  <div>
                    <Label htmlFor="house_rake">House Rake ($)</Label>
                    <Input id="house_rake" type="number" value={newTournament.house_rake} onChange={e => setNewTournament({
                    ...newTournament,
                    house_rake: e.target.value
                  })} placeholder="55" />
                  </div>
                  <div>
                    <Label htmlFor="starting_chips">Starting Chips</Label>
                    <Input id="starting_chips" type="number" value={newTournament.starting_chips} onChange={e => setNewTournament({
                    ...newTournament,
                    starting_chips: e.target.value
                  })} placeholder="30000" />
                  </div>
                </div>
                
                {/* Day 2 Stack Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_day_2"
                      checked={newTournament.is_day_2}
                      onChange={e => setNewTournament({
                        ...newTournament,
                        is_day_2: e.target.checked,
                        day_2_stack: e.target.checked ? newTournament.starting_chips : ''
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_day_2" className="text-sm font-medium">
                      Restart (use different stack than starting chips)
                    </Label>
                  </div>
                  
                  {newTournament.is_day_2 && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="day_2_stack">Day 2 Starting Stack</Label>
                        <Input 
                          id="day_2_stack" 
                          type="number" 
                          value={newTournament.day_2_stack} 
                          onChange={e => setNewTournament({
                            ...newTournament,
                            day_2_stack: e.target.value
                          })} 
                          placeholder="45000" 
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Your actual stack size for day 2. Starting chips ({newTournament.starting_chips}) will still be used for calculations.
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="day_2_players_left">Players Left (Day 2)</Label>
                        <Input 
                          id="day_2_players_left" 
                          type="number" 
                          value={newTournament.day_2_players_left || ''} 
                          onChange={e => setNewTournament({
                            ...newTournament,
                            day_2_players_left: e.target.value
                          })} 
                          placeholder="147" 
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Number of players remaining at start of day 2
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="guarantee">Guarantee ($) - Optional</Label>
                    <Input id="guarantee" type="number" value={newTournament.guarantee} onChange={e => setNewTournament({
                    ...newTournament,
                    guarantee: e.target.value
                  })} placeholder="25000" />
                  </div>
                  <div>
                    <Label htmlFor="total_players">Total Entries</Label>
                    <Input id="total_players" type="number" value={newTournament.total_players} onChange={e => setNewTournament({
                    ...newTournament,
                    total_players: e.target.value
                  })} placeholder="125" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="small_blind">Small Blind</Label>
                    <Input id="small_blind" type="number" value={newTournament.small_blind} onChange={e => setNewTournament({
                    ...newTournament,
                    small_blind: e.target.value
                  })} placeholder="100" />
                  </div>
                  <div>
                    <Label htmlFor="big_blind">Big Blind</Label>
                    <Input id="big_blind" type="number" value={newTournament.big_blind} onChange={e => setNewTournament({
                    ...newTournament,
                    big_blind: e.target.value
                  })} placeholder="200" />
                  </div>
                  <div>
                    <Label htmlFor="level">Starting Level</Label>
                    <Input id="level" type="number" value={newTournament.level} onChange={e => setNewTournament({
                    ...newTournament,
                    level: e.target.value
                  })} placeholder="1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="percent_paid">% Field Paid</Label>
                    <Input 
                      id="percent_paid" 
                      type="number" 
                      value={newTournament.percent_paid} 
                      onChange={e => setNewTournament({
                        ...newTournament,
                        percent_paid: e.target.value
                      })} 
                      placeholder="15" 
                    />
                  </div>
                </div>
                
                <Button onClick={handleStartTournament} className="w-full">
                  Start Tournament
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Compact Mobile Header */}
      <div className={`gradient-casino text-white p-3 fixed top-0 left-0 right-0 z-10 transition-transform duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-md mx-auto">
          {/* Tournament Name & Location */}
          <div className="text-center mb-3">
            <h1 className="text-lg font-bold truncate">{activeTournament.name}</h1>
            {activeTournament.location && (
              <div className="text-xs opacity-80 truncate">@ {activeTournament.location}</div>
            )}
          </div>
          
          {/* Compact Timer & Chips Row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Timer */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-2">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <div className="text-sm font-mono font-bold">{formattedTime}</div>
                  {isRunning && (
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-xs opacity-70 text-center truncate">
                  {formattedDuration}{activeTournament.is_paused && " (Paused)"}
                </div>
              </CardContent>
            </Card>
            
            {/* Chips */}
            <Dialog open={chipDialogOpen} onOpenChange={setChipDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/15 transition-colors">
                  <CardContent className="p-2">
                    <div className="text-center">
                      <div className="text-sm font-bold truncate">
                        {activeTournament.current_chips.toLocaleString()}
                      </div>
                      <div className="text-xs opacity-80 truncate">
                        {activeTournament.bb_stack?.toFixed(1)} BB
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-md border border-white/20">
                <DialogHeader>
                  <DialogTitle>Update Chip Stack</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chip-amount">New Chip Amount</Label>
                    <Input
                      id="chip-amount"
                      type="number"
                      value={chipUpdateValue}
                      onChange={(e) => setChipUpdateValue(e.target.value)}
                      placeholder={activeTournament.current_chips.toString()}
                      autoFocus
                    />
                  </div>
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> This quick update only changes your current chip stack display. 
                      To update the progress graph, use the "Full Update" button below instead.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        const newChips = parseFloat(chipUpdateValue);
                        if (newChips && newChips > 0) {
                          const newBBStack = newChips / activeTournament.big_blind;
                          updateTournament(activeTournament.id, { 
                            current_chips: newChips,
                            bb_stack: newBBStack
                          });
                          setChipDialogOpen(false);
                          setChipUpdateValue('');
                          toast({
                            title: "Chip stack updated",
                            description: `Updated to ${newChips.toLocaleString()} chips`
                          });
                        }
                      }}
                      disabled={!chipUpdateValue || parseFloat(chipUpdateValue) <= 0}
                    >
                      Update
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setChipDialogOpen(false);
                      setChipUpdateValue('');
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Status Badge - Compact */}
          <div className="flex justify-center">
            {activeTournament.is_paused && (
              <Badge className="bg-orange-500 text-xs px-2 py-0.5">
                Paused
              </Badge>
            )}
            {!activeTournament.is_paused && (
              <Badge className={`text-xs px-2 py-0.5 ${stackHealth === 'healthy' ? 'bg-green-500' : stackHealth === 'caution' ? 'bg-yellow-500' : stackHealth === 'danger' ? 'bg-orange-500' : 'bg-red-500'}`}>
                {stackHealth === 'healthy' ? 'Healthy' : stackHealth === 'caution' ? 'Caution' : stackHealth === 'danger' ? 'Danger' : 'Critical'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20 space-y-6" style={{ paddingTop: '120px' }}>
        {/* Tournament Economics */}
        {economics && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Tournament Economics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-lg lg:text-xl font-bold">
                    ${activeTournament.buy_in.toLocaleString()}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground">
                    Buy-in ({economics.rakePercentage.toFixed(1)}% rake)
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-lg lg:text-xl font-bold text-green-600">
                    ${economics.prizePool.toLocaleString()}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground">Prize Pool</div>
                  {economics.overlay > 0 && (
                    <div className="text-xs text-orange-500">+${economics.overlay.toLocaleString()} overlay</div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-lg lg:text-xl font-bold">
                    ${economics.totalCollected.toLocaleString()}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground">Total Collected</div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-lg lg:text-xl font-bold text-red-600">
                    ${((activeTournament.total_players || 0) * activeTournament.house_rake).toLocaleString()}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground">
                    House Rake
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${activeTournament.house_rake}/entry
                  </div>
                </CardContent>
              </Card>

              {activeTournament.guarantee && (
                <>
                  <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg lg:text-xl font-bold text-orange-600">
                        ${activeTournament.guarantee.toLocaleString()}
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        Guarantee {economics.overlay > 0 ? '(overlay)' : ''}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg lg:text-xl font-bold text-blue-600">
                        {economics.playersNeededForGuarantee}
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        Players Needed
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {economics.playersInMoney > 0 && (() => {
                const playersLeft = activeTournament.players_left || activeTournament.total_players;
                const totalPlayers = activeTournament.total_players;
                const percentPaid = activeTournament.percent_paid || 15;
                const playersPaid = Math.ceil(totalPlayers * (percentPaid / 100));
                const isInMoney = playersLeft <= playersPaid;
                
                return (
                  <>
                    <Card className="glass-card">
                      <CardContent className="p-4 text-center">
                        <div className="text-lg lg:text-xl font-bold text-green-600">
                          {economics.playersInMoney}
                        </div>
                        <div className="text-xs lg:text-sm text-muted-foreground">
                          {isInMoney ? "Players Paid" : "In the Money"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activeTournament.percent_paid || 15}% of field cashes
                        </div>
                      </CardContent>
                    </Card>

                    {!isInMoney ? (
                      <Card className="glass-card">
                        <CardContent className="p-4 text-center">
                          <div className="text-lg lg:text-xl font-bold text-purple-600">
                            {Math.floor(economics.avgStackAtBubble).toLocaleString()}
                          </div>
                          <div className="text-xs lg:text-sm text-muted-foreground">
                            Avg Stack at Bubble
                          </div>
                          <div className="text-xs text-muted-foreground"></div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="glass-card">
                        <CardContent className="p-4 text-center">
                          <div className="text-lg lg:text-xl font-bold text-blue-600">
                            {((activeTournament.current_chips / (activeTournament.starting_chips * activeTournament.total_players)) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs lg:text-sm text-muted-foreground">
                            Chip Share
                          </div>
                          <div className="text-xs text-muted-foreground">of total in play</div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-xl lg:text-2xl font-bold">Level {activeTournament.level}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Current Level</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-lg lg:text-xl font-bold">
                {Math.floor(activeTournament.total_players * activeTournament.starting_chips).toLocaleString()}
              </div>
              <div className="text-xs lg:text-sm text-muted-foreground">Total Chips in Play</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    const currentPlayersLeft = activeTournament.players_left || activeTournament.total_players;
                    if (currentPlayersLeft > 0) {
                      updateTournament(activeTournament.id, { 
                        players_left: currentPlayersLeft - 1 
                      });
                    }
                  }}
                  disabled={!activeTournament.players_left || activeTournament.players_left <= 0}
                >
                  -
                </Button>
                <div className="text-xl lg:text-2xl font-bold min-w-[60px]">
                  {activeTournament.players_left || activeTournament.total_players}/{activeTournament.total_players}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    const currentPlayersLeft = activeTournament.players_left || activeTournament.total_players;
                    if (currentPlayersLeft < activeTournament.total_players) {
                      updateTournament(activeTournament.id, { 
                        players_left: currentPlayersLeft + 1 
                      });
                    }
                  }}
                  disabled={!activeTournament.total_players || (activeTournament.players_left || 0) >= activeTournament.total_players}
                >
                  +
                </Button>
              </div>
              <div className="text-xs lg:text-sm text-muted-foreground">Players Left/Entered</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-xl lg:text-2xl font-bold">
                {activeTournament.small_blind}/{activeTournament.big_blind}
              </div>
              <div className="text-xs lg:text-sm text-muted-foreground">Current Blinds</div>
            </CardContent>
          </Card>
        </div>

        {/* In the Money Status */}
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
              {/* Enhanced In the Money Indicator */}
              {(() => {
                const playersLeft = activeTournament.players_left || activeTournament.total_players;
                const totalPlayers = activeTournament.total_players;
                const percentPaid = activeTournament.percent_paid || 15;
                const playersPaid = Math.ceil(totalPlayers * (percentPaid / 100));
                const isInMoney = playersLeft <= playersPaid;
                const eliminationsToMoney = playersPaid - playersLeft;
                const bubbleZone = eliminationsToMoney <= 5 && eliminationsToMoney > 0;
                
                return (
                  <div className="space-y-2">
                    {isInMoney ? (
                      <div className="animate-fade-in">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse border-2 border-green-300 shadow-lg">
                          🏆 IN THE MONEY! 🏆
                        </Badge>
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Congratulations! Minimum payout secured 🎉
                        </div>
                      </div>
                    ) : bubbleZone ? (
                      <div className="animate-fade-in">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse border-2 border-orange-300">
                          🫧 BUBBLE TIME! 🫧
                        </Badge>
                        <div className="text-xs text-orange-600 font-medium">
                          Just {eliminationsToMoney} elimination{eliminationsToMoney > 1 ? 's' : ''} to the money!
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${Math.max(10, ((totalPlayers - playersLeft) / (totalPlayers - playersPaid)) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {eliminationsToMoney} eliminations to money
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
                      💰 Top {playersPaid} players paid ({percentPaid}%)
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {currentAvgStack && (
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-xl lg:text-2xl font-bold">
                  {(currentAvgStack / activeTournament.big_blind).toFixed(0)} BB
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">Average Stack</div>
                <div className="text-xs text-muted-foreground">
                  {Math.floor(currentAvgStack).toLocaleString()} chips
                </div>
              </CardContent>
            </Card>
          )}


        {/* Stack Progression Chart */}
        {chartData.length > 0 && <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Stack Progression
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="chipGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="level" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={value => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      labelFormatter={value => `Level ${value}`} 
                      formatter={(value: number) => [`${value.toLocaleString()} chips`, 'Stack']} 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="chips" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fill="url(#chipGradient)"
                      dot={{
                        fill: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        r: 6
                      }}
                      activeDot={{
                        r: 8,
                        stroke: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        fill: 'hsl(var(--background))'
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Tournament Level</span>
                <span>Stack in Chips</span>
              </div>
            </CardContent>
          </Card>}

        {/* Action Buttons */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Tournament Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={() => setShowQuickUpdateDialog(true)} size="sm" variant="outline" className="flex-1">
                Quick Update
              </Button>
              <Button onClick={() => setShowUpdateDialog(true)} size="sm" className="flex-1">
                Full Update
              </Button>
            </div>
            <div className="flex gap-2">
              {activeTournament.is_paused ? (
                <Button onClick={handleResumeTournament} size="sm" variant="outline" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button onClick={handlePauseTournament} size="sm" variant="outline" className="flex-1">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={() => setShowEndDialog(true)} variant="destructive" size="sm" className="flex-1">
                End Tournament
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Update Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Tournament</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Input id="level" type="number" value={updateData.level} onChange={e => setUpdateData({
                  ...updateData,
                  level: parseInt(e.target.value) || 1
                })} placeholder="1" />
                </div>
                <div>
                  <Label htmlFor="update_small_blind">Small Blind</Label>
                  <Input id="update_small_blind" type="number" value={updateData.small_blind} onChange={e => setUpdateData({
                  ...updateData,
                  small_blind: e.target.value
                })} placeholder={activeTournament.small_blind.toString()} />
                </div>
                <div>
                  <Label htmlFor="update_big_blind">Big Blind</Label>
                  <Input id="update_big_blind" type="number" value={updateData.big_blind} onChange={e => setUpdateData({
                  ...updateData,
                  big_blind: e.target.value
                })} placeholder={activeTournament.big_blind.toString()} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="update_current_chips">Current Chips *</Label>
                  <Input id="update_current_chips" type="number" value={updateData.current_chips} onChange={e => setUpdateData({
                  ...updateData,
                  current_chips: e.target.value
                })} placeholder={activeTournament.current_chips.toString()} />
                </div>
                <div>
                  <Label htmlFor="update_players_left">Players Left</Label>
                  <Input id="update_players_left" type="number" value={updateData.players_left} onChange={e => setUpdateData({
                  ...updateData,
                  players_left: e.target.value
                })} placeholder={activeTournament.players_left?.toString()} />
                </div>
              </div>

              <div>
                <Label htmlFor="update_total_entries">Total Entries</Label>
                <Input id="update_total_entries" type="number" value={updateData.total_entries} onChange={e => setUpdateData({
                ...updateData,
                total_entries: e.target.value
              })} placeholder={activeTournament.total_players?.toString()} />
                <div className="text-xs text-muted-foreground mt-1">
                  Current: {activeTournament.total_players || 'Not set'}
                </div>
              </div>

              <div>
                <Label htmlFor="update_percent_paid">% Field Paid</Label>
                <Input id="update_percent_paid" type="number" value={updateData.percent_paid} onChange={e => setUpdateData({
                ...updateData,
                percent_paid: e.target.value
              })} placeholder="15" />
                <div className="text-xs text-muted-foreground mt-1">
                  Percentage of field that cashes
                </div>
              </div>

              <div>
                <Label htmlFor="update_notes">Notes (Optional)</Label>
                <Textarea id="update_notes" value={updateData.notes} onChange={e => setUpdateData({
                ...updateData,
                notes: e.target.value
              })} placeholder="Any additional notes..." />
              </div>

              <Button onClick={handleUpdateTournament} className="w-full">
                Update Tournament
              </Button>
            </div>
          </DialogContent>
      </Dialog>

      {/* Quick Update Dialog */}
      <Dialog open={showQuickUpdateDialog} onOpenChange={setShowQuickUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Update Tournament</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quick_total_entries">Total Entries</Label>
              <Input
                id="quick_total_entries"
                type="number"
                value={quickUpdateData.total_entries}
                onChange={e => setQuickUpdateData({
                  ...quickUpdateData,
                  total_entries: e.target.value
                })}
                placeholder={activeTournament?.total_players?.toString() || ""}
              />
            </div>

            <div>
              <Label htmlFor="quick_players_left">Players Left</Label>
              <Input
                id="quick_players_left"
                type="number"
                value={quickUpdateData.players_left}
                onChange={e => setQuickUpdateData({
                  ...quickUpdateData,
                  players_left: e.target.value
                })}
                placeholder={activeTournament?.players_left?.toString() || ""}
              />
            </div>

            <div>
              <Label htmlFor="quick_percent_paid">% Field Paid</Label>
              <Input
                id="quick_percent_paid"
                type="number"
                step="0.1"
                value={quickUpdateData.percent_paid}
                onChange={e => setQuickUpdateData({
                  ...quickUpdateData,
                  percent_paid: e.target.value
                })}
                placeholder={activeTournament?.percent_paid?.toString() || "15"}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowQuickUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickUpdate}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        {/* End Tournament Dialog */}
        <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>End Tournament</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="final_position">Final Position (Optional)</Label>
                  <Input id="final_position" type="number" value={endData.final_position} onChange={e => setEndData({
                  ...endData,
                  final_position: e.target.value
                })} placeholder="e.g. 3" />
                </div>
                <div>
                  <Label htmlFor="prize_won">Prize Won ($)</Label>
                  <Input id="prize_won" type="number" value={endData.prize_won} onChange={e => setEndData({
                  ...endData,
                  prize_won: e.target.value
                })} placeholder="0" />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                This will end the tournament and save the results to your bankroll.
              </div>

              <Button onClick={handleEndTournament} variant="destructive" className="w-full">
                End Tournament
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default LiveTournament;