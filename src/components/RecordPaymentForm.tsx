import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Loader2, CreditCard, ArrowRight } from "lucide-react";

interface RecordPaymentFormProps {
  groupId: Id<"groups">;
  onClose: () => void;
}

export function RecordPaymentForm({ groupId, onClose }: RecordPaymentFormProps) {
  const [toUserId, setToUserId] = useState<Id<"users"> | "">("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const members = useQuery(api.groups.getGroupMembers, { groupId });
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const recordPayment = useMutation(api.payments.recordPayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId || !amount) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayment({
        groupId,
        toUserId: toUserId,
        amount: amountNum,
        description: description.trim() || undefined,
      });
      toast.success("Payment recorded successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (members === undefined || loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const otherMembers = members.filter(member => member.userId !== loggedInUser?._id);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Record Payment
        </DialogTitle>
        <DialogDescription>
          Record a payment you made to settle up with another group member.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payTo">Pay To</Label>
          <Select value={toUserId} onValueChange={(value) => setToUserId(value as Id<"users"> | "")} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a member to pay" />
            </SelectTrigger>
            <SelectContent>
              {otherMembers.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    {member.user?.name || member.user?.email || "Unknown User"}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional note about this payment"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !toUserId || !amount}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
