import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";
import { calculateItemAmounts } from "@/lib/invoice-calculations";

interface ItemsFormProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
}

const GST_RATES = [
  { value: 0, label: "0%" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
];

export const ItemsForm = ({ items, onItemsChange }: ItemsFormProps) => {
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      rate: 0,
      gstRate: 18,
      amount: 0,
      gstAmount: 0,
      totalAmount: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        return calculateItemAmounts(updatedItem);
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Items</span>
          <Button size="sm" onClick={addItem} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Rate</div>
            <div className="col-span-2">GST Rate</div>
            <div className="col-span-2">Total Amount</div>
            <div className="col-span-1">Action</div>
          </div>
          
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to get started.
            </div>
          )}
          
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <Input 
                className="col-span-3" 
                placeholder="Item description"
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
              />
              <Input 
                className="col-span-2" 
                type="number" 
                placeholder="1"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
              />
              <Input 
                className="col-span-2" 
                type="number" 
                placeholder="0.00"
                step="0.01"
                value={item.rate}
                onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
              />
              <Select 
                value={item.gstRate.toString()} 
                onValueChange={(value) => updateItem(item.id, "gstRate", parseInt(value))}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="GST%" />
                </SelectTrigger>
                <SelectContent>
                  {GST_RATES.map((rate) => (
                    <SelectItem key={rate.value} value={rate.value.toString()}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                ₹{item.totalAmount.toFixed(2)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="col-span-1"
                disabled={items.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};