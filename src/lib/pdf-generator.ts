
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
  const pdf = new jsPDF({
    format: 'a5',
    unit: 'mm'
  });
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 8; // Minimal margin for A5 size
  let yPos = 15;

  // Header
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("TAX INVOICE", pageWidth / 2, 12, { align: "center" });
  
  // Full width layout
  yPos = 18;
  const fullWidth = pageWidth - 2 * margin;

  // Enterprise Information - Full width with date in corner
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, yPos, fullWidth, 42, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, fullWidth, 42);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL FROM:", margin + 2, yPos + 5);
  
  // Enterprise Details - Compact layout
  // Business Name
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Business Name:", margin + 2, yPos + 10);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.businessName, margin + 2, yPos + 15);
  
  // Address
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Address:", margin + 2, yPos + 20);
  
  pdf.setFontSize(7);
  pdf.text(ENTERPRISE_DETAILS.businessAddress, margin + 2, yPos + 25);
  
  // Phone and State in same row
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Phone:", margin + 2, yPos + 30);
  pdf.text("State:", margin + 50, yPos + 30);
  
  pdf.setFontSize(7);
  pdf.text(ENTERPRISE_DETAILS.businessPhone, margin + 15, yPos + 30);
  pdf.text("Karnataka", margin + 62, yPos + 30);
  
  // GST Number and Food License in same row
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("GST No:", margin + 2, yPos + 35);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.gstNumber, margin + 17, yPos + 35);
  
  // Email
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Email:", margin + 2, yPos + 40);
  pdf.setFontSize(7);
  pdf.text("kalyanienterprises092025@gmail.com", margin + 15, yPos + 40);

  // Date in top right corner of BILL FROM box
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("Date:", pageWidth - margin - 30, yPos + 5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(new Date().toLocaleDateString('en-IN'), pageWidth - margin - 30, yPos + 11);

  // Customer Information - Below enterprise info, full width
  yPos += 44;
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(248, 248, 248);
  pdf.rect(margin, yPos, fullWidth, 26, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, fullWidth, 26);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", margin + 2, yPos + 6);
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(formData.clientName.toUpperCase(), margin + 2, yPos + 12);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  
  const clientAddressLines = formData.clientAddress.split('\n');
  let clientYPos = yPos + 17;
  clientAddressLines.forEach((line) => {
    if (line.trim() && clientYPos < yPos + 21) {
      pdf.text(line.trim(), margin + 2, clientYPos);
      clientYPos += 3;
    }
  });
  
  if (formData.clientPhone && clientYPos < yPos + 23) {
    pdf.text(`Phone: ${formData.clientPhone}`, margin + 2, clientYPos);
  }

  // Items Table - Compact with Items Left column
  yPos += 28;
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

  // Precompute Amount column edges for consistent alignment
  const amountStartX = margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst;
  const amountRightX = amountStartX + colWidths.amount - 2;

  // Table header with black borders (Excel style)
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPos, tableWidth, 10);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("S.No", margin + 2, yPos + 7);
  pdf.text("DESCRIPTION", margin + colWidths.serial + 2, yPos + 7);
  pdf.text("QTY", margin + colWidths.serial + colWidths.description + 2, yPos + 7);
  pdf.text("RATE", margin + colWidths.serial + colWidths.description + colWidths.qty + 2, yPos + 7);
  pdf.text("GST%", margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + 2, yPos + 7);
  pdf.text("AMOUNT", amountRightX, yPos + 7, { align: "right" });
  pdf.text("ITEMS LEFT", margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + colWidths.amount + 2, yPos + 7);

  // Table content - Compact rows
  yPos += 10;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  
  formData.items.forEach((item, index) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 25;
    }
    
    // Black borders for each row (Excel style)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPos, tableWidth, 9);
    
    // Compact item details with serial number and items left
    const description = item.description.length > 18 ? 
      item.description.substring(0, 18) + '...' : item.description;
    
    pdf.text((index + 1).toString(), margin + colWidths.serial / 2, yPos + 6, { align: "center" });
    pdf.text(description, margin + colWidths.serial + 2, yPos + 6);
    pdf.text(item.quantity.toString(), margin + colWidths.serial + colWidths.description + colWidths.qty / 2, yPos + 6, { align: "center" });
    pdf.text(item.rate.toFixed(2), margin + colWidths.serial + colWidths.description + colWidths.qty + 2, yPos + 6, { align: "left" });
    pdf.text(`${item.gstRate}%`, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst / 2, yPos + 6, { align: "center" });
    pdf.text(item.totalAmount.toFixed(2), amountRightX, yPos + 6, { align: "right" });
    // Items left column
    if (item.itemsLeft) {
      pdf.text(item.itemsLeft, margin + colWidths.serial + colWidths.description + colWidths.qty + colWidths.rate + colWidths.gst + colWidths.amount + colWidths.itemsLeft / 2, yPos + 6, { align: "center" });
    }
    
    yPos += 9;
  });

  // Total row only (removed subtotal, CGST, SGST) - aligned under amount column
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPos, tableWidth, 9);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("TOTAL", margin + colWidths.serial + 2, yPos + 6);
  pdf.text(summary.total.toFixed(2), amountRightX, yPos + 6, { align: "right" });
  yPos += 12;
  
  // Signature section - Client Signature on left, Authorised Signatory on right
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  
  // Client Signature - left side
  pdf.text("Client Signature:", margin + 5, yPos);
  
  // Client signature line
  const clientSigLineY = yPos + 10;
  pdf.setDrawColor(100, 100, 100);
  pdf.line(margin + 5, clientSigLineY, margin + 45, clientSigLineY);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Sign & Date", margin + 5, clientSigLineY + 5);
  
  // Authorised Signatory - right side
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  const authSignX = pageWidth - margin - 50;
  pdf.text("Authorised Signatory:", authSignX, yPos);
  
  // Authorised signature line
  pdf.setDrawColor(100, 100, 100);
  pdf.line(authSignX, clientSigLineY, authSignX + 45, clientSigLineY);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Sign & Date", authSignX, clientSigLineY + 5);
  
  pdf.setTextColor(0, 0, 0);
  yPos = clientSigLineY + 8;
  
  // Amount in words - after signature
  yPos += 8;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "italic");
  const amountInWords = numberToWords(Math.floor(summary.total));
  const wordsText = `Amount in words: ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only`;
  
  pdf.setFillColor(248, 248, 248);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 13, 'F');
  pdf.setDrawColor(230, 230, 230);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 13);
  
  const splitText = pdf.splitTextToSize(wordsText, pageWidth - 2 * margin - 4);
  pdf.text(splitText, margin + 2, yPos + 8);
  yPos += 16;
  
  // Compact notes if present
  if (formData.notes && formData.notes.trim()) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOTES:", margin, yPos);
    yPos += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    
    const notesHeight = 18;
    pdf.setFillColor(248, 248, 248);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, notesHeight, 'F');
    
    const notesSplit = pdf.splitTextToSize(formData.notes.trim(), pageWidth - 2 * margin - 4);
    pdf.text(notesSplit, margin + 2, yPos + 5);
    yPos += notesHeight + 4;
  }
  
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
