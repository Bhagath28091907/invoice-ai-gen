import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster } from "@/components/ui/toaster";
import { BusinessInformationForm } from "@/components/invoice/BusinessInformationForm";
import { ClientInformationForm } from "@/components/invoice/ClientInformationForm";
import { InvoiceDetailsForm } from "@/components/invoice/InvoiceDetailsForm";
import { ItemsForm } from "@/components/invoice/ItemsForm";
import { InvoiceSummary } from "@/components/invoice/InvoiceSummary";
import { InvoiceFormData, InvoiceItem } from "@/types/invoice";
import { calculateInvoiceSummary } from "@/lib/invoice-calculations";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const invoiceSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  gstin: z.string().min(1, "GSTIN is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessState: z.string().min(1, "Business state is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientGstin: z.string().optional(),
  clientAddress: z.string().min(1, "Client address is required"),
  clientState: z.string().min(1, "Client state is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  items: z.array(z.any()).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

const CreateInvoice = () => {
  const { user, credits, isUnlimited, refreshCredits } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      rate: 0,
      gstRate: 0,
      amount: 0,
      gstAmount: 0,
      totalAmount: 0,
    },
  ]);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      businessName: "",
      gstin: "",
      businessAddress: "",
      businessState: "",
      clientName: "",
      clientGstin: "",
      clientAddress: "",
      clientState: "",
      invoiceNumber: "",
      invoiceDate: "",
      dueDate: "",
      items: [],
      notes: "",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Update items in form when items state changes
  useEffect(() => {
    setValue("items", items);
  }, [items, setValue]);

  // Calculate summary whenever items or states change
  const summary = calculateInvoiceSummary(
    items,
    watchedValues.businessState || "",
    watchedValues.clientState || ""
  );

  // Check if form is valid for PDF generation (removed credit requirement)
  const canGeneratePDF = isValid && items.length > 0 && items.some(item => 
    item.description && item.quantity > 0 && item.rate > 0
  );

  const handleGeneratePDF = async () => {
    console.log("Generate PDF clicked - Full Debug", { 
      isValid, 
      itemsLength: items.length, 
      itemsValid: items.some(item => item.description && item.quantity > 0 && item.rate > 0),
      isUnlimited, 
      credits,
      canGeneratePDF,
      formErrors: errors,
      watchedValues: watchedValues,
      items: items
    });
    
    // More detailed validation checks
    const requiredFields = ['businessName', 'gstin', 'businessAddress', 'businessState', 'clientName', 'clientAddress', 'clientState', 'invoiceNumber', 'invoiceDate'];
    const missingFields = requiredFields.filter(field => !watchedValues[field as keyof typeof watchedValues]);
    const validItems = items.filter(item => item.description && item.quantity > 0 && item.rate > 0);
    
    console.log("Detailed validation:", {
      missingFields,
      validItemsCount: validItems.length,
      totalItemsCount: items.length
    });
    
    if (!canGeneratePDF) {
      let errorMessage = "Please fix the following issues: ";
      if (missingFields.length > 0) {
        errorMessage += `Missing required fields: ${missingFields.join(', ')}. `;
      }
      if (validItems.length === 0) {
        errorMessage += "At least one complete item is required. ";
      }
      
      toast({
        title: "Form incomplete",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    

    try {
      const success = await generateInvoicePDF(
        { ...watchedValues, items },
        summary,
        user?.id
      );

      // PDF generated successfully - no credit deduction needed

      toast({
        title: "Invoice generated successfully!",
        description: "Your invoice has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Error generating invoice",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create GST Invoice</h1>
          <p className="text-muted-foreground">Generate professional GST-compliant invoices with automatic calculations</p>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BusinessInformationForm 
              register={register} 
              setValue={setValue} 
              watch={watch} 
            />
            
            <ClientInformationForm 
              register={register} 
              setValue={setValue} 
              watch={watch} 
            />
            
            <InvoiceDetailsForm register={register} />
            
            <ItemsForm items={items} onItemsChange={setItems} />
          </div>

          <div className="space-y-6">
            <InvoiceSummary 
              summary={summary} 
              formData={{ ...watchedValues, items }} 
              isValid={canGeneratePDF}
              onGeneratePDF={handleGeneratePDF}
            />
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default CreateInvoice;