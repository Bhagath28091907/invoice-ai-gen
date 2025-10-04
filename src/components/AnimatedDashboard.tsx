import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, FileText, Users, DollarSign, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  thisMonth: number;
  customers: number;
}

export const AnimatedDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    thisMonth: 0,
    customers: 0
  });

  const [animatedStats, setAnimatedStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    thisMonth: 0,
    customers: 0
  });

  const loadStats = () => {
    const invoiceHistory = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    const totalInvoices = invoiceHistory.length;
    const totalRevenue = invoiceHistory.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const thisMonth = invoiceHistory.filter((inv: any) => {
      const invoiceDate = new Date(inv.date || inv.createdAt);
      const now = new Date();
      return invoiceDate.getMonth() === now.getMonth() && 
             invoiceDate.getFullYear() === now.getFullYear();
    }).length;
    const customers = new Set(invoiceHistory.map((inv: any) => inv.clientName)).size;

    setStats({ totalInvoices, totalRevenue, thisMonth, customers });
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all invoice data? This action cannot be undone.')) {
      return;
    }

    try {
      // Clear localStorage
      localStorage.removeItem('invoiceHistory');
      
      // Clear database data if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('invoices').delete().eq('user_id', user.id);
      }

      // Reset stats
      setStats({ totalInvoices: 0, totalRevenue: 0, thisMonth: 0, customers: 0 });
      setAnimatedStats({ totalInvoices: 0, totalRevenue: 0, thisMonth: 0, customers: 0 });

      toast({
        title: "Data Reset",
        description: "All invoice data has been cleared successfully.",
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Error",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    // Animate the numbers
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        totalInvoices: Math.floor(stats.totalInvoices * easeOutQuart),
        totalRevenue: Math.floor(stats.totalRevenue * easeOutQuart),
        thisMonth: Math.floor(stats.thisMonth * easeOutQuart),
        customers: Math.floor(stats.customers * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(stats);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Animated Background - Simplified */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Kalyani Enterprises
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional Invoice Management System
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="text-sm px-4 py-2">GST: {ENTERPRISE_DETAILS.gstNumber}</Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">Food License: {ENTERPRISE_DETAILS.foodLicenseNumber}</Badge>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{animatedStats.totalInvoices}</div>
              <div className="text-sm text-muted-foreground">Total Invoices</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">₹{(animatedStats.totalRevenue / 1000).toFixed(1)}K</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{animatedStats.thisMonth}</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{animatedStats.customers}</div>
              <div className="text-sm text-muted-foreground">Customers</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/create">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <FileText className="w-5 h-5 mr-2" />
              Create New Invoice
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
              <TrendingUp className="w-5 h-5 mr-2" />
              View Invoice History
            </Button>
          </Link>
          <Button 
            onClick={handleResetData}
            variant="destructive" 
            size="lg" 
            className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset All Data
          </Button>
        </div>

        {/* Enterprise Info Card */}
        <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Enterprise Details</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <div className="text-lg font-semibold">{ENTERPRISE_DETAILS.businessName}</div>
            <div className="text-muted-foreground">{ENTERPRISE_DETAILS.businessAddress}</div>
            <div className="text-muted-foreground">Phone: {ENTERPRISE_DETAILS.businessPhone}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Import ENTERPRISE_DETAILS
import { ENTERPRISE_DETAILS } from '@/types/invoice';