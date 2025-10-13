import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCustomItems } from "@/hooks/useCustomItems";
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
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    const success = await addCustomItem(newItemName.trim());
    if (success) {
      setNewItemName("");
    }
  };

  const startEdit = (itemName: string) => {
    setEditingItem(itemName);
    setEditValue(itemName);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingItem || !editValue.trim()) return;
    const success = await updateCustomItem(editingItem, editValue.trim());
    if (success) {
      setEditingItem(null);
      setEditValue("");
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Manage Items</CardTitle>
          <CardDescription>
            Add, edit, or delete custom items that will appear in your invoice dropdowns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Item Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter new item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddItem();
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleAddItem} disabled={!newItemName.trim() || isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items List */}
          {customItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No custom items yet. Add your first item above!</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customItems.map((item) => (
                    <TableRow key={item}>
                      <TableCell>
                        {editingItem === item ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveEdit();
                                } else if (e.key === "Escape") {
                                  cancelEdit();
                                }
                              }}
                              disabled={isLoading}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEdit}
                              disabled={!editValue.trim() || isLoading}
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              disabled={isLoading}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium">{item}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingItem !== item && (
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
                              onClick={() => confirmDelete(item)}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
