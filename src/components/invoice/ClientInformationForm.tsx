import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister } from "react-hook-form";
import { InvoiceFormData } from "@/types/invoice";

interface ClientInformationFormProps {
  register: UseFormRegister<InvoiceFormData>;
}

export const ClientInformationForm = ({ register }: ClientInformationFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Customer Name *</Label>
          <Input 
            id="clientName" 
            placeholder="Enter customer name" 
            {...register("clientName", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientAddress">Customer Address *</Label>
          <Textarea 
            id="clientAddress" 
            placeholder="Enter complete customer address" 
            rows={3} 
            {...register("clientAddress", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientPhone">Customer Phone *</Label>
          <Input 
            id="clientPhone" 
            placeholder="Enter customer phone number" 
            {...register("clientPhone", { required: true })}
          />
        </div>
      </CardContent>
    </Card>
  );
};