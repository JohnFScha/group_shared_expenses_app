import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { TrendingUp, TrendingDown, Minus, Info, Loader2 } from "lucide-react";

interface BalanceViewProps {
  groupId: Id<"groups">;
}

export function BalanceView({ groupId }: BalanceViewProps) {
  const balances = useQuery(api.payments.getGroupBalances, { groupId });

  if (balances === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (balance < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getBalanceStatus = (balance: number) => {
    if (balance > 0) return "Should receive";
    if (balance < 0) return "Should pay";
    return "Settled up";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {balances.map((balance) => (
            <Card key={balance.userId} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(balance.user?.name || balance.user?.email || "?")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium">
                    {balance.user?.name || balance.user?.email || "Unknown User"}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {getBalanceIcon(balance.netBalance)}
                    <Badge variant={balance.netBalance === 0 ? "secondary" : "outline"} 
                           className={`text-lg font-semibold ${getBalanceColor(balance.netBalance)}`}>
                      {balance.netBalance > 0 ? "+" : ""}${balance.netBalance.toFixed(2)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getBalanceStatus(balance.netBalance)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Paid</p>
                  <p className="font-medium">${balance.totalPaid.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Fair Share</p>
                  <p className="font-medium">${balance.userShare.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Payments Made</p>
                  <p className="font-medium">${balance.paymentsMade.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Payments Received</p>
                  <p className="font-medium">${balance.paymentsReceived.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to settle up:</AlertTitle>
        <AlertDescription>
           Members with negative balances should pay members with positive balances until everyone's balance is $0.00.
        </AlertDescription>
      </Alert>
    </div>
  );
}
