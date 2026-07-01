import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCustomItems, CustomItem } from "@/hooks/useCustomItems";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ManageItems = () => {
  const { user } = useAuth();
  const { customItems, addCustomItem, updateCustomItem, deleteCustomItem, isLoading } = useCustomItems(user?.id);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<'namkeen' | 'chips' | 'badam_milk' | 'sweets'>('namkeen');
  const [newItemName, setNewItemName] = useState("");
  const [newItemHsn, setNewItemHsn] = useState("");
  const [newItemRate, setNewItemRate] = useState("");
  const [newItemGst, setNewItemGst] = useState("");
  const [newItemUom, setNewItemUom] = useState("BOX");
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editHsn, setEditHsn] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editGst, setEditGst] = useState("");
  const [editUom, setEditUom] = useState("BOX");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const namkeenItems = customItems.filter(item => item.category === 'namkeen');
  const chipsItems = customItems.filter(item => item.category === 'chips');
  const badamMilkItems = customItems.filter(item => item.category === 'badam_milk');
  const sweetsItems = customItems.filter(item => item.category === 'sweets');

  const categoryLabels: Record<'namkeen' | 'chips' | 'badam_milk' | 'sweets', string> = {
    namkeen: 'Namkeen',
    chips: 'Chips',
    badam_milk: 'Badam Milk',
    sweets: 'Sweets',
  };

  const openAddDialog = (category: 'namkeen' | 'chips' | 'badam_milk' | 'sweets') => {
    setAddCategory(category);
    setNewItemName("");
    setNewItemHsn("");
    setNewItemRate("");
    setNewItemGst("");
    setNewItemUom("BOX");
    setAddDialogOpen(true);
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    const success = await addCustomItem(
      newItemName.trim(),
      addCategory,
      newItemHsn.trim() || undefined,
      newItemRate ? parseFloat(newItemRate) : undefined,
      newItemGst ? parseFloat(newItemGst) : undefined,
      newItemUom.trim() || "BOX"
    );
    if (success) {
      setAddDialogOpen(false);
    }
  };

  const startEdit = (item: CustomItem) => {
    setEditingItem(item);
    setEditName(item.item_name);
    setEditHsn(item.default_hsn || "");
    setEditRate(item.default_rate?.toString() || "");
    setEditGst(item.default_gst?.toString() || "");
    setEditUom(item.default_uom || "BOX");
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editingItem || !editName.trim()) return;
    const success = await updateCustomItem(
      editingItem.item_name,
      editName.trim(),
      editHsn.trim() || undefined,
      editRate ? parseFloat(editRate) : undefined,
      editGst ? parseFloat(editGst) : undefined,
      editUom.trim() || "BOX"
    );
    if (success) {
      setEditDialogOpen(false);
      setEditingItem(null);
    }
  };

  const confirmDelete = (itemName: string) => {
    setItemToDelete(itemName);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await deleteCustomItem(itemToDelete);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const ItemsTable = ({ items, title, category }: { items: CustomItem[], title: string, category: 'namkeen' | 'chips' | 'badam_milk' | 'sweets' }) => (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button 
            onClick={() => openAddDialog(category)}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No items yet. Add your first item!</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>GST%</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.item_name}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.default_hsn || '-'}</TableCell>
                    <TableCell>{item.default_rate || '-'}</TableCell>
                    <TableCell>{item.default_gst || '-'}</TableCell>
                    <TableCell>{item.default_uom || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(item)}
                          disabled={isLoading}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => confirmDelete(item.item_name)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Items</h1>
        <p className="text-muted-foreground">
          Add, edit, or delete custom items with default values for invoicing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ItemsTable items={namkeenItems} title="Namkeen" category="namkeen" />
        <ItemsTable items={chipsItems} title="Chips" category="chips" />
        <ItemsTable items={badamMilkItems} title="Badam Milk" category="badam_milk" />
        <ItemsTable items={sweetsItems} title="Sweets" category="sweets" />
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {categoryLabels[addCategory]} Item</DialogTitle>
            <DialogDescription>
              Enter the item details including default values for invoicing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                placeholder="Enter item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemHsn">HSN Number</Label>
              <Input
                id="itemHsn"
                placeholder="Enter HSN number"
                value={newItemHsn}
                onChange={(e) => setNewItemHsn(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemRate">Default Rate</Label>
                <Input
                  id="itemRate"
                  type="number"
                  placeholder="0.00"
                  value={newItemRate}
                  onChange={(e) => setNewItemRate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemGst">Default GST %</Label>
                <Input
                  id="itemGst"
                  type="number"
                  placeholder="0"
                  value={newItemGst}
                  onChange={(e) => setNewItemGst(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemUom">Unit of Measurement</Label>
              <Input
                id="itemUom"
                placeholder="BOX"
                value={newItemUom}
                onChange={(e) => setNewItemUom(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!newItemName.trim() || isLoading}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the item details and default values
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editItemName">Item Name *</Label>
              <Input
                id="editItemName"
                placeholder="Enter item name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemHsn">HSN Number</Label>
              <Input
                id="editItemHsn"
                placeholder="Enter HSN number"
                value={editHsn}
                onChange={(e) => setEditHsn(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editItemRate">Default Rate</Label>
                <Input
                  id="editItemRate"
                  type="number"
                  placeholder="0.00"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemGst">Default GST %</Label>
                <Input
                  id="editItemGst"
                  type="number"
                  placeholder="0"
                  value={editGst}
                  onChange={(e) => setEditGst(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemUom">Unit of Measurement</Label>
              <Input
                id="editItemUom"
                placeholder="BOX"
                value={editUom}
                onChange={(e) => setEditUom(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!editName.trim() || isLoading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageItems;
