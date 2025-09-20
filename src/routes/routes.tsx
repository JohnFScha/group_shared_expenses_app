import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const DashboardLayout = lazy(() =>
  import("@/pages/DashboardPage.tsx").then((m) => ({ default: m.DashboardPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage.tsx").then((m) => ({ default: m.DashboardPage }))
);
const GroupsPage = lazy(() =>
  import("@/pages/GroupsPage.tsx").then((m) => ({ default: m.GroupsPage }))
);
const GroupDetailPage = lazy(() =>
  import("@/pages/GroupDetailPage.tsx").then((m) => ({ default: m.GroupDetailPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage.tsx").then((m) => ({ default: m.SettingsPage }))
);
const AuthLayout = lazy(() =>
  import("@/layouts/AuthLayout.tsx").then((m) => ({ default: m.AuthLayout }))
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage.tsx").then((m) => ({ default: m.LoginPage }))
);

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