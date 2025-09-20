import { useState } from "react";
import { useQuery } from "convex/react";
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
import { Plus, UserPlus, CreditCard, Loader2 } from "lucide-react";

interface GroupViewProps {
  groupId: Id<"groups">;
  onBack: () => void;
}

export function GroupView({ groupId }: GroupViewProps) {
  const group = useQuery(api.groups.getGroupDetails, { groupId });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);

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
          <CardTitle className="text-3xl">{group.name}</CardTitle>
          {group.description && (
            <CardDescription className="text-base">{group.description}</CardDescription>
          )}
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
