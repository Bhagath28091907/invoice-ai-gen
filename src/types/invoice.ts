export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
  amount: number;
  gstAmount: number;
  totalAmount: number;
}

export interface InvoiceFormData {
  // Business Information
  businessName: string;
  businessAddress: string;
  businessState: string;
  businessPhone: string;
  
  // Client Information
  clientName: string;
  clientAddress: string;
  clientState: string;
  clientPhone: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Notes
  notes?: string;
}

export interface InvoiceSummary {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isInterstate: boolean;
}