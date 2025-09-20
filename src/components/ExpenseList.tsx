import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Receipt, Calendar, Loader2 } from "lucide-react";

interface ExpenseListProps {
  groupId: Id<"groups">;
}

export function ExpenseList({ groupId }: ExpenseListProps) {
  const expenses = useQuery(api.expenses.getGroupExpenses, { groupId });

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
            <div className="flex items-center gap-3">
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
              <div>
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
            <div className="text-right">
              <Badge variant="outline" className="text-lg font-semibold">
                ${expense.amount.toFixed(2)}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
