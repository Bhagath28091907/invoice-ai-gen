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
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("TAX INVOICE", pageWidth / 2, 20, { align: "center" });
  
  // Business Information
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("From:", 20, 40);
  pdf.setFont("helvetica", "normal");
  pdf.text(formData.businessName, 20, 50);
  pdf.text(`GSTIN: ${formData.gstin}`, 20, 60);
  
  const businessAddressLines = formData.businessAddress.split('\n');
  let yPos = 70;
  businessAddressLines.forEach((line) => {
    pdf.text(line, 20, yPos);
    yPos += 10;
  });
  
  // Client Information
  pdf.setFont("helvetica", "bold");
  pdf.text("To:", 20, yPos + 10);
  yPos += 20;
  pdf.setFont("helvetica", "normal");
  pdf.text(formData.clientName, 20, yPos);
  yPos += 10;
  if (formData.clientGstin) {
    pdf.text(`GSTIN: ${formData.clientGstin}`, 20, yPos);
    yPos += 10;
  }
  
  const clientAddressLines = formData.clientAddress.split('\n');
  clientAddressLines.forEach((line) => {
    pdf.text(line, 20, yPos);
    yPos += 10;
  });
  
  // Invoice Details (Right side)
  pdf.setFont("helvetica", "bold");
  pdf.text(`Invoice No: ${formData.invoiceNumber}`, pageWidth - 100, 50);
  pdf.text(`Date: ${formData.invoiceDate}`, pageWidth - 100, 60);
  if (formData.dueDate) {
    pdf.text(`Due Date: ${formData.dueDate}`, pageWidth - 100, 70);
  }
  
  // Items Table
  yPos += 20;
  const tableStartY = yPos;
  
  // Table headers
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", 20, tableStartY);
  pdf.text("Qty", 80, tableStartY);
  pdf.text("Rate", 100, tableStartY);
  pdf.text("GST%", 120, tableStartY);
  pdf.text("Amount", 140, tableStartY);
  pdf.text("GST Amt", 165, tableStartY);
  pdf.text("Total", 185, tableStartY);
  
  // Table line
  pdf.line(20, tableStartY + 5, pageWidth - 20, tableStartY + 5);
  
  // Table rows
  pdf.setFont("helvetica", "normal");
  yPos = tableStartY + 15;
  
  formData.items.forEach((item) => {
    pdf.text(item.description, 20, yPos);
    pdf.text(item.quantity.toString(), 80, yPos);
    pdf.text(`₹${item.rate.toFixed(2)}`, 100, yPos);
    pdf.text(`${item.gstRate}%`, 120, yPos);
    pdf.text(`₹${item.amount.toFixed(2)}`, 140, yPos);
    pdf.text(`₹${item.gstAmount.toFixed(2)}`, 165, yPos);
    pdf.text(`₹${item.totalAmount.toFixed(2)}`, 185, yPos);
    yPos += 10;
  });
  
  // Table bottom line
  pdf.line(20, yPos + 5, pageWidth - 20, yPos + 5);
  
  // Summary
  yPos += 20;
  pdf.setFont("helvetica", "bold");
  pdf.text(`Subtotal: ₹${summary.subtotal.toFixed(2)}`, pageWidth - 100, yPos);
  yPos += 10;
  
  if (summary.isInterstate) {
    pdf.text(`IGST: ₹${summary.igst.toFixed(2)}`, pageWidth - 100, yPos);
    yPos += 10;
  } else {
    pdf.text(`CGST: ₹${summary.cgst.toFixed(2)}`, pageWidth - 100, yPos);
    yPos += 10;
    pdf.text(`SGST: ₹${summary.sgst.toFixed(2)}`, pageWidth - 100, yPos);
    yPos += 10;
  }
  
  pdf.setFontSize(14);
  pdf.text(`Total: ₹${summary.total.toFixed(2)}`, pageWidth - 100, yPos);
  
  // Amount in words
  yPos += 20;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const amountInWords = numberToWords(Math.floor(summary.total));
  pdf.text(`Amount in words: ${amountInWords} rupees only`, 20, yPos);
  
  // Notes
  if (formData.notes) {
    yPos += 20;
    pdf.setFont("helvetica", "bold");
    pdf.text("Notes:", 20, yPos);
    yPos += 10;
    pdf.setFont("helvetica", "normal");
    const notesLines = formData.notes.split('\n');
    notesLines.forEach((line) => {
      pdf.text(line, 20, yPos);
      yPos += 10;
    });
  }
  
  // Footer
  pdf.setFontSize(8);
  pdf.text("This is a computer generated invoice", pageWidth / 2, pageHeight - 20, { align: "center" });
  
  // Download the PDF
  pdf.save(`Invoice-${formData.invoiceNumber}.pdf`);
};