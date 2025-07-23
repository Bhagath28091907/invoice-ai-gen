
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
  let yPos = 40; // Starting Y position
  
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
  yPos = 50;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL FROM:", margin, yPos);
  yPos += 10;
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.businessName.toUpperCase(), margin, yPos);
  yPos += 10;
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`GSTIN: ${formData.gstin}`, margin, yPos);
  yPos += 8;
  
  const businessAddressLines = formData.businessAddress.split('\n');
  businessAddressLines.forEach((line) => {
    if (line.trim()) {
      pdf.text(line.trim(), margin, yPos);
      yPos += 8;
    }
  });
  
  // Client Information Section
  yPos += 10;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", margin, yPos);
  yPos += 10;
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.clientName.toUpperCase(), margin, yPos);
  yPos += 10;
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  if (formData.clientGstin) {
    pdf.text(`GSTIN: ${formData.clientGstin}`, margin, yPos);
    yPos += 8;
  }
  
  const clientAddressLines = formData.clientAddress.split('\n');
  clientAddressLines.forEach((line) => {
    if (line.trim()) {
      pdf.text(line.trim(), margin, yPos);
      yPos += 8;
    }
  });
  
  // Invoice Details Box (Right side) - positioned independently
  const detailsBoxX = pageWidth - 80;
  const detailsBoxY = 50;
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(detailsBoxX - 5, detailsBoxY - 5, 75, 60);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Invoice No:`, detailsBoxX, detailsBoxY + 8);
  pdf.setFont("helvetica", "normal");
  pdf.text(formData.invoiceNumber, detailsBoxX, detailsBoxY + 18);
  
  pdf.setFont("helvetica", "bold");
  pdf.text(`Date:`, detailsBoxX, detailsBoxY + 28);
  pdf.setFont("helvetica", "normal");
  pdf.text(new Date(formData.invoiceDate).toLocaleDateString('en-IN'), detailsBoxX, detailsBoxY + 38);
  
  if (formData.dueDate) {
    pdf.setFont("helvetica", "bold");
    pdf.text(`Due Date:`, detailsBoxX, detailsBoxY + 48);
    pdf.setFont("helvetica", "normal");
    pdf.text(new Date(formData.dueDate).toLocaleDateString('en-IN'), detailsBoxX, detailsBoxY + 58);
  }
  
  // Items Table - ensure proper spacing
  yPos = Math.max(yPos + 20, 130); // Ensure minimum spacing
  const tableStartY = yPos;
  
  // Professional table header with background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, tableStartY, pageWidth - 2 * margin, 15, 'F');
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, tableStartY, pageWidth - 2 * margin, 15);
  
  // Table headers
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("DESCRIPTION", margin + 3, tableStartY + 10);
  pdf.text("QTY", 100, tableStartY + 10);
  pdf.text("RATE", 120, tableStartY + 10);
  pdf.text("GST%", 140, tableStartY + 10);
  pdf.text("AMOUNT", 160, tableStartY + 10);
  
  // Table content
  yPos = tableStartY + 20;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  
  formData.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 15, 'F');
    }
    
    // Item details with proper spacing
    const description = item.description.length > 30 ? 
      item.description.substring(0, 30) + '...' : item.description;
    
    pdf.text(description, margin + 3, yPos + 5);
    pdf.text(item.quantity.toString(), 102, yPos + 5);
    pdf.text(`₹${item.rate.toFixed(2)}`, 120, yPos + 5);
    pdf.text(`${item.gstRate}%`, 142, yPos + 5);
    pdf.text(`₹${item.totalAmount.toFixed(2)}`, 160, yPos + 5);
    
    yPos += 15;
  });
  
  // Table border
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(margin, tableStartY, pageWidth - 2 * margin, yPos - tableStartY);
  
  // Professional Summary Section
  yPos += 20;
  const summaryStartX = pageWidth - 90;
  
  // Summary box background
  pdf.setFillColor(248, 250, 252);
  const summaryHeight = summary.isInterstate ? 45 : 55;
  pdf.rect(summaryStartX - 5, yPos - 5, 85, summaryHeight, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(summaryStartX - 5, yPos - 5, 85, summaryHeight);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  pdf.text(`Subtotal:`, summaryStartX, yPos + 8);
  pdf.text(`₹${summary.subtotal.toFixed(2)}`, summaryStartX + 45, yPos + 8);
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
  pdf.rect(summaryStartX - 5, yPos - 3, 85, 18, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(`TOTAL:`, summaryStartX, yPos + 8);
  pdf.text(`₹${summary.total.toFixed(2)}`, summaryStartX + 35, yPos + 8);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Amount in words
  yPos += 25;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  const amountInWords = numberToWords(Math.floor(summary.total));
  const wordsText = `Amount in words: ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only`;
  
  // Split long text into multiple lines if needed
  const splitText = pdf.splitTextToSize(wordsText, pageWidth - 2 * margin);
  pdf.text(splitText, margin, yPos);
  yPos += splitText.length * 8;
  
  // Notes section
  if (formData.notes && formData.notes.trim()) {
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOTES:", margin, yPos);
    yPos += 10;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    const notesSplit = pdf.splitTextToSize(formData.notes.trim(), pageWidth - 2 * margin);
    pdf.text(notesSplit, margin, yPos);
    yPos += notesSplit.length * 8;
  }
  
  // Professional Footer
  const footerY = pageHeight - 25;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("This is a computer generated invoice and does not require physical signature.", 
    pageWidth / 2, footerY, { align: "center" });
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 
    pageWidth / 2, footerY + 8, { align: "center" });
  
  // Download the PDF with professional naming
  const fileName = `Invoice_${formData.invoiceNumber}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  pdf.save(fileName);
};
