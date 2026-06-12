import React, { useState, useCallback } from "react";
import { Tabs, TabItem } from "core-lib/components/radix/tabs";
import { RecipeImportProvider } from "./RecipeImportContext";
import { RecipeImportForm } from "./RecipeImportForm";
import { ImportHistoryTab } from "./ImportHistoryTab";

export const RecipeImportBlock: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("import");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleImportComplete = useCallback(() => {
    setHistoryRefreshKey((k) => k + 1);
    setActiveTab("history");
  }, []);

  const items: TabItem[] = [
    {
      value: "import",
      label: "Import Recipe",
      content: (
        <RecipeImportProvider onImportComplete={handleImportComplete}>
          <RecipeImportForm />
        </RecipeImportProvider>
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
