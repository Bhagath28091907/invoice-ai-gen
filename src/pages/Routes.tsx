import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoutes } from "@/hooks/useRoutes";
import { useRouteCustomers } from "@/hooks/useRouteCustomers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Routes = () => {
  const { user } = useAuth();
  const { routes, isLoading: routesLoading, addRoute, deleteRoute } = useRoutes(user?.id);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const { customers, isLoading: customersLoading, addCustomer, deleteCustomer } = useRouteCustomers(user?.id, selectedRouteId);
  
  const [newRouteName, setNewRouteName] = useState("");
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    customer_gst_number: "",
  });
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  const handleAddRoute = async () => {
    if (!newRouteName.trim()) return;
    setIsAddingRoute(true);
    const success = await addRoute(newRouteName);
    if (success) {
      setNewRouteName("");
    }
    setIsAddingRoute(false);
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (confirm("Are you sure you want to delete this route? All customers in this route will also be deleted.")) {
      await deleteRoute(routeId);
      if (selectedRouteId === routeId) {
        setSelectedRouteId("");
      }
    }
  };

  const handleAddCustomer = async () => {
    if (!selectedRouteId) {
      alert("Please select a route first");
      return;
    }
    if (!newCustomer.customer_name.trim() || !newCustomer.customer_address.trim() || !newCustomer.customer_phone.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsAddingCustomer(true);
    const success = await addCustomer({
      ...newCustomer,
      route_id: selectedRouteId,
    });
    if (success) {
      setNewCustomer({
        customer_name: "",
        customer_address: "",
        customer_phone: "",
        customer_gst_number: "",
      });
    }
    setIsAddingCustomer(false);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(customerId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Routes Management</h1>
          <p className="text-muted-foreground">Organize your customers by routes for faster invoice creation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Routes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Routes</CardTitle>
              <CardDescription>Create and manage your delivery routes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter route name"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddRoute()}
                />
                <Button onClick={handleAddRoute} disabled={isAddingRoute || !newRouteName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {routesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading routes...</div>
              ) : routes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No routes yet. Add your first route above.</div>
              ) : (
                <div className="space-y-2">
                  {routes.map((route) => (
                    <div
                      key={route.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRouteId === route.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedRouteId(route.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{route.route_name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoute(route.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customers Section */}
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                {selectedRouteId
                  ? `Manage customers in ${routes.find((r) => r.id === selectedRouteId)?.route_name}`
                  : "Select a route to view customers"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRouteId ? (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>
                          Add a customer to {routes.find((r) => r.id === selectedRouteId)?.route_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer_name">Customer Name *</Label>
                          <Input
                            id="customer_name"
                            value={newCustomer.customer_name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, customer_name: e.target.value })}
                            placeholder="Enter customer name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_address">Customer Address *</Label>
                          <Textarea
                            id="customer_address"
                            value={newCustomer.customer_address}
                            onChange={(e) => setNewCustomer({ ...newCustomer, customer_address: e.target.value })}
                            placeholder="Enter customer address"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_phone">Customer Phone *</Label>
                          <Input
                            id="customer_phone"
                            value={newCustomer.customer_phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, customer_phone: e.target.value })}
                            placeholder="Enter customer phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_gst">Customer GST Number (Optional)</Label>
                          <Input
                            id="customer_gst"
                            value={newCustomer.customer_gst_number}
                            onChange={(e) => setNewCustomer({ ...newCustomer, customer_gst_number: e.target.value })}
                            placeholder="Enter GST number"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddCustomer} disabled={isAddingCustomer}>
                          Add Customer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {customersLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading customers...</div>
                  ) : customers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No customers in this route yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {customers.map((customer) => (
                        <div key={customer.id} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{customer.customer_name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{customer.customer_address}</p>
                              <p className="text-sm text-muted-foreground">📞 {customer.customer_phone}</p>
                              {customer.customer_gst_number && (
                                <p className="text-sm text-muted-foreground">GST: {customer.customer_gst_number}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a route from the left to view and manage customers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Routes;
