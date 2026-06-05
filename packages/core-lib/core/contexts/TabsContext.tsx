import React, { createContext, useContext, useReducer } from "react";
import type { TabsItem } from "../../components";

type TabState = {
  tabs: TabsItem[];
  activeTabId: number | null;
};

type TabAction =
  | { type: "OPEN_TAB"; payload: TabsItem }
  | { type: "CLOSE_TAB"; payload: number }
  | { type: "SET_ACTIVE_TAB"; payload: number };

const TabContext = createContext<{
  state: TabState;
  dispatch: React.Dispatch<TabAction>;
} | null>(null);

function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "OPEN_TAB":
      if (state.tabs.find((t) => t.id === action.payload.id)) {
        return { ...state, activeTabId: action.payload.id };
      }
      return {
        tabs: [...state.tabs, action.payload],
        activeTabId: action.payload.id,
      };
    case "CLOSE_TAB":
      const filtered = state.tabs.filter((t) => t.id !== action.payload);
      const newActive =
        state.activeTabId === action.payload
          ? filtered[filtered.length - 1]?.id ?? null
          : state.activeTabId;
      return { tabs: filtered, activeTabId: newActive };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTabId: action.payload };
    default:
      return state;
  }
}

export const TabContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(tabReducer, {
    tabs: [],
    activeTabId: null,
  });

  return (
    <TabContext.Provider value={{ state, dispatch }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabsContext = () => {
  const context = useContext(TabContext);
  if (!context)
    throw new Error("useTabsContext must be used within TabProvider");
  return context;
};
