import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster } from "@/components/ui/toaster";
import { ClientInformationForm } from "@/components/invoice/ClientInformationForm";
import { EnterpriseDetailsCard } from "@/components/invoice/EnterpriseDetailsCard";
import { ItemsForm } from "@/components/invoice/ItemsForm";
import { InvoiceSummary } from "@/components/invoice/InvoiceSummary";
import { InvoiceFormData, InvoiceItem, ENTERPRISE_DETAILS } from "@/types/invoice";
import { calculateInvoiceSummary } from "@/lib/invoice-calculations";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const invoiceSchema = z.object({
  clientName: z.string().min(1, "Customer name is required"),
  clientAddress: z.string().min(1, "Customer address is required"),
  clientPhone: z.string().min(1, "Customer phone is required"),
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
      hsnCode: "",
      itemsLeft: "",
      amount: 0,
      gstAmount: 0,
      totalAmount: 0,
    },
  ]);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientName: "",
      clientAddress: "",
      clientPhone: "",
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

  // Calculate summary whenever items change (always use Karnataka state for enterprise)
  const summary = calculateInvoiceSummary(
    items,
    "karnataka", // Enterprise state is always Karnataka
    "karnataka"  // Simplified - all invoices treated as same state
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
    const requiredFields = ['clientName', 'clientAddress', 'clientPhone'];
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
            <EnterpriseDetailsCard />
            
            <ClientInformationForm 
              register={register} 
            />
            
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