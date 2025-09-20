import React, { createContext, useState, ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

export type NavigationView = 
  | "dashboard"
  | "groups" 
  | "expenses"
  | "payments"
  | "balances"
  | "add-expense"
  | "select-group-for-expense"
  | "settings"
  | "group-detail";

export interface NavigationState {
  currentView: NavigationView;
  selectedGroupId: Id<"groups"> | null;
  data?: any; // Additional data for specific views
}

interface NavigationContextType {
  navigationState: NavigationState;
  navigateTo: (view: NavigationView, options?: { groupId?: Id<"groups">; data?: any }) => void;
  goBack: () => void;
  canGoBack: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NavigationContext = createContext<NavigationContextType | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
  initialView?: NavigationView;
}

export function NavigationProvider({ children, initialView = "groups" }: NavigationProviderProps) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentView: initialView,
    selectedGroupId: null,
  });

  const [navigationHistory, setNavigationHistory] = useState<NavigationState[]>([]);

  const navigateTo = (view: NavigationView, options?: { groupId?: Id<"groups">; data?: any }) => {
    // Push current state to history before navigating
    setNavigationHistory(prev => [...prev, navigationState]);
    
    setNavigationState({
      currentView: view,
      selectedGroupId: options?.groupId || null,
      data: options?.data,
    });
  };

  const goBack = () => {
    const previousState = navigationHistory[navigationHistory.length - 1];
    if (previousState) {
      setNavigationState(previousState);
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };

  const canGoBack = navigationHistory.length > 0;

  const value = {
    navigationState,
    navigateTo,
    goBack,
    canGoBack,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

