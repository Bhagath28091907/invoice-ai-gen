import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { InvoiceFormData } from "@/types/invoice";

interface InvoiceDetailsFormProps {
  register: UseFormRegister<InvoiceFormData>;
}

export const InvoiceDetailsForm = ({ register }: InvoiceDetailsFormProps) => {
  // Generate auto invoice number
  const generateInvoiceNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input 
              id="invoiceNumber" 
              placeholder="INV-001"
              defaultValue={generateInvoiceNumber()}
              {...register("invoiceNumber", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date *</Label>
            <Input 
              id="invoiceDate" 
              type="date"
              defaultValue={getTodayDate()}
              {...register("invoiceDate", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input 
              id="dueDate" 
              type="date"
              {...register("dueDate")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};