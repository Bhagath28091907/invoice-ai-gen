import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreditsDisplay = () => {
  const { credits, isUnlimited } = useAuth();
  const navigate = useNavigate();

  if (credits === null) return null;

  return (
    <Card className="w-full max-w-sm lg:max-w-xs">
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 lg:gap-2">
            {isUnlimited ? (
              <>
                <Infinity className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                <span className="font-medium text-sm lg:text-base">Unlimited</span>
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                <span className="font-medium text-sm lg:text-base">{credits} Credits</span>
                {credits <= 1 && (
                  <Badge variant="destructive" className="text-xs">Low</Badge>
                )}
              </>
            )}
          </div>
          {!isUnlimited && credits <= 2 && (
            <Button
              size="sm"
              onClick={() => navigate("/upgrade")}
              className="ml-1 lg:ml-2 px-2 lg:px-3 text-xs lg:text-sm"
            >
              Upgrade
            </Button>
          )}
        </div>
        {!isUnlimited && (
          <p className="text-xs text-muted-foreground mt-2 hidden lg:block">
            Each invoice generation uses 1 credit
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsDisplay;