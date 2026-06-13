import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { Tabs, TabItem } from "core-lib/components/radix/tabs";
import { RecipeImportProvider, GoToHistoryProvider } from "./RecipeImportContext";
import { RecipeImportForm } from "./RecipeImportForm";
import { ImportHistoryTab } from "./ImportHistoryTab";

export const RecipeImportBlock: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("import");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  useEffect(() => {
    if (router.isReady && router.query.tab === "history") {
      setActiveTab("history");
    }
  }, [router.isReady, router.query.tab]);

  const handleImportComplete = useCallback(() => {
    setHistoryRefreshKey((k) => k + 1);
    // Don't auto-switch — ResultStep will navigate via handleGoToHistory
  }, []);

  const handleGoToHistory = useCallback(() => {
    setActiveTab("history");
  }, []);

  const items: TabItem[] = [
    {
      value: "import",
      label: "Import Recipe",
      content: (
        <GoToHistoryProvider onGoToHistory={handleGoToHistory}>
          <RecipeImportProvider onImportComplete={handleImportComplete}>
            <RecipeImportForm />
          </RecipeImportProvider>
        </GoToHistoryProvider>
      ),
    },
    {
      value: "history",
      label: "Import History",
      content: <ImportHistoryTab refreshKey={historyRefreshKey} />,
    },
  ];

  return <Tabs items={items} value={activeTab} onValueChange={setActiveTab} />;
};
