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