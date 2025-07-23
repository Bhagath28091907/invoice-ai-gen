import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { History, Search, Download, Eye, Edit, Trash2 } from "lucide-react";

const InvoiceHistory = () => {
  // This will be populated with actual generated invoices
  const generatedInvoices: any[] = [];
  
  // For demonstration - this would come from actual generated invoice data
  const mockInvoices = generatedInvoices.length > 0 ? generatedInvoices : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "success";
      case "Pending": return "secondary";
      case "Overdue": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center space-x-3">
              <History className="w-8 h-8" />
              <span>Invoice History</span>
            </h1>
            <p className="text-muted-foreground">View and manage all your generated invoices</p>
          </div>
          <Button variant="hero">
            Create New Invoice
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoices by client name or invoice number..." 
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">All</Button>
                <Button variant="outline">Paid</Button>
                <Button variant="outline">Pending</Button>
                <Button variant="outline">Overdue</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {mockInvoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No invoices generated yet</h3>
                  <p>Start by creating your first invoice to see it appear here.</p>
                </div>
                <Button variant="hero" className="mt-4">
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Invoice #</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Total Amount</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-accent/50">
                        <td className="py-4 px-2 font-medium">{invoice.id}</td>
                        <td className="py-4 px-2">{invoice.client}</td>
                        <td className="py-4 px-2 text-muted-foreground">{invoice.date}</td>
                        <td className="py-4 px-2 font-medium">₹{invoice.amount.toLocaleString()}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" title="View Invoice">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Download PDF">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceHistory;