import { InvoiceItem, InvoiceSummary } from "@/types/invoice";

export const calculateItemAmounts = (item: Partial<InvoiceItem>): InvoiceItem => {
  const quantity = item.quantity || 0;
  const rate = item.rate || 0;
  const gstRate = item.gstRate || 0;
  
  const amount = quantity * rate;
  const gstAmount = (amount * gstRate) / 100;
  const totalAmount = amount + gstAmount;
  
  return {
    id: item.id || "",
    description: item.description || "",
    quantity,
    rate,
    gstRate,
    amount,
    gstAmount,
    totalAmount,
  };
};

export const calculateInvoiceSummary = (
  items: InvoiceItem[],
  businessState: string,
  clientState: string
): InvoiceSummary => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalGst = items.reduce((sum, item) => sum + item.gstAmount, 0);
  
  const isInterstate = businessState !== clientState;
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (isInterstate) {
    igst = totalGst;
  } else {
    cgst = totalGst / 2;
    sgst = totalGst / 2;
  }
  
  const total = subtotal + totalGst;
  
  return {
    subtotal,
    cgst,
    sgst,
    igst,
    total,
    isInterstate,
  };
};

export const numberToWords = (num: number): string => {
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];
  
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];
  
  const convertHundreds = (n: number): string => {
    let result = "";
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " hundred ";
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    
    if (n > 0) {
      result += ones[n] + " ";
    }
    
    return result;
  };
  
  if (num === 0) return "zero";
  
  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = num % 1000;
  
  let result = "";
  
  if (crores > 0) {
    result += convertHundreds(crores) + "crore ";
  }
  
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + "lakh ";
  }
  
  if (thousands > 0) {
    result += convertHundreds(thousands) + "thousand ";
  }
  
  if (hundreds > 0) {
    result += convertHundreds(hundreds);
  }
  
  return result.trim();
};