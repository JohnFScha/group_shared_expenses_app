import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigation } from "../hooks/useNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Plus } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

export function SelectGroupForExpense() {
  const groups = useQuery(api.groups.getUserGroups);
  const { navigateTo } = useNavigation();

  if (groups === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleGroupSelect = (groupId: Id<"groups">) => {
    navigateTo("add-expense", { groupId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
        <p className="text-muted-foreground">
          First, select which group this expense belongs to
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Groups Available</CardTitle>
            <CardDescription>
              You need to be part of at least one group to add expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigateTo("groups")}>
              <Plus className="h-4 w-4 mr-2" />
              Create or Join a Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card 
              key={group._id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleGroupSelect(group._id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {group.name}
                </CardTitle>
                <CardDescription>
                  {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="sm">
                  Add Expense to This Group
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}