import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, TrendingUp, Clock, DollarSign, Filter, Calendar as CalendarIcon, MapPin, Eye, EyeOff, Play, Pause, Square, LogOut, Edit, Trash2, Settings, Paperclip, Bug, Share, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePokerSessions, type PokerSession } from '@/hooks/usePokerSessions';
import { useTournaments } from '@/hooks/useTournaments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { CSVImport } from './CSVImport';
import { PhotoCapture } from './PhotoCapture';
import LiveTournament from './LiveTournament';
import { FeedbackDialog } from './FeedbackDialog';
import { ShareDialog } from './ShareDialog';
import { FeedbackReview } from './FeedbackReview';
import { useFeedbackNotifications } from '@/hooks/useFeedbackNotifications';

const PokerBankrollApp = () => {
  const {
    user,
    signOut
  } = useAuth();
  const { theme, setTheme } = useTheme();
  const {
    sessions,
    loading,
    addSession,
    updateSession,
    deleteSession
  } = usePokerSessions();
  const {
    activeTournament
  } = useTournaments();
  const {
    toast
  } = useToast();
  const { unreadCount, isAdmin } = useFeedbackNotifications();
  const [showFilters, setShowFilters] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showBankroll, setShowBankroll] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PokerSession | null>(null);
  const [editSession, setEditSession] = useState<PokerSession | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tournament'>(activeTournament ? 'tournament' : 'dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedbackReviewOpen, setFeedbackReviewOpen] = useState(false);
  const [startingBankroll, setStartingBankroll] = useState(0);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Auto-switch to tournament tab when there's an active tournament
  useEffect(() => {
    if (activeTournament) {
      setActiveTab('tournament');
    }
  }, [activeTournament]);

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    game_type: 'all',
    location: 'all',
    dateRange: 999999, // Show all sessions by default
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });
  const [newSession, setNewSession] = useState({
    type: 'cash' as 'cash' | 'mtt',
    game_type: 'NLHE',
    stakes: '',
    location: '',
    buy_in: '',
    cash_out: '',
    duration: '',
    notes: '',
    receipt_image_url: null as string | null
  });

  // Edit session form data
  const [editSessionData, setEditSessionData] = useState({
    type: 'cash' as 'cash' | 'mtt',
    game_type: 'NLHE',
    stakes: '',
    location: '',
    buy_in: '',
    cash_out: '',
    duration: '',
    notes: '',
    receipt_image_url: null as string | null
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
      setNewSession(prev => ({
        ...prev,
        duration: hours
      }));
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
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const now = new Date();
      const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Check basic filters
      const typeMatch = filters.type === 'all' || session.type === filters.type;
      const gameMatch = filters.game_type === 'all' || session.game_type === filters.game_type;
      const locationMatch = filters.location === 'all' || session.location === filters.location;
      
      // Check date range - custom date range takes precedence over dateRange filter
      let dateMatch = true;
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        dateMatch = sessionDate >= startDate && sessionDate <= endDate;
      } else {
        dateMatch = daysDiff <= filters.dateRange;
      }
      
      return typeMatch && gameMatch && locationMatch && dateMatch;
    });
  }, [sessions, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProfit = filteredSessions.reduce((sum, session) => sum + (session.cash_out - session.buy_in), 0);
    const totalHours = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalBuyIn = filteredSessions.reduce((sum, session) => sum + session.buy_in, 0);
    const totalCashOut = filteredSessions.reduce((sum, session) => sum + session.cash_out, 0);
    const winRate = filteredSessions.filter(s => s.cash_out > s.buy_in).length / filteredSessions.length * 100;
    return {
      totalProfit,
      totalBuyIn,
      totalCashOut,
      hourlyRate: totalHours > 0 ? totalProfit / totalHours : 0,
      totalSessions: filteredSessions.length,
      winRate: isNaN(winRate) ? 0 : winRate,
      totalBankroll: startingBankroll + totalProfit
    };
  }, [filteredSessions, startingBankroll]);

  // Chart data
  const chartData = useMemo(() => {
    let runningTotal = startingBankroll;
    const sortedSessions = filteredSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedSessions.length === 0) return [];
    
    const firstDate = new Date(sortedSessions[0].date);
    
    return sortedSessions.map((session, index) => {
      runningTotal += session.cash_out - session.buy_in;
      const sessionDate = new Date(session.date);
      const monthsFromStart = Math.round((sessionDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      
      return {
        date: session.date,
        monthIndex: monthsFromStart,
        bankroll: runningTotal,
        profit: session.cash_out - session.buy_in
      };
    });
  }, [filteredSessions, startingBankroll]);
  const handleAddSession = async () => {
    if (!newSession.stakes || !newSession.location || !newSession.buy_in || !newSession.cash_out) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    try {
      await addSession({
        date: new Date().toISOString().split('T')[0],
        type: newSession.type,
        game_type: newSession.game_type,
        stakes: newSession.stakes,
        location: newSession.location,
        buy_in: parseFloat(newSession.buy_in),
        cash_out: parseFloat(newSession.cash_out),
        duration: parseFloat(newSession.duration) || 0,
        receipt_image_url: newSession.receipt_image_url
      });
      setNewSession({
        type: 'cash',
        game_type: 'NLHE',
        stakes: '',
        location: '',
        buy_in: '',
        cash_out: '',
        duration: '',
        notes: '',
        receipt_image_url: null
      });
      setShowAddSession(false);
      toast({
        title: "Success",
        description: "Session added successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add session. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle edit session
  const handleEditSession = async () => {
    if (!editSession || !editSessionData.stakes || !editSessionData.location || !editSessionData.buy_in || !editSessionData.cash_out) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateSession(editSession.id, {
        type: editSessionData.type,
        game_type: editSessionData.game_type,
        stakes: editSessionData.stakes,
        location: editSessionData.location,
        buy_in: parseFloat(editSessionData.buy_in),
        cash_out: parseFloat(editSessionData.cash_out),
        duration: parseFloat(editSessionData.duration) || 0,
        receipt_image_url: editSessionData.receipt_image_url
      });

      setEditSession(null);
      toast({
        title: "Success",
        description: "Session updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle delete session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSelectedSession(null);
      toast({
        title: "Success",
        description: "Session deleted successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (session: PokerSession) => {
    setEditSession(session);
    setEditSessionData({
      type: session.type as 'cash' | 'mtt',
      game_type: session.game_type,
      stakes: session.stakes,
      location: session.location,
      buy_in: session.buy_in.toString(),
      cash_out: session.cash_out.toString(),
      duration: session.duration.toString(),
      notes: session.notes || '',
      receipt_image_url: session.receipt_image_url || null
    });
  };

  const getUniqueValues = (key: keyof PokerSession) => {
    return [...new Set(sessions.map(session => String(session[key])))];
  };
  const handleLogout = async () => {
    await signOut();
  };

  // Export sessions to CSV
  const exportSessionsToCSV = (sessions: PokerSession[]) => {
    const csvHeaders = [
      'Date',
      'Type',
      'Game Type',
      'Stakes',
      'Location',
      'Buy-in ($)',
      'Cash-out ($)',
      'Profit/Loss ($)',
      'Duration (hours)',
      'Hourly Rate ($/hr)',
      'Notes'
    ];

    const csvData = sessions.map(session => {
      const profit = session.cash_out - session.buy_in;
      const hourlyRate = session.duration > 0 ? profit / session.duration : 0;
      
      return [
        session.date,
        session.type.toUpperCase(),
        session.game_type,
        session.stakes,
        session.location,
        session.buy_in,
        session.cash_out,
        profit,
        session.duration,
        hourlyRate.toFixed(2),
        session.notes || ''
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field}"` 
            : field
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `poker-sessions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Exported ${sessions.length} sessions to CSV`
    });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully!"
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowSettings(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your poker sessions...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-casino text-white p-6 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            {/* App Icon - Left 1/3 */}
            <div className="w-1/3 flex justify-center">
              <img 
                src="/lovable-uploads/cdc2af24-7343-4b17-83eb-e6944ab0ef53.png" 
                alt="Felt Focus" 
                className="h-20 w-20 rounded-2xl shadow-lg hover-scale"
              />
            </div>
            
            {/* Control Buttons - Right 2/3 */}
            <div className="w-2/3 flex flex-col gap-2">
              {/* First row */}
              <div className="flex justify-center gap-2">
                <ThemeToggle />
                <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)} className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm">
                  <Filter size={18} />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowCSVImport(true)} className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm" title="Import CSV">
                  📊
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowSettings(true)} className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm" title="Settings">
                  <Settings size={18} />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setFeedbackOpen(true)} className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm" title="Send Feedback">
                  <Bug size={18} />
                </Button>
              </div>
              
              {/* Second row */}
              <div className="flex justify-center gap-2">
                {isAdmin && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setFeedbackReviewOpen(true)} 
                    className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm relative" 
                    title="Review Feedback"
                  >
                    <MessageSquare size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)} className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm" title="Share App">
                  <Share size={18} />
                </Button>
                <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm">
                  <LogOut size={18} />
                </Button>
                <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-profit hover:bg-profit/90 shadow-lg hover-scale">
                      <Plus size={18} />
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/10 rounded-lg p-1 mb-6">
            <Button
              variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 ${activeTab === 'dashboard' ? 'bg-white text-primary' : 'text-white hover:bg-white/20'}`}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'tournament' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('tournament')}
              className={`flex-1 ${activeTab === 'tournament' ? 'bg-white text-primary' : 'text-white hover:bg-white/20'}`}
            >
              Live Tournament
            </Button>
          </div>

          {/* Bankroll Display - Only on Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm opacity-90">Total Bankroll</span>
                <Button variant="ghost" size="sm" onClick={() => setShowBankroll(!showBankroll)} className="p-1 h-auto">
                  {showBankroll ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
              </div>
              
              <div className={`text-sm ${stats.totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {showBankroll ? `${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toLocaleString()} Total P/L` : '••••••'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Live Tournament or Dashboard */}
      {activeTab === 'tournament' ? (
        <LiveTournament />
      ) : (
        <div className="max-w-md mx-auto px-4 pb-20">
          {/* Timer Section */}
          <Card className="mb-6 glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-xl font-mono font-bold">
                    {formatTime(currentSessionTime)}
                  </div>
                  {isTimerRunning && <Badge variant="default" className="animate-pulse">
                      Session Active
                    </Badge>}
                </div>
                <div className="flex gap-2">
                  {!isTimerRunning ? <Button onClick={startTimer} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button> : <>
                      <Button onClick={resetTimer} variant="outline" size="sm">
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button onClick={stopTimer} size="sm" className="bg-red-600 hover:bg-red-700">
                        <Pause className="h-4 w-4 mr-1" />
                        End Session
                      </Button>
                    </>}
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Filters */}
        {showFilters && <Card className="mb-6 glass-card">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select value={filters.type} onValueChange={value => setFilters({
              ...filters,
              type: value
            })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Game Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cash">Cash Games</SelectItem>
                    <SelectItem value="mtt">Tournaments</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.game_type} onValueChange={value => setFilters({
              ...filters,
              game_type: value
            })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    {getUniqueValues('game_type').map(game => <SelectItem key={game} value={game}>{game}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Select value={filters.location} onValueChange={value => setFilters({
            ...filters,
            location: value
          })}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {getUniqueValues('location').map(location => <SelectItem key={location} value={location}>{location}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filters.dateRange.toString()} onValueChange={value => setFilters({
            ...filters,
            dateRange: parseInt(value)
          })}>
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
          </Card>}

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

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-blue-500 mb-2">
                <DollarSign size={20} />
              </div>
              <div className="text-2xl font-bold">${stats.totalBuyIn.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Buy-In</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-green-500 mb-2">
                <DollarSign size={20} />
              </div>
              <div className="text-2xl font-bold">${stats.totalCashOut.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Cash-Out</div>
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
                  <XAxis dataKey="monthIndex" tick={{
                  fontSize: 12,
                  fill: 'hsl(var(--muted-foreground))'
                }} tickFormatter={monthIndex => `Month ${monthIndex + 1}`} />
                  <YAxis tick={{
                  fontSize: 12,
                  fill: 'hsl(var(--muted-foreground))'
                }} />
                  <Tooltip formatter={value => [`$${value?.toLocaleString()}`, 'Bankroll']} labelFormatter={date => new Date(date).toLocaleDateString()} contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} />
                  <Line type="monotone" dataKey="bankroll" stroke="hsl(var(--primary))" strokeWidth={3} dot={{
                  fill: 'hsl(var(--primary))',
                  strokeWidth: 2,
                  r: 4
                }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        <div className="space-y-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Sessions</h3>
              <Badge variant="secondary">{filteredSessions.length}</Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSessionsToCSV(filteredSessions)}
                className="h-8 flex-shrink-0"
              >
                Export CSV
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal text-sm h-8"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate && filters.endDate ? (
                      <>
                        {format(filters.startDate, "MMM dd")} - {format(filters.endDate, "MMM dd, y")}
                      </>
                    ) : (
                      <span>Pick date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="flex">
                    <div className="p-3">
                      <div className="text-sm font-medium mb-2">From</div>
                       <Calendar
                         mode="single"
                         selected={filters.startDate}
                         onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                         className="pointer-events-auto"
                       />
                     </div>
                     <div className="p-3 border-l">
                       <div className="text-sm font-medium mb-2">To</div>
                       <Calendar
                         mode="single"
                         selected={filters.endDate}
                         onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                         disabled={(date) => filters.startDate ? date < filters.startDate : false}
                         className="pointer-events-auto"
                       />
                     </div>
                   </div>
                   <div className="p-3 border-t">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setFilters(prev => ({ ...prev, startDate: undefined, endDate: undefined }))}
                       className="w-full"
                     >
                      Clear dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-4">
          {filteredSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(session => {
            const profit = session.cash_out - session.buy_in;
            const hourlyRate = session.duration > 0 ? profit / session.duration : 0;
            return <Card key={session.id} className={`glass-card border-l-4 hover:shadow-lg transition-shadow ${profit >= 0 ? 'border-l-profit glow-profit' : 'border-l-loss glow-loss'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedSession(session)}>
                      <div className="font-semibold flex items-center gap-2">
                        {session.type === 'cash' ? `${session.game_type} ${session.stakes}` : `${session.game_type} $${session.stakes}`}
                        <Badge variant="outline" className="text-xs">
                          {session.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {session.location}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {session.receipt_image_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(session.receipt_image_url, '_blank');
                          }}
                          className="h-8 w-8 p-0 hover:bg-muted"
                          title="View receipt"
                        >
                          <Paperclip size={14} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(session);
                        }}
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                       <CalendarIcon size={12} />
                       {session.date}
                     </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {session.duration.toFixed(1)}h
                    </span>
                  </div>
                  
                  {session.notes && <div className="text-sm text-muted-foreground mt-3 italic">
                      "{session.notes}"
                    </div>}
                </CardContent>
              </Card>;
          })}
          </div>
        </div>

        {/* Session Detail Dialog */}
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
            </DialogHeader>
            {selectedSession && <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="text-lg">{new Date(selectedSession.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="ml-2">
                      {selectedSession.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Game</Label>
                    <p className="text-lg">{selectedSession.game_type}</p>
                  </div>
                  <div>
                    
                    
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-lg">{selectedSession.location}</p>
                </div>

                {selectedSession.notes && <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm bg-muted p-3 rounded-md mt-1">{selectedSession.notes}</p>
                  </div>}

                {selectedSession.receipt_image_url && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Receipt Photo</Label>
                    <div className="mt-2 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={selectedSession.receipt_image_url} 
                        alt="Receipt" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Buy-in</Label>
                    <p className="text-2xl font-bold">${selectedSession.buy_in.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cash-out</Label>
                    <p className="text-2xl font-bold">${selectedSession.cash_out.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Profit/Loss</Label>
                    <p className={`text-2xl font-bold ${selectedSession.cash_out - selectedSession.buy_in >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {selectedSession.cash_out - selectedSession.buy_in >= 0 ? '+' : ''}${(selectedSession.cash_out - selectedSession.buy_in).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="text-2xl font-bold">{selectedSession.duration.toFixed(1)}h</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Hourly Rate</Label>
                  <p className="text-xl font-bold">
                    ${selectedSession.duration > 0 ? ((selectedSession.cash_out - selectedSession.buy_in) / selectedSession.duration).toFixed(0) : '0'}/hr
                  </p>
                </div>

              </div>}
          </DialogContent>
        </Dialog>

        {/* Add Session Dialog */}
        <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Add Session</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant={newSession.type === 'cash' ? 'default' : 'outline'} onClick={() => setNewSession({
                ...newSession,
                type: 'cash'
              })} className="h-12">
                  Cash Game
                </Button>
                <Button variant={newSession.type === 'mtt' ? 'default' : 'outline'} onClick={() => setNewSession({
                ...newSession,
                type: 'mtt'
              })} className="h-12">
                  Tournament
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Game Type</Label>
                  <Select value={newSession.game_type} onValueChange={value => setNewSession({
                  ...newSession,
                  game_type: value
                })}>
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
                  <Input placeholder={newSession.type === 'cash' ? "1/2" : "$150"} value={newSession.stakes} onChange={e => setNewSession({
                  ...newSession,
                  stakes: e.target.value
                })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Casino name" value={newSession.location} onChange={e => setNewSession({
                ...newSession,
                location: e.target.value
              })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Buy-in ($)</Label>
                  <Input type="number" placeholder="300" value={newSession.buy_in} onChange={e => setNewSession({
                  ...newSession,
                  buy_in: e.target.value
                })} />
                </div>
                <div className="space-y-2">
                  <Label>Cash-out ($)</Label>
                  <Input type="number" placeholder="485" value={newSession.cash_out} onChange={e => setNewSession({
                  ...newSession,
                  cash_out: e.target.value
                })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (hours)</Label>
                <Input type="number" step="0.5" placeholder="4.5" value={newSession.duration} onChange={e => setNewSession({
                ...newSession,
                duration: e.target.value
              })} />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea placeholder="Session notes..." value={newSession.notes} onChange={e => setNewSession({
                ...newSession,
                notes: e.target.value
              })} className="resize-none" rows={3} />
              </div>

              <PhotoCapture
                onPhotoCapture={(url) => setNewSession({...newSession, receipt_image_url: url})}
                currentPhoto={newSession.receipt_image_url}
              />

              <Button onClick={handleAddSession} className="w-full">
                Add Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Session Dialog */}
        <Dialog open={!!editSession} onOpenChange={() => setEditSession(null)}>
          <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Session</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={editSessionData.type === 'cash' ? 'default' : 'outline'} 
                  onClick={() => setEditSessionData({...editSessionData, type: 'cash'})} 
                  className="h-12"
                >
                  Cash Game
                </Button>
                <Button 
                  variant={editSessionData.type === 'mtt' ? 'default' : 'outline'} 
                  onClick={() => setEditSessionData({...editSessionData, type: 'mtt'})} 
                  className="h-12"
                >
                  Tournament
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Game Type</Label>
                  <Select 
                    value={editSessionData.game_type} 
                    onValueChange={value => setEditSessionData({...editSessionData, game_type: value})}
                  >
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
                  <Label>{editSessionData.type === 'cash' ? 'Stakes' : 'Buy-in'}</Label>
                  <Input 
                    placeholder={editSessionData.type === 'cash' ? "1/2" : "$150"} 
                    value={editSessionData.stakes} 
                    onChange={e => setEditSessionData({...editSessionData, stakes: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  placeholder="Casino name" 
                  value={editSessionData.location} 
                  onChange={e => setEditSessionData({...editSessionData, location: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Buy-in ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="300" 
                    value={editSessionData.buy_in} 
                    onChange={e => setEditSessionData({...editSessionData, buy_in: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cash-out ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="485" 
                    value={editSessionData.cash_out} 
                    onChange={e => setEditSessionData({...editSessionData, cash_out: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (hours)</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  placeholder="4.5" 
                  value={editSessionData.duration} 
                  onChange={e => setEditSessionData({...editSessionData, duration: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea 
                  placeholder="Session notes..." 
                  value={editSessionData.notes} 
                  onChange={e => setEditSessionData({...editSessionData, notes: e.target.value})} 
                  className="resize-none" 
                  rows={3} 
                />
              </div>

              <PhotoCapture
                onPhotoCapture={(url) => setEditSessionData({...editSessionData, receipt_image_url: url})}
                currentPhoto={editSessionData.receipt_image_url}
              />

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setEditSession(null)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleEditSession} className="flex-1">
                  Update Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <CSVImport isOpen={showCSVImport} onOpenChange={setShowCSVImport} />

        <FeedbackDialog
          open={feedbackOpen}
          onOpenChange={setFeedbackOpen}
        />

        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
        />

        <FeedbackReview
          open={feedbackReviewOpen}
          onOpenChange={setFeedbackReviewOpen}
        />

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Starting Bankroll Setting */}
              <div className="space-y-2">
                <Label>Starting Bankroll ($)</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={startingBankroll}
                  onChange={e => setStartingBankroll(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Set your initial bankroll amount before any sessions
                </p>
              </div>

              {/* Theme Preference Setting */}
              <div className="space-y-2">
                <Label>Theme Preference</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred theme or follow system settings
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(false)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePasswordChange} 
                  className="flex-1"
                  disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      )}
    </div>
};
export default PokerBankrollApp;