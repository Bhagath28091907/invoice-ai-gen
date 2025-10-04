export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
  itemsLeft?: string; // New field for items left
  amount: number;
  gstAmount: number;
  totalAmount: number;
}

// Fixed enterprise details
export const ENTERPRISE_DETAILS = {
  businessName: "Kalyani Enterprises",
  businessAddress: "Talur Road, Sreedharagadda, Ballari. PIN : 583103",
  businessState: "karnataka",
  businessPhone: "9900426623",
  gstNumber: "29EMLPM3821E1ZW",
  foodLicenseNumber: "20250930107794088"
};

export interface InvoiceFormData {
  // Client Information (removed state field)
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  
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