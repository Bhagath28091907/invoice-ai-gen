
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceFormData, InvoiceSummary, ENTERPRISE_DETAILS } from "@/types/invoice";
import { numberToWords } from "./invoice-calculations";
import { supabase } from "@/integrations/supabase/client";

export const generateInvoicePDF = async (
  formData: InvoiceFormData,
  summary: InvoiceSummary,
  userId?: string
): Promise<boolean> => {
  console.log("Starting PDF generation with data:", { formData, summary, userId });
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 10; // Minimal margin for maximum space
  let yPos = 20;

  // Minimal Header - Shrunk
  pdf.setFillColor(41, 98, 255);
  pdf.rect(0, 0, pageWidth, 12, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("TAX INVOICE", pageWidth / 2, 8, { align: "center" });
  
  // Compact layout - using full width efficiently
  yPos = 16;
  const leftColWidth = (pageWidth * 0.65) - margin;
  const rightColX = pageWidth * 0.68;
  const rightColWidth = (pageWidth * 0.32) - margin;

  // Enterprise Information (Left) - Compact
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, yPos, leftColWidth, 48, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, leftColWidth, 48);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL FROM:", margin + 2, yPos + 6);
  
  // Enterprise Details - Layout matching the screenshot
  // Business Name
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Business Name", margin + 2, yPos + 14);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.businessName, margin + 2, yPos + 20);
  
  // Address
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Address", margin + 2, yPos + 28);
  
  pdf.setFontSize(7);
  pdf.text(ENTERPRISE_DETAILS.businessAddress, margin + 2, yPos + 34);
  
  // Phone and State in same row
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Phone", margin + 2, yPos + 42);
  pdf.text("State", margin + 80, yPos + 42);
  
  pdf.setFontSize(7);
  pdf.text(ENTERPRISE_DETAILS.businessPhone, margin + 2, yPos + 48);
  pdf.text("Karnataka", margin + 80, yPos + 48);
  
  // GST Number and Food License in same row
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("GST Number", margin + 2, yPos + 52);
  pdf.text("Food License", margin + 80, yPos + 52);
  
  pdf.setFontSize(6);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.gstNumber, margin + 2, yPos + 57);
  pdf.text(ENTERPRISE_DETAILS.foodLicenseNumber, margin + 80, yPos + 57);

  // Invoice info on the right - simplified
  pdf.setFillColor(41, 98, 255);
  pdf.rect(rightColX, yPos, rightColWidth, 25, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("TAX INVOICE", rightColX + 2, yPos + 8);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.text("Date:", rightColX + 2, yPos + 16);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(new Date().toLocaleDateString('en-IN'), rightColX + 2, yPos + 20);

  // Customer Information - Below enterprise info, same alignment
  yPos += 55;
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(248, 248, 248);
  pdf.rect(margin, yPos, leftColWidth, 28, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, leftColWidth, 28);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", margin + 2, yPos + 6);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.clientName.toUpperCase(), margin + 2, yPos + 14);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  
  const clientAddressLines = formData.clientAddress.split('\n');
  let clientYPos = yPos + 18;
  clientAddressLines.forEach((line) => {
    if (line.trim() && clientYPos < yPos + 22) {
      pdf.text(line.trim(), margin + 2, clientYPos);
      clientYPos += 3;
    }
  });
  
  if (formData.clientPhone && clientYPos < yPos + 25) {
    pdf.text(`Phone: ${formData.clientPhone}`, margin + 2, clientYPos);
  }

  // Items Table - Compact with Items Left column
  yPos += 32;
  const tableWidth = pageWidth - 2 * margin;
  const colWidths = {
    serial: tableWidth * 0.08,
    description: tableWidth * 0.30,
    qty: tableWidth * 0.08,
    rate: tableWidth * 0.12,
    gst: tableWidth * 0.08,
    amount: tableWidth * 0.20,
    itemsLeft: tableWidth * 0.14
  };

  // Compact table header
  pdf.setFillColor(41, 98, 255);
  pdf.rect(margin, yPos, tableWidth, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("S.No", margin + 2, yPos + 8);
  pdf.text("DESCRIPTION", margin + colWidths.serial + 2, yPos + 8);
  pdf.text("QTY", margin + colWidths.serial + colWidths.description + 2, yPos + 8);
  pdf.text("RATE (₹)", margin + colWidths.serial + colWidths.description + colWidths.qty + 2, yPos + 8);
  pdf.text("GST%", margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + 2, yPos + 8);
  pdf.text("AMOUNT (₹)", margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 2, yPos + 8);
  pdf.text("ITEMS LEFT", margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + colWidths.amount + 2, yPos + 8);

  // Table content - Compact rows
  yPos += 12;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  
  formData.items.forEach((item, index) => {
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Minimal row background
    if (index % 2 === 0) {
      pdf.setFillColor(252, 252, 252);
      pdf.rect(margin, yPos, tableWidth, 10, 'F');
    }
    
    // Thin row borders
    pdf.setDrawColor(240, 240, 240);
    pdf.rect(margin, yPos, tableWidth, 10);
    
    // Compact item details with serial number and items left
    const description = item.description.length > 28 ? 
      item.description.substring(0, 28) + '...' : item.description;
    
    pdf.text((index + 1).toString(), margin + 4, yPos + 7, { align: "center" });
    pdf.text(description, margin + colWidths.serial + 2, yPos + 7);
    pdf.text(item.quantity.toString(), margin + colWidths.serial + colWidths.description + 4, yPos + 7, { align: "center" });
    pdf.text(item.rate.toFixed(2), margin + colWidths.serial + colWidths.description + colWidths.qty + 8, yPos + 7, { align: "right" });
    pdf.text(`${item.gstRate}%`, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + 4, yPos + 7, { align: "center" });
    pdf.text(item.totalAmount.toFixed(2), margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 20, yPos + 7, { align: "right" });
    pdf.text(item.itemsLeft || "-", margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + colWidths.amount + 8, yPos + 7, { align: "center" });
    
    yPos += 10;
  });

  // Summary as additional row in table format
  yPos += 5;
  
  // Summary row header
  pdf.setFillColor(248, 248, 248);
  pdf.rect(margin, yPos, tableWidth, 8, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, tableWidth, 8);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("SUMMARY", margin + 2, yPos + 6);
  yPos += 8;
  
  // Subtotal row
  pdf.setFillColor(252, 252, 252);
  pdf.rect(margin, yPos, tableWidth, 8, 'F');
  pdf.setDrawColor(230, 230, 230);
  pdf.rect(margin, yPos, tableWidth, 8);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Subtotal", margin + colWidths.serial + 2, yPos + 6);
  pdf.text(`₹${summary.subtotal.toFixed(2)}`, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 20, yPos + 6, { align: "right" });
  yPos += 8;
  
  // GST rows
  if (summary.isInterstate) {
    pdf.rect(margin, yPos, tableWidth, 8);
    pdf.text("IGST", margin + colWidths.serial + 2, yPos + 6);
    pdf.text(`₹${summary.igst.toFixed(2)}`, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 20, yPos + 6, { align: "right" });
    yPos += 8;
  } else {
    pdf.rect(margin, yPos, tableWidth, 8);
    pdf.text("CGST", margin + colWidths.serial + 2, yPos + 6);
    pdf.text(`₹${summary.cgst.toFixed(2)}`, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 20, yPos + 6, { align: "right" });
    yPos += 8;
    
    pdf.rect(margin, yPos, tableWidth, 8);
    pdf.text("SGST", margin + colWidths.serial + 2, yPos + 6);
    pdf.text(`₹${summary.sgst.toFixed(2)}`, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 20, yPos + 6, { align: "right" });
    yPos += 8;
  }
  
  // Total row
  pdf.setFillColor(41, 98, 255);
  pdf.rect(margin, yPos, tableWidth, 10, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("TOTAL", margin + colWidths.serial + 2, yPos + 7);
  pdf.text(`₹${summary.total.toFixed(2)}`, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + 20, yPos + 7, { align: "right" });
  yPos += 15;
  
  // Client Signature - beneath total
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Client Signature:", margin + colWidths.serial + colWidths.description, yPos);
  
  // Signature line
  const sigLineY = yPos + 12;
  pdf.setDrawColor(100, 100, 100);
  pdf.line(margin + colWidths.serial + colWidths.description, sigLineY, margin + colWidths.serial + colWidths.description + 80, sigLineY);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Sign & Date", margin + colWidths.serial + colWidths.description, sigLineY + 8);
  
  pdf.setTextColor(0, 0, 0);
  
  // Amount in words - after signature
  yPos += 15;
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
  
  console.log("About to enter try block for saving/downloading");
  try {
    console.log("Inside try block, checking if user is logged in:", { userId });
    // Save to database if user is logged in
    if (userId) {
      console.log("User is logged in, attempting to save to database");
      const invoiceNumber = `INV-${Date.now()}`;
      await supabase.from('invoices').insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        business_name: ENTERPRISE_DETAILS.businessName,
        client_name: formData.clientName,
        total_amount: summary.total,
        invoice_data: JSON.parse(JSON.stringify({
          formData,
          summary,
          createdAt: new Date().toISOString()
        }))
      });
      console.log("Successfully saved to database");
    } else {
      console.log("No user logged in, skipping database save");
    }

    // Also store in localStorage for backward compatibility
    const invoiceData = {
      id: `INV-${Date.now()}`,
      clientName: formData.clientName,
      date: new Date().toISOString().split('T')[0],
      total: summary.total,
      createdAt: new Date().toISOString()
    };
    
    const existingInvoices = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    const updatedInvoices = [invoiceData, ...existingInvoices];
    localStorage.setItem('invoiceHistory', JSON.stringify(updatedInvoices));
    
    // Download
    const fileName = `Invoice_${Date.now()}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log("About to download PDF with filename:", fileName);
    pdf.save(fileName);
    console.log("PDF download initiated successfully");
    
    return true;
  } catch (error) {
    console.error('Error saving invoice:', error);
    
    // Still download the PDF even if saving fails
    const fileName = `Invoice_${Date.now()}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(fileName);
    
    return false;
  }
};
