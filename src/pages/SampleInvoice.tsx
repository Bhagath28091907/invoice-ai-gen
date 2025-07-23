import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

const SampleInvoice = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sample GST Invoice</h1>
          <p className="text-muted-foreground">Preview how your invoices will look</p>
        </div>

        <div className="mb-6 text-center">
          <Button variant="hero" size="lg" className="mr-4">
            <Download className="w-5 h-5" />
            Download Sample PDF
          </Button>
          <Button variant="outline" size="lg">
            <FileText className="w-5 h-5" />
            Create Your Invoice
          </Button>
        </div>

        {/* Sample Invoice Preview */}
        <Card className="bg-card shadow-lg">
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="border-b border-border pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">TECH SOLUTIONS PVT LTD</h2>
                  <p className="text-muted-foreground">
                    123 Business Park, Sector 15<br />
                    Gurgaon, Haryana - 122001<br />
                    GSTIN: 06AABCT1234L1ZM
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-foreground mb-2">TAX INVOICE</h3>
                  <p className="text-muted-foreground">
                    Invoice #: INV-2024-001<br />
                    Date: January 15, 2024<br />
                    Due Date: February 14, 2024
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-2">Bill To:</h4>
              <p className="text-muted-foreground">
                <strong>ABC Enterprises</strong><br />
                456 Commercial Street<br />
                Bangalore, Karnataka - 560001<br />
                GSTIN: 29AABCA1234N1ZB
              </p>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Description</th>
                    <th className="border border-border p-3 text-center">Qty</th>
                    <th className="border border-border p-3 text-right">Rate</th>
                    <th className="border border-border p-3 text-center">GST%</th>
                    <th className="border border-border p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Website Development Services</td>
                    <td className="border border-border p-3 text-center">1</td>
                    <td className="border border-border p-3 text-right">₹15,000.00</td>
                    <td className="border border-border p-3 text-center">18%</td>
                    <td className="border border-border p-3 text-right">₹15,000.00</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Digital Marketing Campaign</td>
                    <td className="border border-border p-3 text-center">1</td>
                    <td className="border border-border p-3 text-right">₹10,000.00</td>
                    <td className="border border-border p-3 text-center">18%</td>
                    <td className="border border-border p-3 text-right">₹10,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>₹25,000.00</span>
                </div>
                <div className="flex justify-between py-2 text-success">
                  <span>IGST @ 18%:</span>
                  <span>₹4,500.00</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹29,500.00</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <strong>In Words:</strong> Twenty Nine Thousand Five Hundred Rupees Only
                </div>
              </div>
            </div>

            {/* GST Breakdown */}
            <div className="mt-8 bg-accent/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">GST Breakdown:</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Tax Type:</span> IGST (Inter-state transaction)</p>
                <p><span className="font-medium">Taxable Amount:</span> ₹25,000.00</p>
                <p><span className="font-medium">IGST @ 18%:</span> ₹4,500.00</p>
                <p><span className="font-medium">Total Tax:</span> ₹4,500.00</p>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-8 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Terms & Conditions:</p>
              <ul className="space-y-1">
                <li>• Payment due within 30 days of invoice date</li>
                <li>• Interest @ 2% per month will be charged on overdue amounts</li>
                <li>• All disputes subject to Gurgaon jurisdiction only</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Thank you for your business!</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-4">Authorized Signatory</p>
                  <div className="border-t border-border w-32"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            This is a sample invoice showing GST calculations and professional formatting.
          </p>
          <Button variant="hero" size="lg">
            Create Your Own Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SampleInvoice;