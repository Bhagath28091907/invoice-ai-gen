import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomItems = (userId: string | undefined) => {
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchCustomItems();
    }
  }, [userId]);

  const fetchCustomItems = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_items")
        .select("item_name")
        .order("item_name");

      if (error) throw error;

      setCustomItems(data?.map(item => item.item_name) || []);
    } catch (error) {
      console.error("Error fetching custom items:", error);
    }
  };

  const addCustomItem = async (itemName: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add custom items",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("custom_items")
        .insert({ user_id: userId, item_name: itemName });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Item already exists",
            description: "This item is already in your list",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      setCustomItems(prev => [...prev, itemName].sort());
      toast({
        title: "Item added",
        description: `"${itemName}" has been added to your items list`,
      });
      return true;
    } catch (error) {
      console.error("Error adding custom item:", error);
      toast({
        title: "Error",
        description: "Failed to add custom item",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomItem = async (oldName: string, newName: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update items",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("custom_items")
        .update({ item_name: newName })
        .eq("user_id", userId)
        .eq("item_name", oldName);

      if (error) throw error;

      setCustomItems(prev => prev.map(item => item === oldName ? newName : item).sort());
      toast({
        title: "Item updated",
        description: `Item renamed to "${newName}"`,
      });
      return true;
    } catch (error) {
      console.error("Error updating custom item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomItem = async (itemName: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete items",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("custom_items")
        .delete()
        .eq("user_id", userId)
        .eq("item_name", itemName);

      if (error) throw error;

      setCustomItems(prev => prev.filter(item => item !== itemName));
      toast({
        title: "Item deleted",
        description: `"${itemName}" has been removed`,
      });
      return true;
    } catch (error) {
      console.error("Error deleting custom item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    customItems, 
    addCustomItem, 
    updateCustomItem,
    deleteCustomItem,
    isLoading, 
    refetch: fetchCustomItems 
  };
};
