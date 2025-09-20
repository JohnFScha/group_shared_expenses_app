import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
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
import { User, Calendar, Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface MemberListProps {
  groupId: Id<"groups">;
}

export function MemberList({ groupId }: MemberListProps) {
  const members = useQuery(api.groups.getGroupMembers, { groupId });
  const group = useQuery(api.groups.getGroupDetails, { groupId });
  const removeMember = useMutation(api.groups.removeMember);
  const [memberToRemove, setMemberToRemove] = useState<Id<"users"> | null>(null);

  const handleRemoveMember = async (memberUserId: Id<"users">) => {
    try {
      await removeMember({ groupId, memberUserId });
      toast.success("Member removed successfully");
      setMemberToRemove(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  if (members === undefined || group === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Group Members
          <Badge variant="secondary">{members.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div
            key={member._id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar>
                <AvatarFallback>
                  {(member.user?.name || member.user?.email || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {member.user?.name || member.user?.email || "Unknown User"}
                  </h3>
                  {member.userId === group.createdBy && (
                    <Badge variant="secondary" className="text-xs">Creator</Badge>
                  )}
                </div>
                {member.user?.name && member.user?.email && (
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
              </div>
              {member.userId !== group.createdBy && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMemberToRemove(member.userId)}
                  className="h-8 w-8 p-0"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <AlertDialog open={memberToRemove !== null} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => memberToRemove && void handleRemoveMember(memberToRemove)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
