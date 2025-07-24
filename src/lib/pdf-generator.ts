
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
  const margin = 10; // Minimal margin for maximum space
  let yPos = 20;

  // Minimal Header
  pdf.setFillColor(41, 98, 255);
  pdf.rect(0, 0, pageWidth, 16, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("TAX INVOICE", pageWidth / 2, 11, { align: "center" });
  
  // Compact layout - using full width efficiently
  yPos = 20;
  const leftColWidth = (pageWidth * 0.65) - margin;
  const rightColX = pageWidth * 0.68;
  const rightColWidth = (pageWidth * 0.32) - margin;

  // Business Information (Left) - Compact
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, yPos, leftColWidth, 45, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, leftColWidth, 45);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL FROM:", margin + 2, yPos + 6);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.businessName.toUpperCase(), margin + 2, yPos + 14);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text(`GSTIN: ${formData.gstin}`, margin + 2, yPos + 21);
  
  const businessAddressLines = formData.businessAddress.split('\n');
  let businessYPos = yPos + 27;
  businessAddressLines.forEach((line) => {
    if (line.trim() && businessYPos < yPos + 42) {
      pdf.text(line.trim(), margin + 2, businessYPos);
      businessYPos += 5;
    }
  });

  // Invoice Details (Right) - Compact
  const invoiceBoxHeight = formData.dueDate ? 40 : 32;
  pdf.setFillColor(41, 98, 255);
  pdf.rect(rightColX, yPos, rightColWidth, invoiceBoxHeight, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("INVOICE DETAILS", rightColX + 2, yPos + 6);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.text("Invoice No:", rightColX + 2, yPos + 11);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(formData.invoiceNumber, rightColX + 2, yPos + 15);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.text("Date:", rightColX + 2, yPos + 20);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(new Date(formData.invoiceDate).toLocaleDateString('en-IN'), rightColX + 2, yPos + 24);
  
  if (formData.dueDate) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.text("Due Date:", rightColX + 2, yPos + 29);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text(new Date(formData.dueDate).toLocaleDateString('en-IN'), rightColX + 2, yPos + 33);
  }

  // Client Information - Compact
  yPos += 50;
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(248, 248, 248);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 35);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", margin + 2, yPos + 6);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.clientName.toUpperCase(), margin + 2, yPos + 14);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  if (formData.clientGstin) {
    pdf.text(`GSTIN: ${formData.clientGstin}`, margin + 2, yPos + 21);
  }
  
  const clientAddressLines = formData.clientAddress.split('\n');
  let clientYPos = yPos + (formData.clientGstin ? 26 : 20);
  clientAddressLines.forEach((line) => {
    if (line.trim() && clientYPos < yPos + 32) {
      pdf.text(line.trim(), margin + 2, clientYPos);
      clientYPos += 4;
    }
  });

  // Items Table - Compact
  yPos += 40;
  const tableWidth = pageWidth - 2 * margin;
  const colWidths = {
    description: tableWidth * 0.45,
    qty: tableWidth * 0.08,
    rate: tableWidth * 0.15,
    gst: tableWidth * 0.08,
    amount: tableWidth * 0.24
  };

  // Compact table header
  pdf.setFillColor(41, 98, 255);
  pdf.rect(margin, yPos, tableWidth, 14, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("DESCRIPTION", margin + 2, yPos + 9);
  pdf.text("QTY", margin + colWidths.description + 2, yPos + 9);
  pdf.text("RATE (₹)", margin + colWidths.description + colWidths.qty + 2, yPos + 9);
  pdf.text("GST%", margin + colWidths.description + colWidths.qty + colWidths.rate + 2, yPos + 9);
  pdf.text("AMOUNT (₹)", margin + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 2, yPos + 9);

  // Table content - Compact rows
  yPos += 14;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  
  formData.items.forEach((item, index) => {
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Minimal row background
    if (index % 2 === 0) {
      pdf.setFillColor(252, 252, 252);
      pdf.rect(margin, yPos, tableWidth, 12, 'F');
    }
    
    // Thin row borders
    pdf.setDrawColor(240, 240, 240);
    pdf.rect(margin, yPos, tableWidth, 12);
    
    // Compact item details
    const description = item.description.length > 40 ? 
      item.description.substring(0, 40) + '...' : item.description;
    
    pdf.text(description, margin + 2, yPos + 8);
    pdf.text(item.quantity.toString(), margin + colWidths.description + 6, yPos + 8, { align: "center" });
    pdf.text(item.rate.toFixed(2), margin + colWidths.description + colWidths.qty + 12, yPos + 8, { align: "right" });
    pdf.text(`${item.gstRate}%`, margin + colWidths.description + colWidths.qty + colWidths.rate + 12, yPos + 8, { align: "center" });
    pdf.text(item.totalAmount.toFixed(2), margin + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 35, yPos + 8, { align: "right" });
    
    yPos += 12;
  });

  // Compact Summary Section
  yPos += 8;
  const summaryWidth = 100;
  const summaryX = pageWidth - summaryWidth - margin;
  
  pdf.setFillColor(250, 250, 250);
  const summaryHeight = summary.isInterstate ? 50 : 62;
  pdf.rect(summaryX, yPos, summaryWidth, summaryHeight, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(summaryX, yPos, summaryWidth, summaryHeight);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  
  let summaryYPos = yPos + 10;
  pdf.text("Subtotal:", summaryX + 5, summaryYPos);
  pdf.text(`₹${summary.subtotal.toFixed(2)}`, summaryX + summaryWidth - 8, summaryYPos, { align: "right" });
  summaryYPos += 10;
  
  if (summary.isInterstate) {
    pdf.text("IGST:", summaryX + 5, summaryYPos);
    pdf.text(`₹${summary.igst.toFixed(2)}`, summaryX + summaryWidth - 8, summaryYPos, { align: "right" });
    summaryYPos += 10;
  } else {
    pdf.text("CGST:", summaryX + 5, summaryYPos);
    pdf.text(`₹${summary.cgst.toFixed(2)}`, summaryX + summaryWidth - 8, summaryYPos, { align: "right" });
    summaryYPos += 10;
    pdf.text("SGST:", summaryX + 5, summaryYPos);
    pdf.text(`₹${summary.sgst.toFixed(2)}`, summaryX + summaryWidth - 8, summaryYPos, { align: "right" });
    summaryYPos += 10;
  }
  
  // Compact total
  pdf.setFillColor(41, 98, 255);
  pdf.rect(summaryX, summaryYPos - 2, summaryWidth, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("TOTAL:", summaryX + 5, summaryYPos + 8);
  pdf.text(`₹${summary.total.toFixed(2)}`, summaryX + summaryWidth - 8, summaryYPos + 8, { align: "right" });
  
  pdf.setTextColor(0, 0, 0);
  
  // Compact amount in words
  yPos = Math.max(yPos + summaryHeight + 12, summaryYPos + 20);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  const amountInWords = numberToWords(Math.floor(summary.total));
  const wordsText = `Amount in words: ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only`;
  
  pdf.setFillColor(248, 248, 248);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 15, 'F');
  pdf.setDrawColor(230, 230, 230);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 15);
  
  const splitText = pdf.splitTextToSize(wordsText, pageWidth - 2 * margin - 6);
  pdf.text(splitText, margin + 3, yPos + 9);
  yPos += 18;
  
  // Compact notes if present
  if (formData.notes && formData.notes.trim()) {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOTES:", margin, yPos);
    yPos += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    
    const notesHeight = 20;
    pdf.setFillColor(248, 248, 248);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, notesHeight, 'F');
    
    const notesSplit = pdf.splitTextToSize(formData.notes.trim(), pageWidth - 2 * margin - 6);
    pdf.text(notesSplit, margin + 3, yPos + 6);
    yPos += notesHeight + 5;
  }
  
  // Minimal footer
  const footerY = pageHeight - 10;
  pdf.setDrawColor(230, 230, 230);
  pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 120, 120);
  pdf.text("Computer generated invoice.", pageWidth / 2, footerY, { align: "center" });
  
  // Save to history before downloading
  const invoiceData = {
    id: formData.invoiceNumber,
    clientName: formData.clientName,
    date: formData.invoiceDate,
    total: summary.total,
    createdAt: new Date().toISOString()
  };
  
  // Store in localStorage for history
  const existingInvoices = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
  const updatedInvoices = [invoiceData, ...existingInvoices];
  localStorage.setItem('invoiceHistory', JSON.stringify(updatedInvoices));
  
  // Download
  const fileName = `Invoice_${formData.invoiceNumber}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  pdf.save(fileName);
};
