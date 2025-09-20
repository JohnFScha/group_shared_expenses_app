import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "./ui/alert-dialog";
import { CreditCard, Calendar, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentListProps {
  groupId: Id<"groups">;
}

export function PaymentList({ groupId }: PaymentListProps) {
  const payments = useQuery(api.payments.getGroupPayments, { groupId });
  const deletePayment = useMutation(api.payments.deletePayment);
  const [paymentToDelete, setPaymentToDelete] = useState<Id<"payments"> | null>(null);

  const handleDeletePayment = async (paymentId: Id<"payments">) => {
    try {
      await deletePayment({ paymentId });
      toast.success("Payment deleted successfully");
      setPaymentToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete payment");
    }
  };

  if (payments === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">No payments yet</CardTitle>
          <p className="text-sm text-muted-foreground">Record payments between members to settle up!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
          <Badge variant="secondary">{payments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment._id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {(payment.fromUser?.name || payment.fromUser?.email || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {(payment.toUser?.name || payment.toUser?.email || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">
                  {payment.fromUser?.name || payment.fromUser?.email || "Unknown"} paid{" "}
                  {payment.toUser?.name || payment.toUser?.email || "Unknown"}
                </h3>
                {payment.description && (
                  <p className="text-sm text-muted-foreground">{payment.description}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(payment.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-semibold text-green-600">
                ${payment.amount.toFixed(2)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentToDelete(payment._id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <AlertDialog open={paymentToDelete !== null} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => paymentToDelete && void handleDeletePayment(paymentToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
