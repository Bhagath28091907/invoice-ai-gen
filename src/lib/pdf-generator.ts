
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceFormData, InvoiceSummary, ENTERPRISE_DETAILS } from "@/types/invoice";
import { numberToWords } from "./invoice-calculations";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/kalyani-logo.jpeg.asset.json";

const loadLogoDataUrl = async (): Promise<string | null> => {
  try {
    const res = await fetch(logoAsset.url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to load logo", e);
    return null;
  }
};


export const generateInvoicePDF = async (
  formData: InvoiceFormData,
  summary: InvoiceSummary,
  userId?: string
): Promise<boolean> => {
  console.log("Starting PDF generation with data:", { formData, summary, userId });
  
  // Get sequential invoice number
  let invoiceNumber = 1;
  try {
    if (userId) {
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      invoiceNumber = (count || 0) + 1;
    } else {
      // Fallback to localStorage count
      const existingInvoices = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
      invoiceNumber = existingInvoices.length + 1;
    }
  } catch (error) {
    console.error('Error getting invoice count:', error);
  }
  
  const pdf = new jsPDF({
    format: 'a5',
    unit: 'mm'
  });
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 8;
  let yPos = 8;

  // Invoice Number - Top Left
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Invoice No: ${invoiceNumber}`, margin, yPos);
  
  // Date - Top Right
  pdf.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, yPos, { align: "right" });
  
  // Header
  yPos = 15;
  pdf.setFontSize(14);
  pdf.text("TAX INVOICE", pageWidth / 2, yPos, { align: "center" });
  
  // Full width layout
  yPos = 20;
  const fullWidth = pageWidth - 2 * margin;


  // Enterprise Information - Full width (increased height for bank details)
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, yPos, fullWidth, 56, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(margin, yPos, fullWidth, 56);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL FROM:", margin + 2, yPos + 5);
  
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
  
  // Phone and State in one row
  pdf.setFontSize(8);
  pdf.text("Phone:", margin + 2, yPos + 30);
  pdf.text("State:", margin + 50, yPos + 30);
  
  pdf.setFontSize(7);
  pdf.text(ENTERPRISE_DETAILS.businessPhone, margin + 13, yPos + 30);
  pdf.text("Karnataka", margin + 59, yPos + 30);
  
  // GST Number and Food License in same row
  pdf.setFontSize(8);
  pdf.text("GST No:", margin + 2, yPos + 35);
  pdf.text("Food Lic:", margin + 50, yPos + 35);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.gstNumber, margin + 17, yPos + 35);
  pdf.text(ENTERPRISE_DETAILS.foodLicenseNumber, margin + 66, yPos + 35);
  
  // Vehicle Number - top right corner
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const vehicleX = pageWidth - margin - 45;
  pdf.text("Vehicle No:", vehicleX, yPos + 10);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.vehicleNumber, vehicleX + 20, yPos + 10);
  
  // Driver Name below Vehicle
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Driver Name:", vehicleX, yPos + 15);
  pdf.setFontSize(7);
  pdf.text("Maruthi N", vehicleX + 22, yPos + 15);
  
  // Email
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Email:", margin + 2, yPos + 40);
  pdf.setFontSize(7);
  pdf.text(ENTERPRISE_DETAILS.businessEmail, margin + 15, yPos + 40);
  
  // Bank Details Section (three clean columns with tidy spacing)
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("Bank Details:", margin + 2, yPos + 45);

  const bankRowY = yPos + 50;
  const bankCol1 = margin + 2;
  const bankCol2 = margin + fullWidth / 3;
  const bankCol3 = margin + (2 * fullWidth) / 3;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  // labels
  pdf.text("Bank Name:", bankCol1, bankRowY);
  pdf.text("Account No.:", bankCol2, bankRowY);
  pdf.text("IFSC Code:", bankCol3, bankRowY);

  // values (bold) with a small gap after labels
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.bankName, bankCol1 + pdf.getTextWidth("Bank Name:") + 2, bankRowY);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.accountNumber, bankCol2 + pdf.getTextWidth("Account No.:") + 2, bankRowY);
  pdf.setFont("helvetica", "bold");
  pdf.text(ENTERPRISE_DETAILS.ifscCode, bankCol3 + pdf.getTextWidth("IFSC Code:") + 2, bankRowY);

  // Customer Information
  yPos += 58;
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
    clientYPos += 3;
  }
  
  if (formData.clientGstNumber && clientYPos < yPos + 26) {
    pdf.text(`GST No: ${formData.clientGstNumber}`, margin + 2, clientYPos);
  }

  // Items Table with HSN and UOM columns
  yPos += 28;
  const tableWidth = pageWidth - 2 * margin;
  const colWidths = {
    serial: tableWidth * 0.07,
    description: tableWidth * 0.29,
    hsn: tableWidth * 0.13,
    qty: tableWidth * 0.08,
    uom: tableWidth * 0.08,
    rate: tableWidth * 0.11,
    gst: tableWidth * 0.08,
    amount: tableWidth * 0.16,
  };

  // Precompute Amount column edges
  const amountStartX = margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty + colWidths.uom + colWidths.rate + colWidths.gst;
  const amountRightX = amountStartX + colWidths.amount - 2;

  // Table header
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPos, tableWidth, 10);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("S.No", margin + 2, yPos + 7);
  pdf.text("DESCRIPTION", margin + colWidths.serial + 2, yPos + 7);
  pdf.text("HSN", margin + colWidths.serial + colWidths.description + 2, yPos + 7);
  pdf.text("QTY", margin + colWidths.serial + colWidths.description + colWidths.hsn + 2, yPos + 7);
  pdf.text("UOM", margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty + 2, yPos + 7);
  pdf.text("RATE", margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty + colWidths.uom + 2, yPos + 7);
  pdf.text("GST%", margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty + colWidths.uom + colWidths.rate + 2, yPos + 7);
  pdf.text("AMOUNT", amountRightX, yPos + 7, { align: "right" });

  // Table content
  yPos += 10;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  
  formData.items.forEach((item, index) => {
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 25;
    }

    // Split long descriptions and compute dynamic row height
    const descX = margin + colWidths.serial + 2;
    const descMaxWidth = colWidths.description - 4;
    const descLines = pdf.splitTextToSize(item.description || "", descMaxWidth);
    const lineHeight = 3.5;
    const rowHeight = Math.max(9, descLines.length * lineHeight + 2);

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPos, tableWidth, rowHeight);

    const baseY = yPos + 5;

    // S. No
    pdf.text((index + 1).toString(), margin + colWidths.serial / 2, baseY, { align: "center" });
    // Description (multi-line)
    pdf.text(descLines, descX, baseY);
    // HSN
    pdf.text(item.hsnCode || "", margin + colWidths.serial + colWidths.description + 2, baseY);
    // Qty
    pdf.text(item.quantity.toString(), margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty / 2, baseY, { align: "center" });
    // UOM
    pdf.text(item.uom || "BOX", margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty + colWidths.uom / 2, baseY, { align: "center" });
    // Rate
    pdf.text(item.rate.toFixed(2), margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty + colWidths.uom + 2, baseY);
    // GST%
    pdf.text(`${item.gstRate}%`, margin + colWidths.serial + colWidths.description + colWidths.hsn + colWidths.qty + colWidths.uom + colWidths.rate + colWidths.gst / 2, baseY, { align: "center" });
    // Amount (right aligned)
    pdf.text(item.totalAmount.toFixed(2), amountRightX, baseY, { align: "right" });

    yPos += rowHeight;
  });

  // Total row with proper ordering and spacing: TOTAL | CGST/SGST ... | Final amount
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);
  const totalRowHeight = 9;
  pdf.rect(margin, yPos, tableWidth, totalRowHeight);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);

  // Left: TOTAL label
  const totalLabelX = margin + 2;
  const totalLabelY = yPos + 6;
  pdf.text("TOTAL", totalLabelX, totalLabelY);

  // Middle: CGST/SGST (or IGST) with better spacing
  const cgstX = margin + tableWidth * 0.38;
  const sgstX = margin + tableWidth * 0.64;
  if (summary.isInterstate) {
    pdf.text(`IGST: ${summary.igst.toFixed(2)}`, cgstX, totalLabelY);
  } else {
    pdf.text(`CGST: ${summary.cgst.toFixed(2)}`, cgstX, totalLabelY);
    pdf.text(`SGST: ${summary.sgst.toFixed(2)}`, sgstX, totalLabelY);
  }

  // Right: Final amount aligned to the right edge of the Amount column
  pdf.text(summary.total.toFixed(2), amountRightX, totalLabelY, { align: "right" });
  yPos += totalRowHeight + 3;

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
      const invoiceNumberStr = invoiceNumber.toString();
      await supabase.from('invoices').insert({
        user_id: userId,
        invoice_number: invoiceNumberStr,
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

    // Also store in localStorage
    const invoiceData = {
      id: invoiceNumber.toString(),
      clientName: formData.clientName,
      date: new Date().toISOString().split('T')[0],
      total: summary.total,
      createdAt: new Date().toISOString()
    };
    
    const existingInvoices = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    const updatedInvoices = [invoiceData, ...existingInvoices];
    localStorage.setItem('invoiceHistory', JSON.stringify(updatedInvoices));
    
    // Download
    const fileName = `Invoice_${invoiceNumber}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log("About to download PDF with filename:", fileName);
    pdf.save(fileName);
    console.log("PDF download initiated successfully");
    
    return true;
  } catch (error) {
    console.error('Error saving invoice:', error);
    
    // Still download the PDF even if saving fails
    const fileName = `Invoice_${invoiceNumber}_${formData.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(fileName);
    
    return false;
  }
};
