import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/db/AppSidebar";
import { TabsBar } from "@/components/db/TabsBar";
import { DataTable } from "@/components/db/DataTable";
import { QueryEditor } from "@/components/db/QueryEditor";
import { TabItem, QueryResult } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [schemaVersion, setSchemaVersion] = useState(0);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // This function will be called to trigger a schema reload
  const reloadSchemas = useCallback(() => {
    setSchemaVersion((prev) => prev + 1);
  }, []);

  const openTable = useCallback(
    (schema: string, table: string) => {
      const existingTab = tabs.find(
        (t) => t.type === "table" && t.schema === schema && t.table === table
      );
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      const newTab: TabItem = {
        id: `table-${schema}-${table}-${Date.now()}`,
        schema,
        table,
        type: "table",
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs]
  );

  const openQueryEditor = useCallback(() => {
    const newTab: TabItem = {
      id: `query-${Date.now()}`,
      schema: "",
      table: "Query",
      type: "query",
      query: "",
      queryResult: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== id);
        if (activeTabId === id && newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1].id);
        } else if (newTabs.length === 0) {
          setActiveTabId(null);
        }
        return newTabs;
      });
    },
    [activeTabId]
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <AppSidebar
        key={`sidebar-${schemaVersion}`}
        onTableSelect={openTable}
        onOpenQueryEditor={openQueryEditor}
        selectedTable={
          activeTab?.type === "table"
            ? { schema: activeTab.schema, table: activeTab.table }
            : null
        }
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs Bar */}
        {tabs.length > 0 && (
          <TabsBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={setActiveTabId}
            onTabClose={closeTab}
            onTabsReorder={setTabs}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab ? (
            activeTab.type === "query" ? (
              <QueryEditor
                query={activeTab.query || ""}
                result={activeTab.queryResult || null}
                onQueryChange={(newQuery) => {
                  setTabs((prev) =>
                    prev.map((tab) =>
                      tab.id === activeTabId ? { ...tab, query: newQuery } : tab
                    )
                  );
                }}
                onRun={async (query: string) => {
                  if (!query.trim()) {
                    toast({
                      title: "Error",
                      description: "Please enter a query to execute",
                      variant: "destructive",
                    });
                    return null;
                  }

                  try {
                    const response = await fetch("/api/query", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ query }),
                    });

                    const result = await response.json();

                    // Update the tab with the new result
                    setTabs((prev) =>
                      prev.map((tab) =>
                        tab.id === activeTabId
                          ? { ...tab, queryResult: result }
                          : tab
                      )
                    );

                    // Reload schemas if the query was successful
                    if (result.status < 400) {
                      reloadSchemas();
                    }

                    return result;
                  } catch (error) {
                    console.error("Error executing query:", error);
                    throw error;
                  }
                }}
              />
            ) : (
              <DataTable
                key={`${activeTab.schema}-${activeTab.table}`}
                schema={activeTab.schema}
                table={activeTab.table}
                onError={() => {
                  // Remove a aba quando ocorre um erro
                  setTabs((prev) =>
                    prev.filter((tab) => tab.id !== activeTabId)
                  );
                  setActiveTabId((prev) =>
                    prev === activeTabId ? null : prev
                  );
                }}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-32 h-32 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <img src="/public/logo.jpg" alt="Holo Studio Logo" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Welcome to Holo Studio
                </h2>
                <p className="text-muted-foreground text-sm">
                  Select a table from the sidebar to view and edit data, or
                  create a new query.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
