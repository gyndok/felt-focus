import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PokerSession } from '@/hooks/usePokerSessions';
import { downloadPokerTaxStatement } from '@/utils/pdfGenerator';

interface TaxStatementDialogProps {
  sessions: PokerSession[];
  className?: string;
}

export const TaxStatementDialog = ({ sessions, className }: TaxStatementDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [playerName, setPlayerName] = useState('Geffrey H. Klein, MD');
  const [playerSSN, setPlayerSSN] = useState('XXX-XX-1234');
  const [playerAddress, setPlayerAddress] = useState('');
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const handleGeneratePDF = () => {
    // Filter sessions for the selected tax year with robust date handling
    const yearSessions = sessions.filter(session => {
      // Handle date string parsing more reliably
      const sessionDate = session.date;
      let sessionYear: number;
      
      if (typeof sessionDate === 'string') {
        // If it's a date string like "2024-12-01", extract year directly
        if (sessionDate.includes('-')) {
          sessionYear = parseInt(sessionDate.split('-')[0]);
        } else {
          sessionYear = new Date(sessionDate).getFullYear();
        }
      } else {
        sessionYear = new Date(sessionDate).getFullYear();
      }
      
      // Debug logging
      console.log('Session date:', session.date, 'Parsed year:', sessionYear, 'Target year:', taxYear);
      
      return sessionYear === taxYear;
    });

    console.log(`Filtered ${yearSessions.length} sessions for year ${taxYear}`);
    console.log('Session dates in filtered set:', yearSessions.map(s => s.date));

    if (yearSessions.length === 0) {
      toast({
        title: "No Sessions Found",
        description: `No poker sessions found for ${taxYear}. Please select a different year.`,
        variant: "destructive"
      });
      return;
    }

    // Calculate totals for the filtered sessions
    const totalWinnings = yearSessions
      .filter(s => (s.cash_out - s.buy_in) > 0)
      .reduce((sum, s) => sum + s.cash_out, 0);
    
    const totalBuyIns = yearSessions.reduce((sum, s) => sum + s.buy_in, 0);
    const totalCashOuts = yearSessions.reduce((sum, s) => sum + s.cash_out, 0);
    const netProfit = totalCashOuts - totalBuyIns;

    // Validate required fields
    if (!playerName.trim()) {
      toast({
        title: "Error",
        description: "Player name is required",
        variant: "destructive"
      });
      return;
    }

    downloadPokerTaxStatement({
      playerName: playerName.trim(),
      playerSSN: playerSSN.trim(),
      playerAddress: playerAddress.trim(),
      sessions: yearSessions,
      totalWinnings,
      totalBuyIns,
      netProfit,
      taxYear
    });

    toast({
      title: "Success",
      description: `Tax statement PDF for ${taxYear} generated with ${yearSessions.length} sessions`
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
        >
          <FileText className="mr-2 h-4 w-4" />
          Tax PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Tax Statement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tax-year">Tax Year</Label>
            <Input
              id="tax-year"
              type="number"
              value={taxYear}
              onChange={(e) => setTaxYear(parseInt(e.target.value) || new Date().getFullYear())}
              min="2020"
              max={new Date().getFullYear()}
              placeholder="2024"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-name">Player Name</Label>
            <Input
              id="player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-ssn">SSN (Last 4 digits)</Label>
            <Input
              id="player-ssn"
              value={playerSSN}
              onChange={(e) => setPlayerSSN(e.target.value)}
              placeholder="XXX-XX-1234"
              maxLength={11}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-address">Address</Label>
            <textarea
              id="player-address"
              value={playerAddress}
              onChange={(e) => setPlayerAddress(e.target.value)}
              placeholder="Street Address&#10;City, State ZIP"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <p className="font-medium">Preview:</p>
            <p>{sessions.filter(s => {
              const sessionDate = s.date;
              let sessionYear: number;
              if (typeof sessionDate === 'string' && sessionDate.includes('-')) {
                sessionYear = parseInt(sessionDate.split('-')[0]);
              } else {
                sessionYear = new Date(sessionDate).getFullYear();
              }
              return sessionYear === taxYear;
            }).length} sessions found for {taxYear}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleGeneratePDF} className="flex-1">
              Generate PDF
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};