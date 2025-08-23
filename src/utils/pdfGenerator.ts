import { jsPDF } from 'jspdf';
import type { PokerSession } from '@/hooks/usePokerSessions';
import { format } from 'date-fns';

interface PDFGenerationOptions {
  playerName: string;
  playerSSN: string;
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
  pdf.text('Address: ________________________________', margin, yPosition);
  
  yPosition += 8;
  pdf.text('         ________________________________', margin, yPosition);
  
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
  const colWidths = [25, 35, 30, 25, 25, 25, 35];
  const headers = ['Date', 'Location', 'Game/Event', 'Buy-In', 'Cash Out', 'Net Result', 'Notes'];
  
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

  // Sample data rows (first 3-4 actual sessions)
  pdf.setFont('helvetica', 'normal');
  const sampleSessions = sessions.slice(0, 4);
  
  sampleSessions.forEach((session) => {
    if (yPosition > 250) { // New page if needed
      pdf.addPage();
      yPosition = 30;
    }
    
    xPos = margin;
    const rowData = [
      format(new Date(session.date), 'MM/dd/yyyy'),
      session.location || 'N/A',
      `${session.game_type} ${session.stakes}`,
      `$${session.buy_in.toLocaleString()}`,
      `$${session.cash_out.toLocaleString()}`,
      `${(session.cash_out - session.buy_in) >= 0 ? '+' : ''}$${(session.cash_out - session.buy_in).toLocaleString()}`,
      session.notes || ''
    ];
    
    rowData.forEach((data, i) => {
      const text = data.length > 12 ? data.substring(0, 12) + '...' : data;
      pdf.text(text, xPos, yPosition);
      xPos += colWidths[i];
    });
    
    yPosition += 8;
  });

  // Add sample rows if less than 4 sessions
  if (sampleSessions.length < 4) {
    const remainingSamples = 4 - sampleSessions.length;
    for (let i = 0; i < remainingSamples; i++) {
      xPos = margin;
      const sampleData = [
        '01/15/2024',
        'Sample Casino',
        'NLH $1/$2',
        '$200',
        '$350',
        '+$150',
        'Good session'
      ];
      
      sampleData.forEach((data, j) => {
        pdf.text(data, xPos, yPosition);
        xPos += colWidths[j];
      });
      
      yPosition += 8;
    }
  }

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