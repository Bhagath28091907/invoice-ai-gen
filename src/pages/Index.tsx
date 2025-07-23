import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calculator, FileText, Download, Shield, Zap, Users, ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-invoicing.jpg";

const Index = () => {
  const features = [
    {
      icon: Calculator,
      title: "Automatic GST Calculations",
      description: "Smart CGST, SGST, and IGST calculations based on state logic"
    },
    {
      icon: FileText,
      title: "Professional Templates", 
      description: "Clean, business-ready invoice formats that impress clients"
    },
    {
      icon: Shield,
      title: "GST Compliant",
      description: "All invoices meet Indian GST regulations and requirements"
    },
    {
      icon: Zap,
      title: "Quick Generation",
      description: "Create invoices in minutes with our intuitive interface"
    },
    {
      icon: Download,
      title: "PDF Export",
      description: "Download professional PDFs ready for printing or emailing"
    },
    {
      icon: Users,
      title: "Client Management", 
      description: "Save client details for faster future invoice creation"
    }
  ];

  const benefits = [
    "Automatic tax calculations (5%, 12%, 18%, 28%)",
    "Intra-state (CGST+SGST) vs Inter-state (IGST) logic",
    "Professional invoice numbering system",
    "Amount to words conversion",
    "Client and product database",
    "Mobile-responsive design"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-glow/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Create GST-Compliant
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Invoices</span>
                <br />in Minutes
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Free and easy tool to generate professional invoices with automatic 
                GST calculations. Perfect for businesses, freelancers, and service providers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/create">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    <Calculator className="w-5 h-5" />
                    Create Invoice
                  </Button>
                </Link>
                <Link to="/sample">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <FileText className="w-5 h-5" />
                    See Sample
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage}
                alt="Professional invoice generation"
                className="rounded-lg shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-success text-success-foreground p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">GST Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need for GST Invoicing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features designed specifically for Indian businesses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Why Choose Our GST Invoice Generator?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built specifically for Indian businesses with deep understanding of GST requirements.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">100% GST Compliant</h3>
                  <p className="text-muted-foreground">
                    All invoices include required GST fields, proper calculations, 
                    and formatting as per Indian tax regulations.
                  </p>
                  <Link to="/about">
                    <Button variant="outline" className="group">
                      Learn More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary-glow/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Ready to Create Your First Invoice?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our GST invoice generator. 
            Start creating professional invoices today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button variant="hero" size="lg">
                <Calculator className="w-5 h-5" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="outline" size="lg">
                View Invoice History
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
