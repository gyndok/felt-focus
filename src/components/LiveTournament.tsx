import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Play, Pause, Square, Trophy, Users, Clock, TrendingUp, DollarSign, Target, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';
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

const LiveTournament = () => {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    addSession
  } = usePokerSessions();
  const {
    activeTournament,
    createTournament,
    updateTournament,
    addTournamentUpdate,
    endTournament,
    getTournamentUpdates,
    pauseTournament,
    resumeTournament
  } = useTournaments();
  
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showQuickUpdateDialog, setShowQuickUpdateDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [tournamentUpdates, setTournamentUpdates] = useState<any[]>([]);
  const [chartViewMode, setChartViewMode] = useState<'chips' | 'bb'>('chips');
  const [newTournament, setNewTournament] = useState({
    name: '',
    buy_in: '',
    house_rake: '',
    starting_chips: '30000',
    guarantee: '',
    total_players: '',
    small_blind: '100',
    big_blind: '200',
    game_type: 'NLH',
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
      await createTournament({
        name: newTournament.name,
        buy_in: parseFloat(newTournament.buy_in),
        house_rake: parseFloat(newTournament.house_rake) || 0,
        starting_chips: startingChips,
        guarantee: newTournament.guarantee ? parseFloat(newTournament.guarantee) : null,
        total_players: newTournament.total_players ? parseInt(newTournament.total_players) : null,
        small_blind: parseFloat(newTournament.small_blind),
        big_blind: bigBlind,
        players_left: newTournament.total_players ? parseInt(newTournament.total_players) : null,
        current_chips: startingChips,
        bb_stack: startingChips / bigBlind,
        game_type: newTournament.game_type,
        percent_paid: parseFloat(newTournament.percent_paid) || 15
      });
      setNewTournament({
        name: '',
        buy_in: '',
        house_rake: '',
        starting_chips: '30000',
        guarantee: '',
        total_players: '',
        small_blind: '100',
        big_blind: '200',
        game_type: 'NLH',
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
        location: activeTournament.name,
        buy_in: activeTournament.buy_in,
        cash_out: prizeWon,
        duration: duration,
        notes: finalPosition ? `Finished ${finalPosition}` : 'Eliminated'
      });
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
    if (activeTournament) {
      getTournamentUpdates(activeTournament.id).then(updates => {
        setTournamentUpdates(updates || []);
      }).catch(console.error);
    }
  }, [activeTournament, getTournamentUpdates]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!activeTournament) return [];
    
    // Get the starting big blind from the first tournament update, or use a default
    let startingBigBlind = activeTournament.small_blind * 2; // Default calculation
    
    // If we have tournament updates, find the level 1 big blind
    if (tournamentUpdates && tournamentUpdates.length > 0) {
      const level1Update = tournamentUpdates.find(update => update.level === 1);
      if (level1Update) {
        startingBigBlind = Number(level1Update.big_blind);
      }
    }
    
    const data = [{
      level: 1,
      chips: Number(activeTournament.starting_chips),
      bb: Number(activeTournament.starting_chips) / startingBigBlind
    }];
    
    if (tournamentUpdates && tournamentUpdates.length > 0) {
      // Sort updates by level to ensure proper line drawing
      const sortedUpdates = [...tournamentUpdates].sort((a, b) => a.level - b.level);
      
      sortedUpdates.forEach((update) => {
        const chips = Number(update.current_chips);
        const bigBlind = Number(update.big_blind);
        // Calculate BB stack using the big blind from that specific level
        const bbStack = chips / bigBlind;
        
        // Only add valid data points and skip level 1 if it's already in the data
        if (!isNaN(chips) && !isNaN(bigBlind) && !isNaN(bbStack) && update.level > 1) {
          data.push({
            level: Number(update.level),
            chips: chips,
            bb: bbStack
          });
        }
      });
    }
    
    return data;
  }, [activeTournament, tournamentUpdates]);

  // Debug chart data
  console.log('Chart data:', chartData, 'View mode:', chartViewMode);
  if (!activeTournament) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
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
            <DialogContent className="max-w-md">
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
                        <SelectItem value="NLH">No Limit Hold'em</SelectItem>
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
                
                <div className="grid grid-cols-2 gap-3">
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
      {/* Header */}
      <div className="gradient-casino text-white p-6 sticky top-0 z-10">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4">
            <h1 className="text-xl font-bold mb-1">{activeTournament.name}</h1>
            <div className="text-2xl font-bold">
              {activeTournament.current_chips.toLocaleString()} chips
            </div>
            <div className="text-sm opacity-90">
              {activeTournament.bb_stack?.toFixed(1)} Big Blinds
            </div>
            {activeTournament.is_paused && (
              <Badge className="mt-2 bg-orange-500">
                Tournament Paused
              </Badge>
            )}
            {!activeTournament.is_paused && (
              <Badge className={`mt-2 ${stackHealth === 'healthy' ? 'bg-green-500' : stackHealth === 'caution' ? 'bg-yellow-500' : stackHealth === 'danger' ? 'bg-orange-500' : 'bg-red-500'}`}>
                {stackHealth === 'healthy' ? 'Healthy Stack' : stackHealth === 'caution' ? 'Caution' : stackHealth === 'danger' ? 'Danger' : 'Critical'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20 space-y-6">
        {/* Tournament Economics */}
        {economics && <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Tournament Economics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Buy-in</div>
                  <div className="font-bold">
                    ${activeTournament.buy_in.toLocaleString()} ({economics.rakePercentage.toFixed(1)}% rake)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${activeTournament.house_rake} rake, ${(activeTournament.buy_in - activeTournament.house_rake).toLocaleString()} to prizes
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Prize Pool</div>
                  <div className="font-bold text-green-600">
                    ${economics.prizePool.toLocaleString()}
                  </div>
                  {economics.overlay > 0 && <div className="text-xs text-orange-500">
                      +${economics.overlay.toLocaleString()} overlay
                    </div>}
                  <div className="text-xs text-muted-foreground">
                    ${(economics.prizePool / (activeTournament.total_players || 1)).toLocaleString()}/entry
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Collected</div>
                  <div className="font-bold">${economics.totalCollected.toLocaleString()}</div>
                </div>
                 <div>
                   <div className="text-sm text-muted-foreground">House Rake</div>
                   <div className="font-bold text-red-600">
                     ${((activeTournament.total_players || 0) * activeTournament.house_rake).toLocaleString()}
                   </div>
                   <div className="text-xs text-muted-foreground">
                     ${activeTournament.house_rake}/entry
                   </div>
                 </div>
              </div>

              {activeTournament.guarantee && <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Guarantee</div>
                      <div className="font-bold text-orange-600">
                        ${activeTournament.guarantee.toLocaleString()} {economics.overlay > 0 ? '(overlay)' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {economics.overlay > 0 ? `Overlay: +$${economics.overlay.toLocaleString()} added to prize pool` : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Players Needed</div>
                      <div className="font-bold text-blue-600">
                        {economics.playersNeededForGuarantee}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To reach guarantee
                      </div>
                     </div>
                   </div>
                 </>}

              {economics.playersInMoney > 0 && <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">In the Money</div>
                      <div className="font-bold text-green-600">
                        {economics.playersInMoney} players
                      </div>
                       <div className="text-xs text-muted-foreground">
                         {activeTournament.percent_paid || 15}% of field cashes
                       </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Stack at Bubble</div>
                      <div className="font-bold text-purple-600">
                        {Math.floor(economics.avgStackAtBubble).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        chips
                      </div>
                    </div>
                  </div>
                </>}
            </CardContent>
          </Card>}

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">Level {activeTournament.level}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {activeTournament.players_left || activeTournament.total_players}/{activeTournament.total_players}
              </div>
              <div className="text-sm text-muted-foreground">Players Left/Entered</div>
              
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
                  <div className="mt-3 space-y-2">
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
                      💰 Top {playersPaid} players paid ({percentPaid}%) • Min cash: ~${Math.round(economics?.prizePool * 0.4 / playersPaid || 0)}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {activeTournament.small_blind}/{activeTournament.big_blind}
              </div>
              <div className="text-sm text-muted-foreground">Current Blinds</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                 {currentAvgStack ? (currentAvgStack / activeTournament.big_blind).toFixed(0) : 'N/A'} BB
               </div>
               <div className="text-sm text-muted-foreground">Avg Stack</div>
               <div className="text-xs text-muted-foreground">
                 {currentAvgStack ? `${Math.floor(currentAvgStack).toLocaleString()} chips` : ''}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Stack Health Guide */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Stack Health Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium">20+ BB - Healthy</div>
                <div className="text-sm text-muted-foreground">Play your normal ranges</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <div className="font-medium">10-20 BB - Caution</div>
                <div className="text-sm text-muted-foreground">Tighten up, look for spots</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <div className="font-medium">5-10 BB - Danger</div>
                <div className="text-sm text-muted-foreground">Push/fold territory</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <div className="font-medium">&lt;5 BB - Critical</div>
                <div className="text-sm text-muted-foreground">Shove or fold only</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stack Progression Chart */}
        {chartData.length > 0 && <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Stack Progression
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setChartViewMode(chartViewMode === 'chips' ? 'bb' : 'chips')} className="flex items-center gap-2">
                  {chartViewMode === 'chips' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  {chartViewMode === 'chips' ? 'Chips' : 'Big Blinds'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                      tickFormatter={value => chartViewMode === 'chips' ? `${(value / 1000).toFixed(0)}k` : `${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      labelFormatter={value => `Level ${value}`} 
                      formatter={(value: number) => [
                        chartViewMode === 'chips' ? `${value.toLocaleString()} chips` : `${value.toFixed(1)} BB`, 
                        chartViewMode === 'chips' ? 'Stack' : 'Big Blinds'
                      ]} 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={chartViewMode === 'chips' ? 'chips' : 'bb'} 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{
                        fill: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        r: 6
                      }}
                      activeDot={{
                        r: 5,
                        stroke: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        fill: 'hsl(var(--background))'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Tournament Level</span>
                <span>{chartViewMode === 'chips' ? 'Stack in Chips' : 'Stack in Big Blinds'}</span>
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