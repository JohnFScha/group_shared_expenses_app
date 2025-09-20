import React from "react";
import { useNavigation } from "../hooks/useNavigation";
import { GroupList } from "./GroupList";
import { GroupView } from "./GroupView";
import { AddExpenseForm } from "./AddExpenseForm";
import { SelectGroupForExpense } from "./SelectGroupForExpense";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Users, DollarSign, CreditCard, BarChart3 } from "lucide-react";

interface DashboardContentProps {
  onSelectGroup?: (groupId: string) => void;
}

function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your expense tracking dashboard
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Groups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,350</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$142</div>
            <p className="text-xs text-muted-foreground">
              -4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Settlement Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ExpensesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Expenses</h1>
        <p className="text-muted-foreground">
          View and manage expenses across all groups
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Your most recent expenses from all groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Expense list will be implemented here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Track payments and settlements
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View all payments and settlements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Payment history will be implemented here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function BalancesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Balances</h1>
        <p className="text-muted-foreground">
          View balances across all groups
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overall Balances</CardTitle>
          <CardDescription>
            Your net balances across all groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Balance overview will be implemented here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Update your profile and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings will be implemented here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardContent({ onSelectGroup }: DashboardContentProps) {
  const { navigationState, navigateTo, goBack, canGoBack } = useNavigation();
  const { currentView, selectedGroupId } = navigationState;

  const renderBackButton = () => {
    if (!canGoBack) return null;
    
    return (
      <Button 
        variant="ghost" 
        onClick={goBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    );
  };

  const handleGroupSelect = (groupId: string) => {
    navigateTo("group-detail", { groupId: groupId as any });
    onSelectGroup?.(groupId);
  };

  switch (currentView) {
    case "dashboard":
      return <DashboardView />;
      
    case "groups":
      return (
        <div>
          {renderBackButton()}
          <GroupList onSelectGroup={handleGroupSelect} />
        </div>
      );
      
    case "group-detail":
      if (!selectedGroupId) {
        navigateTo("groups");
        return null;
      }
      return (
        <div>
          {renderBackButton()}
          <GroupView 
            groupId={selectedGroupId}
            onBack={goBack}
          />
        </div>
      );
      
    case "expenses":
      return (
        <div>
          {renderBackButton()}
          <ExpensesView />
        </div>
      );
      
    case "payments":
      return (
        <div>
          {renderBackButton()}
          <PaymentsView />
        </div>
      );
      
    case "balances":
      return (
        <div>
          {renderBackButton()}
          <BalancesView />
        </div>
      );
      
    case "add-expense": {
      // Use selectedGroupId from navigation state or redirect to group selection
      const groupId = selectedGroupId || navigationState.data?.groupId;
      if (!groupId) {
        navigateTo("select-group-for-expense");
        return null;
      }
      
      return (
        <div>
          {renderBackButton()}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
              <p className="text-muted-foreground">
                Create a new expense for your group
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>New Expense</CardTitle>
                <CardDescription>
                  Fill in the details for your new expense
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddExpenseForm 
                  groupId={groupId}
                  onClose={() => goBack()}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
      
    case "select-group-for-expense":
      return (
        <div>
          {renderBackButton()}
          <SelectGroupForExpense />
        </div>
      );
      
    case "settings":
      return (
        <div>
          {renderBackButton()}
          <SettingsView />
        </div>
      );
      
    default:
      return <DashboardView />;
  }
}