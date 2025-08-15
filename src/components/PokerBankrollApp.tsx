import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, TrendingUp, Clock, DollarSign, Filter, Calendar, MapPin, Eye, EyeOff, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Session {
  id: number;
  date: string;
  type: string;
  gameType: string;
  stakes: string;
  location: string;
  buyIn: number;
  cashOut: number;
  duration: number;
  notes: string;
}

const PokerBankrollApp = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showBankroll, setShowBankroll] = useState(true);
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  
  // Sample data - in a real app this would be persistent
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      date: '2025-08-14',
      type: 'cash',
      gameType: 'NLHE',
      stakes: '1/2',
      location: 'Aria Casino',
      buyIn: 300,
      cashOut: 485,
      duration: 4.5,
      notes: 'Good session, ran well'
    },
    {
      id: 2,
      date: '2025-08-13',
      type: 'mtt',
      gameType: 'NLHE',
      stakes: '150',
      location: 'Bellagio',
      buyIn: 150,
      cashOut: 0,
      duration: 2.5,
      notes: 'Busted with AK vs QQ'
    },
    {
      id: 3,
      date: '2025-08-12',
      type: 'cash',
      gameType: 'PLO',
      stakes: '2/5',
      location: 'Wynn',
      buyIn: 800,
      cashOut: 1240,
      duration: 6.0,
      notes: 'Great PLO session'
    },
    {
      id: 4,
      date: '2025-08-11',
      type: 'cash',
      gameType: 'NLHE',
      stakes: '1/2',
      location: 'Aria Casino',
      buyIn: 300,
      cashOut: 250,
      duration: 3.0,
      notes: 'Tough table'
    },
    {
      id: 5,
      date: '2025-08-10',
      type: 'mtt',
      gameType: 'NLHE',
      stakes: '200',
      location: 'WSOP',
      buyIn: 200,
      cashOut: 680,
      duration: 8.5,
      notes: 'Final table finish!'
    }
  ]);

  const [filters, setFilters] = useState({
    type: 'all',
    gameType: 'all',
    location: 'all',
    dateRange: 30
  });

  const [newSession, setNewSession] = useState({
    type: 'cash',
    gameType: 'NLHE',
    stakes: '',
    location: '',
    buyIn: '',
    cashOut: '',
    duration: '',
    notes: ''
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        setCurrentSessionTime(Math.floor((Date.now() - timerStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerStartTime]);

  const startTimer = () => {
    setTimerStartTime(Date.now());
    setIsTimerRunning(true);
    setCurrentSessionTime(0);
  };

  const stopTimer = () => {
    if (timerStartTime) {
      const totalSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
      const hours = (totalSeconds / 3600).toFixed(1);
      setNewSession(prev => ({ ...prev, duration: hours }));
      setShowAddSession(true);
    }
    setIsTimerRunning(false);
    setTimerStartTime(null);
    setCurrentSessionTime(0);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerStartTime(null);
    setCurrentSessionTime(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const daysDiff = (new Date().getTime() - new Date(session.date).getTime()) / (1000 * 60 * 60 * 24);
      
      return (
        (filters.type === 'all' || session.type === filters.type) &&
        (filters.gameType === 'all' || session.gameType === filters.gameType) &&
        (filters.location === 'all' || session.location === filters.location) &&
        daysDiff <= filters.dateRange
      );
    });
  }, [sessions, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProfit = filteredSessions.reduce((sum, session) => sum + (session.cashOut - session.buyIn), 0);
    const totalHours = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalBuyIns = filteredSessions.reduce((sum, session) => sum + session.buyIn, 0);
    const winRate = filteredSessions.filter(s => s.cashOut > s.buyIn).length / filteredSessions.length * 100;
    
    return {
      totalProfit,
      hourlyRate: totalHours > 0 ? totalProfit / totalHours : 0,
      totalSessions: filteredSessions.length,
      winRate: isNaN(winRate) ? 0 : winRate,
      totalBankroll: 5000 + totalProfit
    };
  }, [filteredSessions]);

  // Chart data
  const chartData = useMemo(() => {
    let runningTotal = 5000;
    return filteredSessions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(session => {
        runningTotal += (session.cashOut - session.buyIn);
        return {
          date: session.date,
          bankroll: runningTotal,
          profit: session.cashOut - session.buyIn
        };
      });
  }, [filteredSessions]);

  const addSession = () => {
    if (!newSession.stakes || !newSession.location || !newSession.buyIn || !newSession.cashOut) {
      alert('Please fill in all required fields');
      return;
    }

    const session: Session = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...newSession,
      buyIn: parseFloat(newSession.buyIn),
      cashOut: parseFloat(newSession.cashOut),
      duration: parseFloat(newSession.duration) || 0
    };

    setSessions([session, ...sessions]);
    setNewSession({
      type: 'cash',
      gameType: 'NLHE',
      stakes: '',
      location: '',
      buyIn: '',
      cashOut: '',
      duration: '',
      notes: ''
    });
    setShowAddSession(false);
  };

  const getUniqueValues = (key: keyof Session): string[] => {
    return [...new Set(sessions.map(session => String(session[key])))];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-casino text-white p-6 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Poker Bankroll</h1>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <Filter size={18} />
              </Button>
              <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-profit hover:bg-profit/90">
                    <Plus size={18} />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>

          {/* Bankroll Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm opacity-90">Total Bankroll</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBankroll(!showBankroll)}
                className="p-1 h-auto"
              >
                {showBankroll ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>
            </div>
            <div className={`text-4xl font-bold mb-2 ${stats.totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {showBankroll ? `$${stats.totalBankroll.toLocaleString()}` : '••••••'}
            </div>
            <div className={`text-sm ${stats.totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {showBankroll ? `${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toLocaleString()} Total P/L` : '••••••'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Timer Section */}
        <Card className="mb-6 glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl font-mono font-bold">
                  {formatTime(currentSessionTime)}
                </div>
                {isTimerRunning && (
                  <Badge variant="default" className="animate-pulse">
                    Session Active
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <Button onClick={startTimer} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                ) : (
                  <>
                    <Button onClick={resetTimer} variant="outline" size="sm">
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button onClick={stopTimer} size="sm" className="bg-red-600 hover:bg-red-700">
                      <Pause className="h-4 w-4 mr-1" />
                      End Session
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6 glass-card">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Game Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cash">Cash Games</SelectItem>
                    <SelectItem value="mtt">Tournaments</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.gameType} onValueChange={(value) => setFilters({...filters, gameType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    {getUniqueValues('gameType').map(game => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {getUniqueValues('location').map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.dateRange.toString()} onValueChange={(value) => setFilters({...filters, dateRange: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="999999">All time</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-primary mb-2">
                <TrendingUp size={20} />
              </div>
              <div className="text-2xl font-bold">${stats.hourlyRate.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Hourly Rate</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-profit mb-2">
                <DollarSign size={20} />
              </div>
              <div className="text-2xl font-bold">{stats.winRate.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-6 glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Bankroll Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                  />
                  <YAxis tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    formatter={(value) => [`$${value?.toLocaleString()}`, 'Bankroll']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bankroll" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Sessions</h3>
            <Badge variant="secondary">{filteredSessions.length}</Badge>
          </div>
          
          {filteredSessions.map(session => {
            const profit = session.cashOut - session.buyIn;
            const hourlyRate = session.duration > 0 ? profit / session.duration : 0;
            
            return (
              <Card key={session.id} className={`glass-card border-l-4 ${profit >= 0 ? 'border-l-profit glow-profit' : 'border-l-loss glow-loss'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {session.type === 'cash' ? `${session.gameType} ${session.stakes}` : `${session.gameType} $${session.stakes}`}
                        <Badge variant="outline" className="text-xs">
                          {session.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {session.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {profit >= 0 ? '+' : ''}${profit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${hourlyRate.toFixed(0)}/hr
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {session.duration}h
                    </span>
                  </div>
                  
                  {session.notes && (
                    <div className="text-sm text-muted-foreground mt-3 italic">
                      "{session.notes}"
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Session Dialog */}
        <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Add Session</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={newSession.type === 'cash' ? 'default' : 'outline'}
                  onClick={() => setNewSession({...newSession, type: 'cash'})}
                  className="h-12"
                >
                  Cash Game
                </Button>
                <Button
                  variant={newSession.type === 'mtt' ? 'default' : 'outline'}
                  onClick={() => setNewSession({...newSession, type: 'mtt'})}
                  className="h-12"
                >
                  Tournament
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Game Type</Label>
                  <Select value={newSession.gameType} onValueChange={(value) => setNewSession({...newSession, gameType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NLHE">NLHE</SelectItem>
                      <SelectItem value="PLO">PLO</SelectItem>
                      <SelectItem value="Mix">Mixed Games</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{newSession.type === 'cash' ? 'Stakes' : 'Buy-in'}</Label>
                  <Input
                    placeholder={newSession.type === 'cash' ? "1/2" : "$150"}
                    value={newSession.stakes}
                    onChange={(e) => setNewSession({...newSession, stakes: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Casino name"
                  value={newSession.location}
                  onChange={(e) => setNewSession({...newSession, location: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Buy-in ($)</Label>
                  <Input
                    type="number"
                    placeholder="300"
                    value={newSession.buyIn}
                    onChange={(e) => setNewSession({...newSession, buyIn: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cash-out ($)</Label>
                  <Input
                    type="number"
                    placeholder="485"
                    value={newSession.cashOut}
                    onChange={(e) => setNewSession({...newSession, cashOut: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (hours)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="4.5"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Session notes..."
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button onClick={addSession} className="w-full">
                Add Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PokerBankrollApp;