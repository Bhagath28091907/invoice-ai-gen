import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RouteCustomer {
  id: string;
  route_id: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  customer_gst_number: string | null;
  created_at: string;
}

export const useRouteCustomers = (userId: string | undefined, routeId?: string) => {
  const [customers, setCustomers] = useState<RouteCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    if (!userId) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("route_customers")
        .select("*")
        .eq("user_id", userId);

      if (routeId) {
        query = query.eq("route_id", routeId);
      }

      const { data, error } = await query.order("customer_name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error loading customers",
        description: "Could not load route customers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [userId, routeId]);

  const addCustomer = async (customer: Omit<RouteCustomer, "id" | "created_at" | "user_id">) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to add customers",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("route_customers")
        .insert([{ ...customer, user_id: userId }]);

      if (error) throw error;

      toast({
        title: "Customer added",
        description: `"${customer.customer_name}" has been added successfully`,
      });

      await fetchCustomers();
      return true;
    } catch (error: any) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error adding customer",
        description: error.message || "Could not add customer",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCustomer = async (customerId: string, updates: Partial<Omit<RouteCustomer, "id" | "created_at" | "user_id">>) => {
    try {
      const { error } = await supabase
        .from("route_customers")
        .update(updates)
        .eq("id", customerId)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Customer updated",
        description: "Customer details have been updated successfully",
      });

      await fetchCustomers();
      return true;
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast({
        title: "Error updating customer",
        description: error.message || "Could not update customer",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from("route_customers")
        .delete()
        .eq("id", customerId)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Customer deleted",
        description: "Customer has been deleted successfully",
      });

      await fetchCustomers();
      return true;
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error deleting customer",
        description: error.message || "Could not delete customer",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    customers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
};
