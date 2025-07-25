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
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isUnlimited ? (
              <>
                <Infinity className="h-5 w-5 text-primary" />
                <span className="font-medium">Unlimited</span>
                <Badge variant="secondary">Pro</Badge>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-medium">{credits} Credits</span>
                {credits <= 1 && (
                  <Badge variant="destructive">Low</Badge>
                )}
              </>
            )}
          </div>
          {!isUnlimited && credits <= 2 && (
            <Button
              size="sm"
              onClick={() => navigate("/upgrade")}
              className="ml-2"
            >
              Upgrade
            </Button>
          )}
        </div>
        {!isUnlimited && (
          <p className="text-xs text-muted-foreground mt-2">
            Each invoice generation uses 1 credit
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsDisplay;