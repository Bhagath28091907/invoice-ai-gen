import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { useRoutes } from "@/hooks/useRoutes";
import { useRouteCustomers } from "@/hooks/useRouteCustomers";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const invoiceSchema = z.object({
  clientName: z.string().min(1, "Customer name is required"),
  clientAddress: z.string().min(1, "Customer address is required"),
  clientPhone: z.string().min(1, "Customer phone is required"),
  clientGstNumber: z.string().optional(),
  items: z.array(z.any()).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

const CreateInvoice = () => {
  const { user, credits, isUnlimited, refreshCredits } = useAuth();
  const { toast } = useToast();
  const { routes } = useRoutes(user?.id);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const { customers } = useRouteCustomers(user?.id, selectedRouteId);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      uom: "BOX",
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
    mode: "onChange",
    defaultValues: {
      clientName: "",
      clientAddress: "",
      clientPhone: "",
      clientGstNumber: "",
      items: [],
      notes: "",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Handle customer selection
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setValue('clientName', customer.customer_name, { shouldValidate: true });
        setValue('clientAddress', customer.customer_address, { shouldValidate: true });
        setValue('clientPhone', customer.customer_phone, { shouldValidate: true });
        setValue('clientGstNumber', customer.customer_gst_number || '', { shouldValidate: true });
      }
    }
  }, [selectedCustomerId, customers, setValue]);

  // Load invoice data for editing if available
  useEffect(() => {
    const editData = sessionStorage.getItem('editInvoiceData');
    if (editData) {
      try {
        const { formData } = JSON.parse(editData);
        setValue('clientName', formData.clientName, { shouldValidate: true });
        setValue('clientAddress', formData.clientAddress, { shouldValidate: true });
        setValue('clientPhone', formData.clientPhone, { shouldValidate: true });
        setValue('clientGstNumber', formData.clientGstNumber || '', { shouldValidate: true });
        setValue('notes', formData.notes || '', { shouldValidate: true });
        setItems(formData.items);
        sessionStorage.removeItem('editInvoiceData');
        toast({
          title: "Invoice loaded for editing",
          description: "Make your changes and generate a new invoice",
        });
      } catch (error) {
        console.error('Error loading invoice data:', error);
      }
    }
  }, [setValue, toast]);

  // Update items in form when items state changes
  useEffect(() => {
    setValue("items", items, { shouldValidate: true });
  }, [items, setValue]);

  // Calculate summary whenever items change (always use Karnataka state for enterprise)
  const summary = calculateInvoiceSummary(
    items,
    "karnataka", // Enterprise state is always Karnataka
    "karnataka"  // Simplified - all invoices treated as same state
  );

  // Check if form is valid for PDF generation (do not rely solely on RHF isValid)
  const canGeneratePDF = (
    items.length > 0 &&
    items.some(item => item.description && item.quantity > 0 && item.rate > 0) &&
    !!watchedValues.clientName && !!watchedValues.clientAddress && !!watchedValues.clientPhone
  );

  const handleGeneratePDF = async () => {
    const currentValues = form.getValues();
    console.log("Generate PDF clicked - Full Debug", { 
      isValid, 
      itemsLength: items.length, 
      itemsValid: items.some(item => item.description && item.quantity > 0 && item.rate > 0),
      isUnlimited, 
      credits,
      canGeneratePDF,
      formErrors: errors,
      currentValues,
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create GST Invoice</h1>
          <p className="text-muted-foreground">Generate professional GST-compliant invoices with automatic calculations</p>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EnterpriseDetailsCard />
            
            {/* Route and Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Select Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="route">Select Route</Label>
                  <Select value={selectedRouteId} onValueChange={(value) => {
                    setSelectedRouteId(value);
                    setSelectedCustomerId("");
                  }}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose a route" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border z-50">
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.route_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedRouteId && (
                  <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border z-50">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.customer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
            
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