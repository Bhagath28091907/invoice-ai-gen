import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Send, Save } from "lucide-react";
import { InvoiceSummary as InvoiceSummaryType, InvoiceFormData } from "@/types/invoice";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";

interface InvoiceSummaryProps {
  summary: InvoiceSummaryType;
  formData: InvoiceFormData;
  isValid: boolean;
  onGeneratePDF: () => void;
}

export const InvoiceSummary = ({ summary, formData, isValid, onGeneratePDF }: InvoiceSummaryProps) => {
  const { toast } = useToast();

  const handleEmailToClient = () => {
    if (!isValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields before emailing.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Feature Coming Soon",
      description: "Email functionality will be available soon.",
    });
  };

  const handleSaveInvoice = () => {
    if (!isValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields before saving.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Feature Coming Soon",
      description: "Save functionality will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{summary.subtotal.toFixed(2)}</span>
            </div>
            
            {summary.isInterstate ? (
              <div className="flex justify-between text-sm">
                <span>IGST:</span>
                <span>₹{summary.igst.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span>CGST:</span>
                  <span>₹{summary.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST:</span>
                  <span>₹{summary.sgst.toFixed(2)}</span>
                </div>
              </>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₹{summary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full"
          onClick={onGeneratePDF}
        >
          <Download className="w-5 h-5" />
          Generate PDF
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full"
          onClick={handleEmailToClient}
        >
          <Send className="w-5 h-5" />
          Email to Client
        </Button>
        <Button 
          variant="secondary" 
          size="lg" 
          className="w-full"
          onClick={handleSaveInvoice}
        >
          <Save className="w-5 h-5" />
          Save Invoice
        </Button>
      </div>
    </div>
  );
};