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

  // All sessions sorted by date ascending, grouped by month
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group sessions by month
  const sessionsByMonth = sortedSessions.reduce((acc, session) => {
    const monthKey = format(new Date(session.date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(session);
    return acc;
  }, {} as Record<string, typeof sortedSessions>);

  let totalRowCount = 0;

  Object.entries(sessionsByMonth).forEach(([monthKey, monthSessions]) => {
    // Month header
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 30;
      
      // Redraw headers on new page
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      xPos = margin;
      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPosition);
        xPos += colWidths[i];
      });
      pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
      yPosition += 12;
      pdf.setFontSize(9);
    }

    // Month label
    pdf.setFont('helvetica', 'bold');
    pdf.text(format(new Date(monthKey + '-01'), 'MMMM yyyy'), margin, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');

    // Month sessions with alternating row shading
    monthSessions.forEach((session, index) => {
      if (yPosition > 265) {
        pdf.addPage();
        yPosition = 30;
        
        // Redraw headers on new page
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        xPos = margin;
        headers.forEach((header, i) => {
          pdf.text(header, xPos, yPosition);
          xPos += colWidths[i];
        });
        pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
        yPosition += 12;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
      }

      // Alternating row background
      if ((totalRowCount + index) % 2 === 1) {
        pdf.setFillColor(245, 245, 245); // Light gray
        pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, 7, 'F');
      }
      
      xPos = margin;
      const rowData = [
        format(new Date(session.date), 'MM/dd/yy'),
        (session.location || 'N/A').substring(0, 10),
        session.type === 'cash' ? 'Cash' : 'Tourn',
        `${session.game_type} ${session.stakes}`.substring(0, 9),
        `$${session.buy_in.toLocaleString()}`,
        `$${session.cash_out.toLocaleString()}`,
        `${(session.cash_out - session.buy_in) >= 0 ? '+' : ''}$${(session.cash_out - session.buy_in).toLocaleString()}`,
        (session.notes || '').substring(0, 12)
      ];
      
      pdf.setTextColor(0, 0, 0); // Reset text color
      rowData.forEach((data, i) => {
        pdf.text(data, xPos, yPosition);
        xPos += colWidths[i];
      });
      
      yPosition += 7;
    });

    // Month subtotal
    const monthBuyIns = monthSessions.reduce((sum, s) => sum + s.buy_in, 0);
    const monthCashOuts = monthSessions.reduce((sum, s) => sum + s.cash_out, 0);
    const monthNet = monthCashOuts - monthBuyIns;

    yPosition += 2;
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(220, 220, 220); // Darker gray for subtotal
    pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, 7, 'F');
    
    xPos = margin;
    const subtotalData = [
      'Subtotal:',
      '',
      '',
      '',
      `$${monthBuyIns.toLocaleString()}`,
      `$${monthCashOuts.toLocaleString()}`,
      `${monthNet >= 0 ? '+' : ''}$${monthNet.toLocaleString()}`,
      ''
    ];
    
    subtotalData.forEach((data, i) => {
      pdf.text(data, xPos, yPosition);
      xPos += colWidths[i];
    });
    
    yPosition += 12;
    pdf.setFont('helvetica', 'normal');
    totalRowCount += monthSessions.length;
  });

  // Grand totals row
  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(200, 200, 200); // Even darker gray for grand total
  pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, 8, 'F');
  
  xPos = margin;
  const totalsData = [
    'GRAND TOTAL:',
    '',
    '',
    '',
    `$${totalBuyIns.toLocaleString()}`,
    `$${(totalBuyIns + netProfit).toLocaleString()}`,
    `${netProfit >= 0 ? '+' : ''}$${netProfit.toLocaleString()}`,
    ''
  ];
  
  pdf.setTextColor(0, 0, 0);
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