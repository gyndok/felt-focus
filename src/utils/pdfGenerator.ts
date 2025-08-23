import { jsPDF } from 'jspdf';
import type { PokerSession } from '@/hooks/usePokerSessions';
import { format } from 'date-fns';

interface PDFGenerationOptions {
  playerName: string;
  playerSSN: string;
  playerAddress: string;
  sessions: PokerSession[];
  totalWinnings: number;
  totalBuyIns: number;
  netProfit: number;
  taxYear: number;
}

export const generatePokerTaxStatement = (options: PDFGenerationOptions) => {
  const {
    playerName,
    playerSSN,
    playerAddress,
    sessions,
    totalWinnings,
    totalBuyIns,
    netProfit,
    taxYear
  } = options;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Poker Player Win/Loss Statement – Tax Year ${taxYear}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;

  // Player Information Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Player Information', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${playerName}`, margin, yPosition);
  
  yPosition += 8;
  pdf.text(`SSN: ${playerSSN}`, margin, yPosition);
  
  yPosition += 8;
  const addressLines = playerAddress.split('\n').filter(line => line.trim());
  if (addressLines.length > 0) {
    pdf.text(`Address: ${addressLines[0]}`, margin, yPosition);
    yPosition += 8;
    if (addressLines[1]) {
      pdf.text(`         ${addressLines[1]}`, margin, yPosition);
      yPosition += 8;
    }
  } else {
    pdf.text('Address: ________________________________', margin, yPosition);
    yPosition += 8;
    pdf.text('         ________________________________', margin, yPosition);
    yPosition += 8;
  }
  
  yPosition += 20;

  // Summary Totals Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary Totals', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Winnings: $${totalWinnings.toLocaleString()}`, margin, yPosition);
  
  yPosition += 8;
  pdf.text(`Total Buy-Ins / Losses: $${totalBuyIns.toLocaleString()}`, margin, yPosition);
  
  yPosition += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Net Profit (Loss): ${netProfit >= 0 ? '+' : ''}$${netProfit.toLocaleString()}`, margin, yPosition);
  
  yPosition += 20;

  // Itemized Log Table
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Itemized Session Log', margin, yPosition);
  
  yPosition += 15;

  // Table headers
  const tableStartY = yPosition;
  const colWidths = [22, 30, 20, 25, 22, 22, 22, 27];
  const headers = ['Date', 'Location', 'Type', 'Game/Event', 'Buy-In', 'Cash Out', 'Net Result', 'Notes'];
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  let xPos = margin;
  headers.forEach((header, i) => {
    pdf.text(header, xPos, yPosition);
    xPos += colWidths[i];
  });
  
  // Draw header line
  pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
  
  yPosition += 10;

  // All sessions sorted by date ascending
  pdf.setFont('helvetica', 'normal');
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sortedSessions.forEach((session) => {
    if (yPosition > 250) { // New page if needed
      pdf.addPage();
      yPosition = 30;
      
      // Redraw headers on new page
      pdf.setFont('helvetica', 'bold');
      xPos = margin;
      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPosition);
        xPos += colWidths[i];
      });
      pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
    }
    
    xPos = margin;
    const rowData = [
      format(new Date(session.date), 'MM/dd/yy'),
      (session.location || 'N/A').substring(0, 12),
      session.type === 'cash' ? 'Cash' : 'Tournament',
      `${session.game_type} ${session.stakes}`.substring(0, 11),
      `$${session.buy_in.toLocaleString()}`,
      `$${session.cash_out.toLocaleString()}`,
      `${(session.cash_out - session.buy_in) >= 0 ? '+' : ''}$${(session.cash_out - session.buy_in).toLocaleString()}`,
      (session.notes || '').substring(0, 15)
    ];
    
    rowData.forEach((data, i) => {
      pdf.text(data, xPos, yPosition);
      xPos += colWidths[i];
    });
    
    yPosition += 8;
  });

  // Totals row
  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  xPos = margin;
  const totalsData = [
    'TOTALS:',
    '',
    '',
    '',
    `$${totalBuyIns.toLocaleString()}`,
    `$${totalWinnings.toLocaleString()}`,
    `${netProfit >= 0 ? '+' : ''}$${netProfit.toLocaleString()}`,
    ''
  ];
  
  totalsData.forEach((data, i) => {
    pdf.text(data, xPos, yPosition);
    xPos += colWidths[i];
  });

  yPosition += 20;

  // IRS Compliance Notes
  if (yPosition > 200) { // New page if needed
    pdf.addPage();
    yPosition = 30;
  }
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IRS Compliance Notes', margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const complianceNotes = [
    '• Recreational Players: Report gambling winnings as "Other Income" on Form 1040.',
    '  Gambling losses may be deductible up to the amount of winnings if you itemize.',
    '',
    '• Professional Players: Report as business income on Schedule C. Business',
    '  expenses may be deductible.',
    '',
    '• Required Supporting Documentation:',
    '  - Casino player account statements',
    '  - Online poker site transaction histories',
    '  - Bank records showing deposits/withdrawals',
    '  - Detailed gambling diary/log (this statement)',
    '  - Receipts for gambling-related expenses',
    '',
    '• Consult a tax professional for guidance specific to your situation.',
    '',
    'This statement is provided for informational purposes only and does not',
    'constitute tax advice. Verify all information before filing.'
  ];
  
  complianceNotes.forEach((note) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 30;
    }
    pdf.text(note, margin, yPosition);
    yPosition += 8;
  });

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Generated: ${format(new Date(), 'MM/dd/yyyy')} | Page ${i} of ${pageCount}`, pageWidth - 80, pdf.internal.pageSize.height - 10);
  }

  return pdf;
};

export const downloadPokerTaxStatement = (options: PDFGenerationOptions) => {
  const pdf = generatePokerTaxStatement(options);
  pdf.save(`Poker_Tax_Statement_${options.taxYear}_${options.playerName.replace(/\s+/g, '_')}.pdf`);
};