import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { GroupsPage } from "./pages/GroupsPage.tsx";
import { GroupDetailPage } from "./pages/GroupDetailPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { AuthLayout } from "./layouts/AuthLayout.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />
          },
          {
            path: "dashboard",
            element: <DashboardPage />
          },
          {
            path: "groups",
            element: <GroupsPage />
          },
          {
            path: "groups/:groupId",
            element: <GroupDetailPage />
          },
          {
            path: "settings",
            element: <SettingsPage />
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />
  }
]);