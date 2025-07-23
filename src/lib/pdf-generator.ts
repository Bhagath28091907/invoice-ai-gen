import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceFormData, InvoiceSummary } from "@/types/invoice";
import { numberToWords } from "./invoice-calculations";

export const generateInvoicePDF = async (
  formData: InvoiceFormData,
  summary: InvoiceSummary
): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  
  // Professional Header with company branding
  pdf.setFillColor(240, 248, 255); // Light blue background
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(26, 35, 126); // Professional dark blue
  pdf.text("TAX INVOICE", pageWidth / 2, 22, { align: "center" });
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Business Information Section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL FROM:", margin, 55);
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.businessName.toUpperCase(), margin, 68);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`GSTIN: ${formData.gstin}`, margin, 78);
  
  const businessAddressLines = formData.businessAddress.split('\n');
  let yPos = 85;
  businessAddressLines.forEach((line) => {
    if (line.trim()) {
      pdf.text(line.trim(), margin, yPos);
      yPos += 8;
    }
  });
  
  // Client Information Section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", margin, yPos + 15);
  yPos += 28;
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.clientName.toUpperCase(), margin, yPos);
  yPos += 12;
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  if (formData.clientGstin) {
    pdf.text(`GSTIN: ${formData.clientGstin}`, margin, yPos);
    yPos += 10;
  }
  
  const clientAddressLines = formData.clientAddress.split('\n');
  clientAddressLines.forEach((line) => {
    if (line.trim()) {
      pdf.text(line.trim(), margin, yPos);
      yPos += 8;
    }
  });
  
  // Invoice Details Box (Right side)
  const detailsBoxX = pageWidth - 80;
  const detailsBoxY = 55;
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(detailsBoxX - 5, detailsBoxY - 5, 75, 50);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Invoice No:`, detailsBoxX, detailsBoxY + 5);
  pdf.setFont("helvetica", "normal");
  pdf.text(formData.invoiceNumber, detailsBoxX, detailsBoxY + 15);
  
  pdf.setFont("helvetica", "bold");
  pdf.text(`Date:`, detailsBoxX, detailsBoxY + 25);
  pdf.setFont("helvetica", "normal");
  pdf.text(new Date(formData.invoiceDate).toLocaleDateString('en-IN'), detailsBoxX, detailsBoxY + 35);
  
  if (formData.dueDate) {
    pdf.setFont("helvetica", "bold");
    pdf.text(`Due Date:`, detailsBoxX, detailsBoxY + 45);
    pdf.setFont("helvetica", "normal");
    pdf.text(new Date(formData.dueDate).toLocaleDateString('en-IN'), detailsBoxX, detailsBoxY + 55);
  }
  
  // Items Table
  yPos = Math.max(yPos + 25, 140); // Ensure proper spacing
  const tableStartY = yPos;
  
  // Professional table header with background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, tableStartY - 8, pageWidth - 2 * margin, 18, 'F');
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, tableStartY - 8, pageWidth - 2 * margin, 18);
  
  // Table headers
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("DESCRIPTION", margin + 2, tableStartY + 2);
  pdf.text("QTY", 105, tableStartY + 2);
  pdf.text("RATE", 125, tableStartY + 2);
  pdf.text("GST%", 145, tableStartY + 2);
  pdf.text("AMOUNT", 160, tableStartY + 2);
  pdf.text("TOTAL", 185, tableStartY + 2);
  
  // Table content area
  yPos = tableStartY + 15;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  
  formData.items.forEach((item, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 12, 'F');
    }
    
    // Item details
    const description = item.description.length > 25 ? 
      item.description.substring(0, 25) + '...' : item.description;
    
    pdf.text(description, margin + 2, yPos + 2);
    pdf.text(item.quantity.toString(), 107, yPos + 2);
    pdf.text(`₹${item.rate.toFixed(2)}`, 125, yPos + 2);
    pdf.text(`${item.gstRate}%`, 147, yPos + 2);
    pdf.text(`₹${item.amount.toFixed(2)}`, 160, yPos + 2);
    pdf.text(`₹${item.totalAmount.toFixed(2)}`, 180, yPos + 2);
    
    yPos += 12;
  });
  
  // Table border
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(margin, tableStartY - 8, pageWidth - 2 * margin, yPos - tableStartY + 8);
  
  // Professional Summary Section
  yPos += 15;
  const summaryStartX = pageWidth - 90;
  
  // Summary box background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(summaryStartX - 5, yPos - 5, 85, 55, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(summaryStartX - 5, yPos - 5, 85, 55);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  pdf.text(`Subtotal:`, summaryStartX, yPos + 5);
  pdf.text(`₹${summary.subtotal.toFixed(2)}`, summaryStartX + 45, yPos + 5);
  yPos += 12;
  
  if (summary.isInterstate) {
    pdf.text(`IGST:`, summaryStartX, yPos);
    pdf.text(`₹${summary.igst.toFixed(2)}`, summaryStartX + 45, yPos);
    yPos += 12;
  } else {
    pdf.text(`CGST:`, summaryStartX, yPos);
    pdf.text(`₹${summary.cgst.toFixed(2)}`, summaryStartX + 45, yPos);
    yPos += 12;
    pdf.text(`SGST:`, summaryStartX, yPos);
    pdf.text(`₹${summary.sgst.toFixed(2)}`, summaryStartX + 45, yPos);
    yPos += 12;
  }
  
  // Total amount highlight
  pdf.setFillColor(26, 35, 126);
  pdf.rect(summaryStartX - 5, yPos - 3, 85, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(`TOTAL:`, summaryStartX, yPos + 5);
  pdf.text(`₹${summary.total.toFixed(2)}`, summaryStartX + 35, yPos + 5);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Amount in words
  yPos += 25;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  const amountInWords = numberToWords(Math.floor(summary.total));
  const wordsText = `Amount in words: ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only`;
  pdf.text(wordsText, margin, yPos, { maxWidth: pageWidth - 2 * margin });
  
  // Notes section
  if (formData.notes && formData.notes.trim()) {
    yPos += 20;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOTES:", margin, yPos);
    yPos += 12;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const notesLines = formData.notes.trim().split('\n');
    notesLines.forEach((line) => {
      if (line.trim()) {
        pdf.text(line.trim(), margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 10;
      }
    });
  }
  
  // Professional Footer
  yPos = pageHeight - 30;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("This is a computer generated invoice and does not require physical signature.", 
    pageWidth / 2, yPos + 10, { align: "center" });
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 
    pageWidth / 2, yPos + 18, { align: "center" });
  
  // Download the PDF with professional naming
  const fileName = `Invoice_${formData.invoiceNumber}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  pdf.save(fileName);
};