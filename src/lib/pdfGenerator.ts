import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '../types';

/**
 * Generates and downloads a premium, client-side PDF payslip for a given employee and month.
 */
export const generatePayslipPDF = (user: User, month: string) => {
  // Create PDF document (A4 size: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // --- TOP HEADER BANNER (Odoo / Slate Styled) ---
  // Deep Purple Brand Color (#714B67)
  doc.setFillColor(113, 75, 103);
  doc.rect(0, 0, 210, 38, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Dayflow HRMS', 15, 18);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Every workday, perfectly aligned.', 15, 25);

  // Payslip Period Label (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PAYSLIP STATEMENT', 195, 18, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Period: ${month}`, 195, 25, { align: 'right' });
  doc.text(`Ref ID: DFS-${month.substring(0, 3).toUpperCase()}-${user.employeeId}`, 195, 30, { align: 'right' });

  // --- CORPORATE ADDRESSES ---
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPANY ADDRESS:', 15, 46);
  doc.setFont('helvetica', 'normal');
  doc.text('Dayflow Solutions Inc., 100 Tech Blvd, Innovation City, CA 94107', 15, 50);

  // --- EMPLOYEE INFORMATION SECTION ---
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE DETAILS', 15, 60);
  
  // Section Divider Line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(15, 62, 195, 62);

  // Information Grid
  // Column 1
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'normal');
  doc.text('Employee ID:', 15, 69);
  doc.text('Full Name:', 15, 75);
  doc.text('Designation:', 15, 81);
  doc.text('Department:', 15, 87);

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.text(user.employeeId, 42, 69);
  doc.text(`${user.profile.firstName} ${user.profile.lastName}`, 42, 75);
  doc.text(user.profile.designation, 42, 81);
  doc.text(user.profile.department, 42, 87);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Date of Joining:', 110, 69);
  doc.text('PAN / Tax ID:', 110, 75);
  doc.text('Bank Name:', 110, 81);
  doc.text('Bank Account:', 110, 87);

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.text(user.profile.dateOfJoining || '2023-01-01', 142, 69);
  doc.text(user.salary.panOrTaxId || 'US-TX-XXXXXXX', 142, 75);
  doc.text(user.salary.bankName || 'Partner Bank', 142, 81);
  doc.text(user.salary.bankAccount || '•••• •••• •••• 1234', 142, 87);

  // --- EARNINGS & DEDUCTIONS BREAKDOWN TABLE ---
  const basic = user.salary.basicSalary;
  const hra = user.salary.hra;
  const allowances = user.salary.allowances;
  const deductions = user.salary.deductions;
  
  const totalEarnings = basic + hra + allowances;
  const totalDeductions = deductions;
  const currency = user.salary.currency || 'USD';

  // Construct table body
  const tableBody = [
    [
      'Basic Salary',
      `$${basic.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Provident Fund / Social Security',
      `$${(deductions * 0.4).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'House Rent Allowance (HRA)',
      `$${hra.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Income Tax Deductions (TDS)',
      `$${(deductions * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'Special & Conveyance Allowances',
      `$${allowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Professional Tax / Insurance Contribution',
      `$${(deductions * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'Gross Earnings',
      `$${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      'Gross Deductions',
      `$${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
  ];

  // Render Table
  autoTable(doc, {
    startY: 96,
    head: [['EARNINGS & REVENUE', 'AMOUNT', 'DEDUCTIONS & TAXES', 'AMOUNT']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [113, 75, 103], // deep purple
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 60 },
      3: { cellWidth: 30, halign: 'right' },
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      font: 'helvetica',
      textColor: [51, 65, 85],
    },
    didParseCell: (data) => {
      // Highlight and bold the totals row (index 3)
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249]; // slate-100
        data.cell.styles.textColor = [15, 23, 42]; // slate-900
      }
    },
  });

  // Get final Y coordinate of table to draw bottom blocks dynamically
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // --- NET SALARY PAYOUT BOX ---
  const boxY = finalY + 8;
  doc.setFillColor(240, 253, 250); // emerald-50 / mint background (#f0fdfa)
  doc.setDrawColor(15, 118, 110); // emerald-700 (#0f766e)
  doc.setLineWidth(0.5);
  doc.rect(15, boxY, 180, 18, 'FD');

  // Box text
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('NET SALARY PAYOUT (TAKE HOME)', 22, boxY + 11);

  doc.setFontSize(15);
  doc.text(
    `$${user.salary.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
    188,
    boxY + 12,
    { align: 'right' }
  );

  // --- NOTES & VERIFICATION SIGNATURE ---
  const footerStartY = boxY + 28;
  
  // Disclaimer
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Notes & Policy:', 15, footerStartY);
  doc.text('1. This statement is a confidential corporate document generated client-side by Dayflow HRMS.', 15, footerStartY + 4);
  doc.text('2. All calculations reflect basic payroll agreements, taxes, and active attendance records for this cycle.', 15, footerStartY + 7);
  doc.text('3. If you spot any discrepancies, please log a query with corporate HR within 5 business days.', 15, footerStartY + 10);

  // HR Stamp and mock sign
  const stampX = 165;
  const stampY = footerStartY + 12;

  doc.setTextColor(113, 75, 103);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Corporate HR Department', stampX, footerStartY);
  doc.setDrawColor(113, 75, 103);
  doc.setLineWidth(0.3);
  doc.line(stampX - 10, footerStartY + 2, stampX + 30, footerStartY + 2);

  // Stamp circle outline
  doc.setFillColor(253, 244, 255); // fuchsia-50
  doc.setDrawColor(113, 75, 103);
  doc.circle(stampX + 10, stampY + 4, 8, 'FD');
  
  // Stamp text inside
  doc.setFontSize(5.5);
  doc.text('DAYFLOW', stampX + 5.5, stampY + 3.5);
  doc.text('APPROVED', stampX + 5, stampY + 6.5);

  // Save the PDF
  doc.save(`Payslip_${user.profile.firstName}_${month.replace(/\s+/g, '_')}.pdf`);
};
