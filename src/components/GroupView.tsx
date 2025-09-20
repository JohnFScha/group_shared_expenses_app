import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ExpenseList } from "./ExpenseList";
import { MemberList } from "./MemberList";
import { PaymentList } from "./PaymentList";
import { BalanceView } from "./BalanceView";
import { AddExpenseForm } from "./AddExpenseForm";
import { InviteMemberForm } from "./InviteMemberForm";
import { RecordPaymentForm } from "./RecordPaymentForm";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Plus, UserPlus, CreditCard, Loader2, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";

interface GroupViewProps {
  groupId: Id<"groups">;
  onBack: () => void;
}

export function GroupView({ groupId, onBack }: GroupViewProps) {
  const group = useQuery(api.groups.getGroupDetails, { groupId });
  const deleteGroup = useMutation(api.groups.deleteGroup);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    try {
      await deleteGroup({ groupId });
      toast.success("Group deleted successfully!");
      onBack(); // Navigate back to groups list
    } catch (error) {
      toast.error("Failed to delete group");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (group === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-3xl">{group.name}</CardTitle>
              {group.description && (
                <CardDescription className="text-base">{group.description}</CardDescription>
              )}
            </div>
            {group.isCreator && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the group "{group.name}" 
                          and remove all associated data, including:
                          <br />
                          <br />
                          • All group members
                          <br />
                          • All expenses in this group
                          <br />
                          • All payments in this group
                          <br />
                          <br />
                          This action is <strong>irreversible</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleDeleteGroup()}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete Group"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <AddExpenseForm
                  groupId={groupId}
                  onClose={() => setShowAddExpense(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <InviteMemberForm
                  groupId={groupId}
                  onClose={() => setShowInviteMember(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showRecordPayment} onOpenChange={setShowRecordPayment}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <RecordPaymentForm
                  groupId={groupId}
                  onClose={() => setShowRecordPayment(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="mt-6">
          <ExpenseList groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="members" className="mt-6">
          <MemberList groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <PaymentList groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="balances" className="mt-6">
          <BalanceView groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
