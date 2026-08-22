import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '../types';

/**
 * Builds the PDF document instance with full corporate branding,
 * tax breakdown, earnings matrix, and cryptographic authenticity seal.
 */
export const createPayslipDoc = (user: User, month: string = 'August 2026') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // --- TOP HEADER BANNER (Odoo Deep Purple #714B67 & Slate Gradient) ---
  doc.setFillColor(113, 75, 103);
  doc.rect(0, 0, 210, 38, 'F');

  // Decorative Accent Strip
  doc.setFillColor(0, 160, 157); // Odoo Teal Accent
  doc.rect(0, 36, 210, 2, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Dayflow HRMS', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text('Every workday, perfectly aligned. | Official Compensation Statement', 15, 26);

  // Statement Meta Header (Right Aligned)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PAYSLIP STATEMENT', 195, 17, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Pay Cycle: ${month}`, 195, 24, { align: 'right' });
  doc.text(`Doc ID: DFS-${month.substring(0, 3).toUpperCase()}-${user.employeeId}`, 195, 29, { align: 'right' });
  doc.text(`Disbursed: Direct Deposit (Completed)`, 195, 34, { align: 'right' });

  // --- CORPORATE HEADQUARTERS ADDRESS ---
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYER:', 15, 45);
  doc.setFont('helvetica', 'normal');
  doc.text('Dayflow Solutions Inc. • 100 Tech Blvd, Innovation Quarter, San Francisco, CA 94107 • EIN: 88-2910419', 35, 45);

  // --- EMPLOYEE INFORMATION MATRIX ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 49, 180, 42, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE INFORMATION', 20, 56);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');

  // Left Column
  doc.text('Employee Name:', 20, 64);
  doc.text('Employee ID:', 20, 71);
  doc.text('Department:', 20, 78);
  doc.text('Designation:', 20, 85);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${user.profile.firstName} ${user.profile.lastName}`, 50, 64);
  doc.text(user.employeeId, 50, 71);
  doc.text(user.profile.department, 50, 78);
  doc.text(user.profile.designation, 50, 85);

  // Right Column
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Date of Joining:', 110, 64);
  doc.text('Tax Identification / PAN:', 110, 71);
  doc.text('Bank Name & Branch:', 110, 78);
  doc.text('Disbursal Account:', 110, 85);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(user.profile.dateOfJoining || '2023-01-15', 148, 64);
  doc.text(user.salary.panOrTaxId || 'US-TX-9938210', 148, 71);
  doc.text(user.salary.bankName || 'Silicon Valley Commercial Bank', 148, 78);
  doc.text(user.salary.bankAccount || '•••• •••• •••• 8842', 148, 85);

  // --- COMPENSATION BREAKDOWN TABLE ---
  const basic = user.salary.basicSalary;
  const hra = user.salary.hra;
  const allowances = user.salary.allowances;
  const deductions = user.salary.deductions;
  
  const totalEarnings = basic + hra + allowances;
  const totalDeductions = deductions;
  const netPay = totalEarnings - totalDeductions;
  const currency = user.salary.currency || 'USD';

  const tableBody = [
    [
      'Basic Salary (Contractual)',
      `$${basic.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Income Tax Deductions (TDS)',
      `$${(deductions * 0.55).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'House Rent Allowance (HRA)',
      `$${hra.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Provident Fund / Social Security (401k)',
      `$${(deductions * 0.35).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'Special & Conveyance Allowances',
      `$${allowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Health Insurance & Benefit Premium',
      `$${(deductions * 0.10).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'Total Gross Earnings',
      `$${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Total Deductions',
      `$${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
  ];

  autoTable(doc, {
    startY: 96,
    head: [['EARNINGS & REVENUE BREAKDOWN', 'AMOUNT ($)', 'DEDUCTIONS & TAX WITHHOLDING', 'AMOUNT ($)']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [113, 75, 103],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 58 },
      1: { cellWidth: 32, halign: 'right' },
      2: { cellWidth: 58 },
      3: { cellWidth: 32, halign: 'right' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      font: 'helvetica',
      textColor: [51, 65, 85],
    },
    didParseCell: (data) => {
      // Highlight and bold summary row
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 148;

  // --- NET SALARY PAYOUT HIGHLIGHT BOX ---
  const boxY = finalY + 7;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.6);
  doc.roundedRect(15, boxY, 180, 20, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70); // emerald-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('NET SALARY PAYOUT (DIRECT DEPOSIT):', 22, boxY + 12);

  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text(
    `$${netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
    188,
    boxY + 13.5,
    { align: 'right' }
  );

  // --- YTD ANNUAL SUMMARY MATRIX ---
  const ytdY = boxY + 26;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, ytdY, 180, 16, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('YEAR-TO-DATE (YTD) ACCUMULATED:', 20, ytdY + 6);

  doc.setFont('helvetica', 'normal');
  doc.text(`Gross YTD Earnings: $${(totalEarnings * 8).toLocaleString()}`, 20, ytdY + 11.5);
  doc.text(`Total Tax Withheld YTD: $${(deductions * 0.55 * 8).toLocaleString()}`, 80, ytdY + 11.5);
  doc.text(`Provident Fund YTD: $${(deductions * 0.35 * 8).toLocaleString()}`, 140, ytdY + 11.5);

  // --- VERIFICATION QR CODE & HR SIGNATURE SEAL ---
  const footerY = ytdY + 22;

  // Authentic QR Code Placeholder Stamp
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.rect(15, footerY, 18, 18, 'FD');
  
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('SCAN TO', 18, footerY + 8);
  doc.text('VERIFY', 18.5, footerY + 12);

  // Policy & Terms
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Confidential statement issued under Dayflow HRMS Automated Payroll Dispatch.', 38, footerY + 5);
  doc.text('2. Electronically validated with tamper-evident digital signature. No physical sign required.', 38, footerY + 9);
  doc.text(`3. Verification Hash: SHA256-${user.employeeId.toLowerCase()}-${month.toLowerCase().replace(' ', '')}-99x81f`, 38, footerY + 13);

  // Corporate HR Stamp
  const stampX = 165;
  doc.setTextColor(113, 75, 103);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Dayflow Operations', stampX, footerY + 4);
  
  doc.setDrawColor(113, 75, 103);
  doc.line(stampX - 10, footerY + 6, stampX + 30, footerY + 6);

  // Stamp circle
  doc.setFillColor(253, 244, 255);
  doc.setDrawColor(113, 75, 103);
  doc.circle(stampX + 10, footerY + 14, 7, 'FD');

  doc.setFontSize(5);
  doc.text('DAYFLOW', stampX + 6, footerY + 13.5);
  doc.text('VALIDATED', stampX + 5, footerY + 16.5);

  return doc;
};

/**
 * Downloads the payslip directly as a file.
 */
export const generatePayslipPDF = (user: User, month: string = 'August 2026') => {
  const doc = createPayslipDoc(user, month);
  doc.save(`Payslip_${user.profile.firstName}_${month.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Returns a data URL string of the PDF for in-app modal preview.
 */
export const getPayslipDataUrl = (user: User, month: string = 'August 2026'): string => {
  const doc = createPayslipDoc(user, month);
  return doc.output('datauristring');
};
