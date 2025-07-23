import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { History, Search, Download, Eye, Edit, Trash2 } from "lucide-react";

const InvoiceHistory = () => {
  const mockInvoices = [
    {
      id: "INV-001",
      client: "ABC Enterprises",
      date: "2024-01-15",
      amount: 25000,
      status: "Paid",
      gst: 4500
    },
    {
      id: "INV-002", 
      client: "XYZ Ltd",
      date: "2024-01-18",
      amount: 18000,
      status: "Pending",
      gst: 3240
    },
    {
      id: "INV-003",
      client: "DEF Solutions",
      date: "2024-01-20",
      amount: 32000,
      status: "Overdue",
      gst: 5760
    }
  ];

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
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Invoice #</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">GST</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
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
                      <td className="py-4 px-2 text-muted-foreground">₹{invoice.gst.toLocaleString()}</td>
                      <td className="py-4 px-2">
                        <Badge variant={getStatusColor(invoice.status) as any}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">₹75,000</p>
                <p className="text-muted-foreground">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">₹13,500</p>
                <p className="text-muted-foreground">GST Collected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">3</p>
                <p className="text-muted-foreground">Total Invoices</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHistory;