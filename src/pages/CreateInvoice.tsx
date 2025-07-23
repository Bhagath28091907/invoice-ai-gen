import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Plus, Download, Send, Save } from "lucide-react";

const CreateInvoice = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create GST Invoice</h1>
          <p className="text-muted-foreground">Generate professional GST-compliant invoices with automatic calculations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Business Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input id="businessName" placeholder="Enter business name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN *</Label>
                    <Input id="gstin" placeholder="22AAAAA0000A1Z5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Textarea id="businessAddress" placeholder="Enter complete business address" rows={3} />
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input id="clientName" placeholder="Enter client name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientGstin">Client GSTIN</Label>
                    <Input id="clientGstin" placeholder="22BBBBB0000B1Z5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Client Address *</Label>
                  <Textarea id="clientAddress" placeholder="Enter client address" rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientState">State *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessState">Business State *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                    <Input id="invoiceNumber" placeholder="INV-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date *</Label>
                    <Input id="invoiceDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Items</span>
                  <Button size="sm" className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2">GST Rate</div>
                    <div className="col-span-2">Amount</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <Input className="col-span-4" placeholder="Item description" />
                    <Input className="col-span-2" type="number" placeholder="1" />
                    <Input className="col-span-2" type="number" placeholder="0.00" />
                    <Select>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="GST%" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                      ₹0.00
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CGST (9%):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SGST (9%):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹0.00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button variant="hero" size="lg" className="w-full">
                <Download className="w-5 h-5" />
                Generate PDF
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                <Send className="w-5 h-5" />
                Email to Client
              </Button>
              <Button variant="secondary" size="lg" className="w-full">
                <Save className="w-5 h-5" />
                Save Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;