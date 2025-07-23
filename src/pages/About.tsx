import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Calculator, FileText, Zap, Mail, MessageCircle } from "lucide-react";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* About Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">About GST Invoice Generator</h1>
          <p className="text-xl text-muted-foreground">
            Your trusted partner for creating professional GST-compliant invoices
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <Calculator className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Automatic GST Calculations</h3>
              </div>
              <p className="text-muted-foreground">
                Automatically calculates CGST, SGST, and IGST based on state logic. 
                No more manual calculations or errors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-8 h-8 text-success" />
                <h3 className="text-xl font-semibold">GST Compliant</h3>
              </div>
              <p className="text-muted-foreground">
                All invoices are generated according to Indian GST regulations 
                and include all required fields.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Professional Templates</h3>
              </div>
              <p className="text-muted-foreground">
                Clean, professional invoice templates that make your business 
                look trustworthy and established.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Quick & Easy</h3>
              </div>
              <p className="text-muted-foreground">
                Generate invoices in minutes with our intuitive interface. 
                Save client and product information for faster future invoicing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Description */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Choose Our GST Invoice Generator?</h2>
            <div className="prose text-muted-foreground space-y-4">
              <p>
                Our GST Invoice Generator is designed specifically for Indian businesses, 
                freelancers, and service providers who need to create professional, 
                GST-compliant invoices quickly and accurately.
              </p>
              <p>
                We understand the complexity of GST calculations and the importance of 
                getting them right. That's why our tool automatically handles:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Intra-state transactions (CGST + SGST)</li>
                <li>Inter-state transactions (IGST)</li>
                <li>Multiple GST rate calculations (5%, 12%, 18%, 28%)</li>
                <li>Proper invoice formatting and numbering</li>
                <li>Amount to words conversion</li>
              </ul>
              <p>
                Whether you're a small business owner, freelancer, or consultant, 
                our tool helps you maintain professional standards while ensuring 
                GST compliance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6" />
              <span>Contact Us</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>support@gstinvoice.com</span>
                  </div>
                  <p className="text-muted-foreground">
                    Have questions about GST calculations or need help with our tool? 
                    We're here to help you succeed.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Business Hours:</h4>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                      Response time: Within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message..." rows={4} />
                </div>
                <Button variant="hero" className="w-full">
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Legal Disclaimer</span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This GST Invoice Generator is provided as a tool to assist in creating invoices. 
            While we strive for accuracy in all calculations, users are responsible for 
            verifying the correctness of all information and ensuring compliance with 
            current GST regulations. We recommend consulting with a qualified accountant 
            or tax advisor for complex transactions or if you have questions about GST compliance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;