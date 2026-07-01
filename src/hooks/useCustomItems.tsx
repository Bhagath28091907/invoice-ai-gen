import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CustomItem {
  id: string;
  item_name: string;
  category: 'namkeen' | 'chips' | 'badam_milk' | 'sweets';
  default_hsn?: string;
  default_rate?: number;
  default_gst?: number;
  default_uom?: string;
}

export const useCustomItems = (userId: string | undefined) => {
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ponytail: ref avoids stale closure in fetchCustomItems — without it,
  // refetch() called from event handlers can read an outdated userId.
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const fetchCustomItems = useCallback(async () => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_items')
        .select('id, item_name, category, default_hsn, default_rate, default_gst, default_uom')
        .eq('user_id', currentUserId)
        .order('item_name', { ascending: true });

      if (error) throw error;
      
      setCustomItems((data || []) as CustomItem[]);
    } catch (error) {
      console.error('Error fetching custom items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCustomItems();
    }
  }, [userId, fetchCustomItems]);

  const addCustomItem = async (
    itemName: string, 
    category: 'namkeen' | 'chips' | 'badam_milk' | 'sweets',
    defaultHsn?: string,
    defaultRate?: number,
    defaultGst?: number,
    defaultUom?: string
  ): Promise<boolean> => {
    if (!userIdRef.current) {
      toast({
        title: "Error",
        description: "You must be logged in to add items",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('custom_items')
        .insert([{ 
          user_id: userIdRef.current, 
          item_name: itemName,
          category,
          default_hsn: defaultHsn || null,
          default_rate: defaultRate || 0,
          default_gst: defaultGst || 0,
          default_uom: defaultUom || 'BOX'
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Item already exists",
            description: "This item name is already in your list",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return false;
      }

      await fetchCustomItems();
      toast({
        title: "Item added",
        description: `${itemName} has been added to your items`,
      });
      return true;
    } catch (error) {
      console.error('Error adding custom item:', error);
      toast({
        title: "Error adding item",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomItem = async (
    oldName: string, 
    newName: string,
    defaultHsn?: string,
    defaultRate?: number,
    defaultGst?: number,
    defaultUom?: string
  ): Promise<boolean> => {
    if (!userIdRef.current) {
      toast({
        title: "Error",
        description: "You must be logged in to update items",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('custom_items')
        .update({ 
          item_name: newName,
          default_hsn: defaultHsn || null,
          default_rate: defaultRate || 0,
          default_gst: defaultGst || 0,
          default_uom: defaultUom || 'BOX'
        })
        .eq('user_id', userIdRef.current)
        .eq('item_name', oldName);

      if (error) throw error;

      await fetchCustomItems();
      toast({
        title: "Item updated",
        description: `Item has been updated successfully`,
      });
      return true;
    } catch (error) {
      console.error('Error updating custom item:', error);
      toast({
        title: "Error updating item",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomItem = async (itemName: string): Promise<boolean> => {
    if (!userIdRef.current) {
      toast({
        title: "Error",
        description: "You must be logged in to delete items",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('custom_items')
        .delete()
        .eq('user_id', userIdRef.current)
        .eq('item_name', itemName);

      if (error) throw error;

      await fetchCustomItems();
      toast({
        title: "Item deleted",
        description: `${itemName} has been removed`,
      });
      return true;
    } catch (error) {
      console.error('Error deleting custom item:', error);
      toast({
        title: "Error deleting item",
        description: "Please try again",
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
