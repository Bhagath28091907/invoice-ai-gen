import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { History, Search, Download, Eye, Edit, Trash2, FileSpreadsheet, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInvoices = data?.map(invoice => ({
        id: invoice.invoice_number,
        dbId: invoice.id,
        clientName: invoice.client_name,
        businessName: invoice.business_name,
        date: invoice.created_at,
        total: invoice.total_amount,
        invoiceData: invoice.invoice_data
      })) || [];

      setInvoices(formattedInvoices);
      setFilteredInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let filtered = [...invoices];
    
    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(inv => new Date(inv.date) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(inv => new Date(inv.date) <= new Date(toDate));
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(inv => 
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredInvoices(filtered);
  }, [fromDate, toDate, searchQuery, invoices]);

  const totalIncome = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const exportToExcel = () => {
    const exportData = filteredInvoices.map(inv => ({
      'Invoice Number': inv.id,
      'Client Name': inv.clientName,
      'Date': new Date(inv.date).toLocaleDateString(),
      'Total Amount': inv.total
    }));
    
    exportData.push({
      'Invoice Number': '',
      'Client Name': '',
      'Date': 'TOTAL INCOME',
      'Total Amount': totalIncome
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    
    const fileName = `Invoices_${fromDate || 'all'}_to_${toDate || 'all'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all invoice history? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setInvoices([]);
      setFilteredInvoices([]);
      toast({
        title: "Success",
        description: "Invoice history cleared",
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete);

      if (error) throw error;

      await fetchInvoices();
      toast({
        title: "Success",
        description: "Invoice deleted",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const confirmDelete = (dbId: string) => {
    setInvoiceToDelete(dbId);
    setDeleteDialogOpen(true);
  };

  const handleReprint = async (invoice: any) => {
    try {
      const { formData, summary } = invoice.invoiceData;
      await generateInvoicePDF(formData, summary, user?.id);
      toast({
        title: "Success",
        description: "Invoice reprinted",
      });
    } catch (error) {
      console.error('Error reprinting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to reprint invoice",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (invoice: any) => {
    // Store invoice data in sessionStorage to load in CreateInvoice
    sessionStorage.setItem('editInvoiceData', JSON.stringify(invoice.invoiceData));
    navigate('/create');
  };

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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search invoices by client name or invoice number..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Input 
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
              {filteredInvoices.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t">
                  <div className="text-lg font-semibold">
                    Total Income: ₹{totalIncome.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportToExcel} variant="hero">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export to Excel
                    </Button>
                    <Button onClick={clearHistory} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
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
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-accent/50">
                        <td className="py-4 px-2 font-medium">{invoice.id}</td>
                        <td className="py-4 px-2">{invoice.clientName}</td>
                        <td className="py-4 px-2 text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="py-4 px-2 font-medium">₹{invoice.total.toLocaleString()}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Reprint Invoice"
                              onClick={() => handleReprint(invoice)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Edit & Reprint"
                              onClick={() => handleEdit(invoice)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Delete Invoice"
                              onClick={() => confirmDelete(invoice.dbId)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this invoice? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteInvoice} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default InvoiceHistory;