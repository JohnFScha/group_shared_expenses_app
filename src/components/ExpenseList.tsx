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
import { Receipt, Calendar, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ExpenseListProps {
  groupId: Id<"groups">;
}

export function ExpenseList({ groupId }: ExpenseListProps) {
  const expenses = useQuery(api.expenses.getGroupExpenses, { groupId });
  const deleteExpense = useMutation(api.expenses.deleteExpense);
  const [expenseToDelete, setExpenseToDelete] = useState<Id<"expenses"> | null>(null);

  const handleDeleteExpense = async (expenseId: Id<"expenses">) => {
    try {
      await deleteExpense({ expenseId });
      toast.success("Expense deleted successfully");
      setExpenseToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete expense");
    }
  };

  if (expenses === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">No expenses yet</CardTitle>
          <p className="text-sm text-muted-foreground">Add your first expense to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Recent Expenses
          <Badge variant="secondary">{expenses.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar>
                <AvatarFallback>
                  {(expense.paidByUser?.name || expense.paidByUser?.email || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{expense.description}</h3>
                <p className="text-sm text-muted-foreground">
                  Paid by {expense.paidByUser?.name || expense.paidByUser?.email || "Unknown"}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-semibold">
                ${expense.amount.toFixed(2)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpenseToDelete(expense._id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <AlertDialog open={expenseToDelete !== null} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => expenseToDelete && void handleDeleteExpense(expenseToDelete)}
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
