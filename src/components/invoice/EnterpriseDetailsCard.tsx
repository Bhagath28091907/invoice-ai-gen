import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { ENTERPRISE_DETAILS } from "@/types/invoice";

export const EnterpriseDetailsCard = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Building2 className="w-5 h-5" />
          <span>Enterprise Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm font-semibold text-muted-foreground">Business Name</div>
          <div className="text-lg font-bold">{ENTERPRISE_DETAILS.businessName}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-muted-foreground">Address</div>
          <div className="text-sm">{ENTERPRISE_DETAILS.businessAddress}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-semibold text-muted-foreground">Phone</div>
            <div className="text-sm">{ENTERPRISE_DETAILS.businessPhone}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground">State</div>
            <div className="text-sm">Karnataka</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-semibold text-muted-foreground">GST Number</div>
            <div className="text-sm font-mono">{ENTERPRISE_DETAILS.gstNumber}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground">Food License</div>
            <div className="text-sm font-mono">{ENTERPRISE_DETAILS.foodLicenseNumber}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};