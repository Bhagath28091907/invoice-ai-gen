import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";
import { calculateItemAmounts } from "@/lib/invoice-calculations";
import { PREDEFINED_ITEMS } from "@/constants/items";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCustomItems } from "@/hooks/useCustomItems";
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
  const { customItems, addCustomItem, isLoading } = useCustomItems(user?.id);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const allItems = [...PREDEFINED_ITEMS, ...customItems].sort();

  const togglePopover = (itemId: string, open: boolean) => {
    setOpenPopovers(prev => ({ ...prev, [itemId]: open }));
  };

  const handleAddNewItem = async () => {
    if (!newItemName.trim()) return;
    
    const success = await addCustomItem(newItemName.trim());
    if (success) {
      setNewItemName("");
      setIsDialogOpen(false);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: "",
      quantity: 1,
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
          <div className="grid grid-cols-12 gap-6 text-xs font-medium text-muted-foreground border-b pb-2">
            <div className="col-span-3">Description</div>
            <div className="col-span-2 text-center">HSN</div>
            <div className="col-span-1 text-center">Qty</div>
            <div className="col-span-2 text-center">Rate</div>
            <div className="col-span-1 text-center">GST%</div>
            <div className="col-span-2 text-center">Total</div>
            <div className="col-span-1 text-center">Action</div>
          </div>
          
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to get started.
            </div>
          )}
          
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-6 items-center py-3 border-b border-gray-100">
              <div className="col-span-3 min-w-0">
                <Popover open={openPopovers[item.id]} onOpenChange={(open) => togglePopover(item.id, open)}>
                  <PopoverTrigger asChild>
                    <Button
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
                    <Command className="bg-background">
                      <CommandInput placeholder="Search items..." className="h-9" />
                      <CommandList className="max-h-[300px]">
                        <CommandGroup>
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <CommandItem
                                onSelect={() => {
                                  setIsDialogOpen(true);
                                }}
                                className="bg-primary/10 hover:bg-primary/20 font-medium cursor-pointer"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Item
                              </CommandItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add New Item</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input
                                  placeholder="Enter item name"
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddNewItem();
                                    }
                                  }}
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={handleAddNewItem}
                                  disabled={!newItemName.trim() || isLoading}
                                >
                                  {isLoading ? "Adding..." : "Add Item"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CommandGroup>
                        <CommandEmpty>
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">No item found.</p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {allItems.map((itemName) => (
                            <CommandItem
                              key={itemName}
                              value={itemName}
                              onSelect={(currentValue) => {
                                updateItem(item.id, "description", currentValue);
                                togglePopover(item.id, false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  item.description === itemName ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {itemName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="col-span-2 min-w-[128px] overflow-hidden">
                <Select
                  value={item.hsnCode || ""} 
                  onValueChange={(value) => updateItem(item.id, "hsnCode", value)}
                >
                  <SelectTrigger className="w-full text-sm h-9 truncate">
                    <SelectValue placeholder="Select HSN" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-[200] shadow-lg border">
                    <SelectItem value="20052000">20052000</SelectItem>
                    <SelectItem value="21069099">21069099</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input 
                className="col-span-1 text-sm h-9 relative z-10"
                type="number" 
                placeholder="1"
                min="0"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
              />
              <Input 
                className="col-span-2 text-sm h-9" 
                type="number" 
                placeholder="0.00"
                step="0.01"
                min="0"
                value={item.rate}
                onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
              />
              <div className="col-span-1">
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
              <div className="col-span-2 flex items-center justify-center text-sm font-medium">
                ₹{item.totalAmount.toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};