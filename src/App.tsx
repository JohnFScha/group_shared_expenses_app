import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardContent } from "./components/DashboardContent";
import { NavigationProvider } from "./contexts/NavigationContext";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationProvider initialView="groups">
        <Content />
      </NavigationProvider>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <DashboardLayout>
          <DashboardContent />
        </DashboardLayout>
      </Authenticated>
      <Unauthenticated>
        <div className="flex justify-center items-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Shared Expenses</CardTitle>
              <CardDescription className="text-lg">
                Track group expenses and settle up easily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm />
            </CardContent>
          </Card>
        </div>
      </Unauthenticated>
    </>
  );
}
