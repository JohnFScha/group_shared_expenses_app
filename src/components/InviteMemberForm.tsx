import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Loader2, Mail } from "lucide-react";

interface InviteMemberFormProps {
  groupId: Id<"groups">;
  onClose: () => void;
}

export function InviteMemberForm({ groupId, onClose }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inviteUser = useMutation(api.groups.inviteUserToGroup);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await inviteUser({
        groupId,
        userEmail: email.trim(),
      });
      toast.success("User invited successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to invite user");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invite Member
        </DialogTitle>
        <DialogDescription>
          Send an invitation to add a new member to this group.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
          <p className="text-xs text-muted-foreground">
            The user must already have an account to be invited.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? "Inviting..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
