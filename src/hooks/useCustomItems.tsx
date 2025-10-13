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

  return { customItems, addCustomItem, isLoading, refetch: fetchCustomItems };
};
