
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
  const margin = 12; // Reduced margin for better space utilization
  let yPos = 25;

  // Professional Header with enhanced design
  pdf.setFillColor(41, 98, 255); // Professional blue
  pdf.rect(0, 0, pageWidth, 28, 'F');
  
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("TAX INVOICE", pageWidth / 2, 18, { align: "center" });
  
  // Header sections layout - using full width
  yPos = 38;
  const leftColWidth = (pageWidth * 0.65) - margin;
  const rightColX = pageWidth * 0.68;
  const rightColWidth = (pageWidth * 0.32) - margin;

  // Business Information Section (Left Column)
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPos, leftColWidth, 80, 'F');
  pdf.setDrawColor(230, 230, 230);
  pdf.rect(margin, yPos, leftColWidth, 80);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL FROM:", margin + 5, yPos + 12);
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.businessName.toUpperCase(), margin + 5, yPos + 25);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`GSTIN: ${formData.gstin}`, margin + 5, yPos + 35);
  
  const businessAddressLines = formData.businessAddress.split('\n');
  let businessYPos = yPos + 45;
  businessAddressLines.forEach((line) => {
    if (line.trim() && businessYPos < yPos + 75) {
      pdf.text(line.trim(), margin + 5, businessYPos);
      businessYPos += 8;
    }
  });

  // Invoice Details Box (Right Column) - Enhanced positioning
  pdf.setFillColor(41, 98, 255);
  pdf.rect(rightColX, yPos, rightColWidth, 80, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("INVOICE DETAILS", rightColX + 5, yPos + 12);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Invoice No:", rightColX + 5, yPos + 25);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.invoiceNumber, rightColX + 5, yPos + 33);
  
  pdf.setFont("helvetica", "normal");
  pdf.text("Date:", rightColX + 5, yPos + 45);
  pdf.setFont("helvetica", "bold");
  pdf.text(new Date(formData.invoiceDate).toLocaleDateString('en-IN'), rightColX + 5, yPos + 53);
  
  if (formData.dueDate) {
    pdf.setFont("helvetica", "normal");
    pdf.text("Due Date:", rightColX + 5, yPos + 65);
    pdf.setFont("helvetica", "bold");
    pdf.text(new Date(formData.dueDate).toLocaleDateString('en-IN'), rightColX + 5, yPos + 73);
  }

  // Client Information Section (Full width below)
  yPos += 90;
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(252, 252, 252);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 65, 'F');
  pdf.setDrawColor(230, 230, 230);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 65);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", margin + 5, yPos + 12);
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.clientName.toUpperCase(), margin + 5, yPos + 25);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  if (formData.clientGstin) {
    pdf.text(`GSTIN: ${formData.clientGstin}`, margin + 5, yPos + 35);
  }
  
  const clientAddressLines = formData.clientAddress.split('\n');
  let clientYPos = yPos + (formData.clientGstin ? 45 : 35);
  clientAddressLines.forEach((line) => {
    if (line.trim() && clientYPos < yPos + 60) {
      pdf.text(line.trim(), margin + 5, clientYPos);
      clientYPos += 8;
    }
  });

  // Items Table - Full width utilization
  yPos += 75;
  const tableWidth = pageWidth - 2 * margin;
  const colWidths = {
    description: tableWidth * 0.45,
    qty: tableWidth * 0.08,
    rate: tableWidth * 0.15,
    gst: tableWidth * 0.08,
    amount: tableWidth * 0.24
  };

  // Table header with enhanced styling
  pdf.setFillColor(41, 98, 255);
  pdf.rect(margin, yPos, tableWidth, 18, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("DESCRIPTION", margin + 3, yPos + 12);
  pdf.text("QTY", margin + colWidths.description + 3, yPos + 12);
  pdf.text("RATE (₹)", margin + colWidths.description + colWidths.qty + 3, yPos + 12);
  pdf.text("GST%", margin + colWidths.description + colWidths.qty + colWidths.rate + 3, yPos + 12);
  pdf.text("AMOUNT (₹)", margin + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 3, yPos + 12);

  // Table content with proper spacing
  yPos += 18;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  
  formData.items.forEach((item, index) => {
    if (yPos > pageHeight - 100) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPos, tableWidth, 16, 'F');
    }
    
    // Draw row borders
    pdf.setDrawColor(230, 230, 230);
    pdf.rect(margin, yPos, tableWidth, 16);
    
    // Item details with proper alignment
    const description = item.description.length > 35 ? 
      item.description.substring(0, 35) + '...' : item.description;
    
    pdf.text(description, margin + 3, yPos + 10);
    pdf.text(item.quantity.toString(), margin + colWidths.description + 8, yPos + 10, { align: "center" });
    pdf.text(item.rate.toFixed(2), margin + colWidths.description + colWidths.qty + 15, yPos + 10, { align: "right" });
    pdf.text(`${item.gstRate}%`, margin + colWidths.description + colWidths.qty + colWidths.rate + 15, yPos + 10, { align: "center" });
    pdf.text(item.totalAmount.toFixed(2), margin + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 40, yPos + 10, { align: "right" });
    
    yPos += 16;
  });

  // Summary Section - Enhanced layout
  yPos += 15;
  const summaryWidth = 120;
  const summaryX = pageWidth - summaryWidth - margin;
  
  pdf.setFillColor(248, 250, 252);
  const summaryHeight = summary.isInterstate ? 70 : 85;
  pdf.rect(summaryX, yPos, summaryWidth, summaryHeight, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(summaryX, yPos, summaryWidth, summaryHeight);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  let summaryYPos = yPos + 15;
  pdf.text("Subtotal:", summaryX + 10, summaryYPos);
  pdf.text(`₹${summary.subtotal.toFixed(2)}`, summaryX + summaryWidth - 15, summaryYPos, { align: "right" });
  summaryYPos += 12;
  
  if (summary.isInterstate) {
    pdf.text("IGST:", summaryX + 10, summaryYPos);
    pdf.text(`₹${summary.igst.toFixed(2)}`, summaryX + summaryWidth - 15, summaryYPos, { align: "right" });
    summaryYPos += 12;
  } else {
    pdf.text("CGST:", summaryX + 10, summaryYPos);
    pdf.text(`₹${summary.cgst.toFixed(2)}`, summaryX + summaryWidth - 15, summaryYPos, { align: "right" });
    summaryYPos += 12;
    pdf.text("SGST:", summaryX + 10, summaryYPos);
    pdf.text(`₹${summary.sgst.toFixed(2)}`, summaryX + summaryWidth - 15, summaryYPos, { align: "right" });
    summaryYPos += 12;
  }
  
  // Total amount with enhanced styling
  pdf.setFillColor(41, 98, 255);
  pdf.rect(summaryX, summaryYPos - 5, summaryWidth, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("TOTAL:", summaryX + 10, summaryYPos + 8);
  pdf.text(`₹${summary.total.toFixed(2)}`, summaryX + summaryWidth - 15, summaryYPos + 8, { align: "right" });
  
  pdf.setTextColor(0, 0, 0);
  
  // Amount in words - Enhanced positioning
  yPos = Math.max(yPos + summaryHeight + 20, summaryYPos + 30);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  const amountInWords = numberToWords(Math.floor(summary.total));
  const wordsText = `Amount in words: ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only`;
  
  pdf.setFillColor(252, 252, 252);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
  pdf.setDrawColor(230, 230, 230);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 20);
  
  const splitText = pdf.splitTextToSize(wordsText, pageWidth - 2 * margin - 10);
  pdf.text(splitText, margin + 5, yPos + 12);
  yPos += 25;
  
  // Notes section - Enhanced if present
  if (formData.notes && formData.notes.trim()) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOTES:", margin, yPos);
    yPos += 12;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    pdf.setFillColor(252, 252, 252);
    const notesHeight = Math.min(30, (formData.notes.length / 80) * 8 + 10);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, notesHeight, 'F');
    
    const notesSplit = pdf.splitTextToSize(formData.notes.trim(), pageWidth - 2 * margin - 10);
    pdf.text(notesSplit, margin + 5, yPos + 8);
    yPos += notesHeight + 10;
  }
  
  // Professional footer
  const footerY = pageHeight - 12;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("This is a computer generated invoice.", pageWidth / 2, footerY, { align: "center" });
  
  // Download with professional naming
  const fileName = `Invoice_${formData.invoiceNumber}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  pdf.save(fileName);
};
