import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePokerSessions } from '@/hooks/usePokerSessions';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CSVRow {
  date: string;
  description: string;
  buy_in: string;
  cash_out: string;
  game: string;
  type: string;
  location: string;
  hours: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

interface MappedSession {
  date: string;
  game_type: string;
  stakes: string;
  type: 'cash' | 'mtt';
  location: string;
  buy_in: number;
  cash_out: number;
  duration: number;
  notes?: string;
}

interface CSVImportProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CSVImport: React.FC<CSVImportProps> = ({ isOpen, onOpenChange }) => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [mappedData, setMappedData] = useState<MappedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'importing' | 'success' | 'error'>('idle');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const { addSession } = usePokerSessions();
  const { toast } = useToast();

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        // Map your column names to our expected format
        const fieldMap: { [key: string]: string } = {
          'date': 'date',
          'description': 'description',
          'buy in': 'buy_in',
          'buyin': 'buy_in',
          'cash out': 'cash_out',
          'cashout': 'cash_out',
          'game': 'game',
          'cash vs tournament': 'type',
          'type': 'type',
          'location': 'location',
          'locations': 'location',
          'hours': 'hours',
          'start time': 'start_time',
          'starttime': 'start_time',
          'end time': 'end_time',
          'endtime': 'end_time',
          'notes': 'notes'
        };
        
        const mappedField = fieldMap[header] || header;
        row[mappedField] = values[index] || '';
      });
      
      return row as CSVRow;
    });
  };

  const mapDataToSessions = (csvRows: CSVRow[]): MappedSession[] => {
    const errors: string[] = [];
    
    const mapped = csvRows.map((row, index) => {
      try {
        // Parse date
        let date = row.date;
        if (date.includes('/')) {
          const [month, day, year] = date.split('/');
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Extract game type and stakes from description
        let game_type = row.game || 'NLHE';
        let stakes = '';
        
        // Try to extract stakes from description (e.g., "$600", "100k", "1/3")
        const stakeMatch = row.description.match(/\$?(\d+[kmKM]?|\d+\/\d+)/);
        if (stakeMatch) {
          stakes = stakeMatch[1];
        } else {
          stakes = row.description.split(' ')[0] || '';
        }

        // Map type
        let type: 'cash' | 'mtt' = 'cash';
        if (row.type?.toLowerCase().includes('mtt') || row.type?.toLowerCase().includes('tournament') || 
            row.description?.toLowerCase().includes('gtd') || row.description?.toLowerCase().includes('tournament')) {
          type = 'mtt';
        }

        // Parse financial values
        const buy_in = parseFloat(row.buy_in.replace(/[$,]/g, '')) || 0;
        const cash_out = parseFloat(row.cash_out.replace(/[$,]/g, '')) || 0;
        
        // Parse duration
        let duration = parseFloat(row.hours) || 0;
        
        // If hours is 0 or missing, try to calculate from start/end times
        if (duration === 0 && row.start_time && row.end_time) {
          // This is a simplified calculation - might need refinement based on your time format
          const start = new Date(`1970/01/01 ${row.start_time}`);
          const end = new Date(`1970/01/01 ${row.end_time}`);
          if (end < start) {
            // Next day
            end.setDate(end.getDate() + 1);
          }
          duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }

        return {
          date,
          game_type,
          stakes,
          type,
          location: row.location || '',
          buy_in,
          cash_out,
          duration,
          notes: row.notes || row.description || null
        };
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
        return null;
      }
    }).filter(Boolean) as MappedSession[];

    setImportErrors(errors);
    return mapped;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        setCsvData(parsed);
        
        const mapped = mapDataToSessions(parsed);
        setMappedData(mapped);
        setImportStatus('preview');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setIsLoading(true);
    setImportStatus('importing');
    
    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const session of mappedData) {
        try {
          await addSession(session);
          successCount++;
        } catch (error) {
          errors.push(`Failed to import session on ${session.date}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (successCount > 0) {
        setImportStatus('success');
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} sessions${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        });
      } else {
        setImportStatus('error');
        setImportErrors(errors);
      }
    } catch (error) {
      setImportStatus('error');
      toast({
        title: "Import Failed",
        description: "Failed to import sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetImport = () => {
    setCsvData([]);
    setMappedData([]);
    setImportStatus('idle');
    setImportErrors([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet size={20} />
            Import Sessions from CSV
          </DialogTitle>
        </DialogHeader>

        {importStatus === 'idle' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-lg font-semibold mb-2">Upload your poker sessions CSV</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Expected columns: date, description, buy_in, cash_out, game, type, location, hours, start_time, end_time, notes
                </div>
                <Button>Choose CSV File</Button>
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {importStatus === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Preview ({mappedData.length} sessions)</h3>
                {importErrors.length > 0 && (
                  <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle size={16} />
                    {importErrors.length} rows had issues
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetImport}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={mappedData.length === 0}>
                  Import {mappedData.length} Sessions
                </Button>
              </div>
            </div>

            {importErrors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-destructive">Import Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {importErrors.slice(0, 5).map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                    {importErrors.length > 5 && (
                      <div>... and {importErrors.length - 5} more</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Stakes</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Buy In</TableHead>
                        <TableHead>Cash Out</TableHead>
                        <TableHead>P/L</TableHead>
                        <TableHead>Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappedData.slice(0, 10).map((session, index) => {
                        const profit = session.cash_out - session.buy_in;
                        return (
                          <TableRow key={index}>
                            <TableCell>{session.date}</TableCell>
                            <TableCell>{session.game_type}</TableCell>
                            <TableCell>{session.stakes}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{session.type.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell>{session.location}</TableCell>
                            <TableCell>${session.buy_in}</TableCell>
                            <TableCell>${session.cash_out}</TableCell>
                            <TableCell className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {profit >= 0 ? '+' : ''}${profit}
                            </TableCell>
                            <TableCell>{session.duration.toFixed(1)}h</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {mappedData.length > 10 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      ... and {mappedData.length - 10} more sessions
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {importStatus === 'importing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Importing sessions...</p>
          </div>
        )}

        {importStatus === 'success' && (
          <div className="text-center py-8">
            <Check className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
            <p className="text-muted-foreground">Your sessions have been successfully imported.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        )}

        {importStatus === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Import Failed</h3>
            <p className="text-muted-foreground mb-4">There were errors during the import process.</p>
            {importErrors.length > 0 && (
              <Card className="mt-4 text-left">
                <CardContent className="p-4">
                  <div className="space-y-1 text-sm">
                    {importErrors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outline" onClick={resetImport}>
                Try Again
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};