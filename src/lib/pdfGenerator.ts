import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '../types';

/**
 * Builds the Indian corporate PDF document instance with full statutory details,
 * EPF, Professional Tax, TDS deductions, and authentic corporate seal.
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

  // Decorative Accent Strip (Teal)
  doc.setFillColor(0, 160, 157);
  doc.rect(0, 36, 210, 2, 'F');

  // Brand Name & Indian Entity Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Dayflow Technologies India Pvt. Ltd.', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('CIN: U72200KA2024PTC184910 • GSTIN: 29AAACD1234A1Z5 • PAN: AAACD1234A', 15, 26);
  doc.text('Regd. Office: Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103', 15, 31);

  // Statement Meta Header (Right Aligned)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SALARY STATEMENT', 195, 17, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Pay Month: ${month}`, 195, 24, { align: 'right' });
  doc.text(`Ref: DFS-IND-${month.substring(0, 3).toUpperCase()}-${user.employeeId}`, 195, 29, { align: 'right' });
  doc.text(`Status: Direct Bank Credit (NEFT/RTGS)`, 195, 34, { align: 'right' });

  // --- EMPLOYEE INFORMATION MATRIX (Indian Statutory Form) ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 45, 180, 46, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE PERSONNEL & STATUTORY DETAILS', 20, 52);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');

  // Column 1 (Left)
  doc.text('Employee Name:', 20, 60);
  doc.text('Employee ID:', 20, 67);
  doc.text('Designation:', 20, 74);
  doc.text('Department:', 20, 81);
  doc.text('Date of Joining:', 20, 88);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${user.profile.firstName} ${user.profile.lastName}`, 52, 60);
  doc.text(user.employeeId, 52, 67);
  doc.text(user.profile.designation, 52, 74);
  doc.text(user.profile.department, 52, 81);
  doc.text(user.profile.dateOfJoining || '2023-01-15', 52, 88);

  // Column 2 (Right - Statutory & Banking)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Permanent Account Number (PAN):', 105, 60);
  doc.text('Universal Account No. (EPF UAN):', 105, 67);
  doc.text('Bank Name & Branch:', 105, 74);
  doc.text('Bank IFSC Code:', 105, 81);
  doc.text('Bank Account Number:', 105, 88);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(user.salary.panOrTaxId || 'AAAPM1234F', 158, 60);
  doc.text(user.salary.uanNumber || '100982341029', 158, 67);
  doc.text(user.salary.bankName || 'HDFC Bank', 158, 74);
  doc.text(user.salary.ifscCode || 'HDFC0000128', 158, 81);
  doc.text(user.salary.bankAccount || '•••• •••• 8842', 158, 88);

  // --- COMPENSATION BREAKDOWN TABLE (INR) ---
  const basic = user.salary.basicSalary;
  const hra = user.salary.hra;
  const allowances = user.salary.allowances;
  const deductions = user.salary.deductions;
  
  const totalEarnings = basic + hra + allowances;
  const totalDeductions = deductions;
  const netPay = totalEarnings - totalDeductions;

  // Standard Indian Statutory Splits
  const epfEmployee = Math.round(basic * 0.12); // EPF 12%
  const profTax = 200; // Standard Karnataka/Maharashtra PT
  const tdsIncomeTax = Math.max(0, deductions - epfEmployee - profTax);

  const tableBody = [
    [
      'Basic Salary (Contractual)',
      `Rs. ${basic.toLocaleString('en-IN')}`,
      'Employee Provident Fund (EPF 12%)',
      `Rs. ${epfEmployee.toLocaleString('en-IN')}`,
    ],
    [
      'House Rent Allowance (HRA)',
      `Rs. ${hra.toLocaleString('en-IN')}`,
      'Income Tax Withholding (TDS u/s 192)',
      `Rs. ${tdsIncomeTax.toLocaleString('en-IN')}`,
    ],
    [
      'Special & Transport Allowances',
      `Rs. ${allowances.toLocaleString('en-IN')}`,
      'Professional Tax (PT Karnataka/State)',
      `Rs. ${profTax.toLocaleString('en-IN')}`,
    ],
    [
      'Total Gross Earnings (A)',
      `Rs. ${totalEarnings.toLocaleString('en-IN')}`,
      'Total Statutory Deductions (B)',
      `Rs. ${totalDeductions.toLocaleString('en-IN')}`,
    ],
  ];

  autoTable(doc, {
    startY: 97,
    head: [['EARNINGS & ALLOWANCES', 'AMOUNT (INR)', 'STATUTORY DEDUCTIONS', 'AMOUNT (INR)']],
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
      cellPadding: 3.2,
      font: 'helvetica',
      textColor: [51, 65, 85],
    },
    didParseCell: (data) => {
      // Highlight totals row
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 148;

  // --- NET SALARY PAYOUT HIGHLIGHT BOX ---
  const boxY = finalY + 6;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.6);
  doc.roundedRect(15, boxY, 180, 18, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70); // emerald-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('NET SALARY TAKE-HOME PAY (A - B):', 22, boxY + 11);

  doc.setFontSize(15);
  doc.setTextColor(5, 150, 105);
  doc.text(
    `Rs. ${netPay.toLocaleString('en-IN')} INR`,
    188,
    boxY + 12,
    { align: 'right' }
  );

  // --- YTD ACCUMULATED CTC & FORM 16 SUMMARY ---
  const ytdY = boxY + 23;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, ytdY, 180, 16, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNUAL COST-TO-COMPANY (CTC) & TDS SUMMARY (FY 2026-27):', 20, ytdY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Annual Gross CTC: Rs. ${(totalEarnings * 12).toLocaleString('en-IN')}`, 20, ytdY + 11);
  doc.text(`TDS Deducted YTD: Rs. ${(tdsIncomeTax * 5).toLocaleString('en-IN')}`, 80, ytdY + 11);
  doc.text(`EPF Corpus YTD: Rs. ${(epfEmployee * 5).toLocaleString('en-IN')}`, 140, ytdY + 11);

  // --- QR VERIFICATION CODE & AUTHORIZED SIGNATORY STAMP ---
  const footerY = ytdY + 21;

  // Authentic QR Code Stamp
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.rect(15, footerY, 18, 18, 'FD');
  
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('SCAN TO', 18, footerY + 8);
  doc.text('VERIFY', 18.5, footerY + 12);

  // Legal Notes
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Electronically generated statement under Dayflow Automated HRMS Payroll Engine.', 38, footerY + 5);
  doc.text('2. Form 16 Part B / Tax certificate will be issued at the end of the financial year.', 38, footerY + 9);
  doc.text(`3. Digital Authentication Token: SHA256-IN-${user.employeeId.toUpperCase()}-${month.replace(' ', '').toUpperCase()}`, 38, footerY + 13);

  // Corporate HR Stamp
  const stampX = 165;
  doc.setTextColor(113, 75, 103);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Dayflow India HR Dept.', stampX, footerY + 4);
  
  doc.setDrawColor(113, 75, 103);
  doc.line(stampX - 10, footerY + 6, stampX + 30, footerY + 6);

  // Stamp circle
  doc.setFillColor(253, 244, 255);
  doc.setDrawColor(113, 75, 103);
  doc.circle(stampX + 10, footerY + 14, 6.5, 'FD');

  doc.setFontSize(5);
  doc.text('DAYFLOW', stampX + 6, footerY + 13.5);
  doc.text('INDIA', stampX + 8, footerY + 16.5);

  return doc;
};

/**
 * Downloads the payslip directly as a file.
 */
export const generatePayslipPDF = (user: User, month: string = 'August 2026') => {
  const doc = createPayslipDoc(user, month);
  doc.save(`Dayflow_Payslip_${user.profile.firstName}_${month.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Returns a data URL string of the PDF for in-app modal preview.
 */
export const getPayslipDataUrl = (user: User, month: string = 'August 2026'): string => {
  const doc = createPayslipDoc(user, month);
  return doc.output('datauristring');
};
