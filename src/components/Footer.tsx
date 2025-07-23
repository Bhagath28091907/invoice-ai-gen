import { FileText, Shield, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">GST Invoice</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create professional GST-compliant invoices in minutes. 
              Free and easy tool for businesses across India.
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Legal Disclaimer</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This tool generates invoices for informational purposes. 
              Please verify GST calculations and consult your accountant 
              for compliance requirements.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Support</span>
            </h3>
            <div className="text-muted-foreground text-sm space-y-1">
              <p>Need help with your invoices?</p>
              <p>Email: support@gstinvoice.com</p>
              <p className="pt-2 text-xs">
                © 2024 GST Invoice Generator. Made for Indian businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;