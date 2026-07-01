import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Check, ChevronsUpDown, Search } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";
import { calculateItemAmounts } from "@/lib/invoice-calculations";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CustomItem, useCustomItems } from "@/hooks/useCustomItems";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const { customItems, isLoading, refetch } = useCustomItems(user?.id);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const togglePopover = (itemId: string, open: boolean) => {
    setOpenPopovers(prev => ({ ...prev, [itemId]: open }));
    if (open) {
      setSearchQueries(prev => ({ ...prev, [itemId]: "" }));
      void refetch();
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // Handle item selection with auto-population
  const handleItemSelect = (itemId: string, selectedCustomItem: CustomItem) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          description: selectedCustomItem.item_name,
          hsnCode: selectedCustomItem.default_hsn ?? item.hsnCode,
          rate: Number(selectedCustomItem.default_rate ?? item.rate),
          gstRate: Number(selectedCustomItem.default_gst ?? item.gstRate),
          uom: selectedCustomItem.default_uom ?? item.uom,
        };
        return calculateItemAmounts(updatedItem);
      }
      return item;
    });
    onItemsChange(updatedItems);
    
    togglePopover(itemId, false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Items</span>
          <Button type="button" size="sm" onClick={addItem} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr_1fr_1fr_1fr_0.5fr] gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
            <div>Description</div>
            <div className="text-center">HSN</div>
            <div className="text-center">Qty</div>
            <div className="text-center">UOM</div>
            <div className="text-center">Rate</div>
            <div className="text-center">GST%</div>
            <div className="text-center">Total</div>
            <div className="text-center">Action</div>
          </div>
          
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to get started.
            </div>
          )}
          
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_0.8fr_1fr_1fr_1fr_0.5fr] gap-2 items-center py-3 border-b border-gray-100">
              <div className="min-w-0">
                <Popover open={openPopovers[item.id]} onOpenChange={(open) => togglePopover(item.id, open)}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPopovers[item.id]}
                      className="w-full justify-between text-xs h-9"
                    >
                      {item.description || "Select item..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-background z-50 shadow-lg border" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search items..."
                        value={searchQueries[item.id] || ""}
                        onChange={(e) => setSearchQueries(prev => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-1">
                      {(() => {
                        const q = (searchQueries[item.id] || "").toLowerCase().trim();
                        const filtered = q
                          ? customItems.filter(ci => ci.item_name.toLowerCase().includes(q))
                          : customItems;
                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                {isLoading ? "Loading items..." : "No item found."}
                              </p>
                            </div>
                          );
                        }
                        return filtered.map((customItem) => (
                          <button
                            type="button"
                            key={customItem.id}
                            onClick={() => handleItemSelect(item.id, customItem)}
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                item.description === customItem.item_name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {customItem.item_name}
                          </button>
                        ));
                      })()}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Input 
                className="text-xs h-9"
                type="text" 
                placeholder="HSN"
                value={item.hsnCode || ""}
                onChange={(e) => updateItem(item.id, "hsnCode", e.target.value)}
              />
              <Input 
                className="text-sm h-9 relative z-30"
                type="number" 
                placeholder="1"
                min="0"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
              />
              <Input 
                className="text-xs h-9"
                type="text" 
                placeholder="BOX"
                value={item.uom}
                onChange={(e) => updateItem(item.id, "uom", e.target.value)}
              />
              <Input 
                className="text-sm h-9"
                type="number" 
                placeholder="0.00"
                step="0.01"
                min="0"
                value={item.rate}
                onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
              />
              <div>
                <Select 
                  value={item.gstRate.toString()} 
                  onValueChange={(value) => updateItem(item.id, "gstRate", parseInt(value))}
                >
                  <SelectTrigger className="w-full text-xs h-9">
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
              </div>
              <div className="flex items-center justify-center text-sm font-medium">
                ₹{item.totalAmount.toFixed(2)}
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
