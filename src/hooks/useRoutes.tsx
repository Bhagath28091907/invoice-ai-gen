import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Route {
  id: string;
  route_name: string;
  created_at: string;
}

export const useRoutes = (userId: string | undefined) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoutes = async () => {
    if (!userId) {
      setRoutes([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("user_id", userId)
        .order("route_name");

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast({
        title: "Error loading routes",
        description: "Could not load your routes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [userId]);

  const addRoute = async (routeName: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to add routes",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("routes")
        .insert([{ user_id: userId, route_name: routeName }]);

      if (error) throw error;

      toast({
        title: "Route added",
        description: `"${routeName}" has been added successfully`,
      });

      await fetchRoutes();
      return true;
    } catch (error: any) {
      console.error("Error adding route:", error);
      toast({
        title: "Error adding route",
        description: error.message || "Could not add route",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateRoute = async (routeId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("routes")
        .update({ route_name: newName })
        .eq("id", routeId)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Route updated",
        description: "Route name has been updated successfully",
      });

      await fetchRoutes();
      return true;
    } catch (error: any) {
      console.error("Error updating route:", error);
      toast({
        title: "Error updating route",
        description: error.message || "Could not update route",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteRoute = async (routeId: string) => {
    try {
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("id", routeId)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Route deleted",
        description: "Route has been deleted successfully",
      });

      await fetchRoutes();
      return true;
    } catch (error: any) {
      console.error("Error deleting route:", error);
      toast({
        title: "Error deleting route",
        description: error.message || "Could not delete route",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    routes,
    isLoading,
    addRoute,
    updateRoute,
    deleteRoute,
    refetch: fetchRoutes,
  };
};
