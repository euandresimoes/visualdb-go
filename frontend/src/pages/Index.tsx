import { useState, useCallback } from 'react';
import { AppSidebar } from '@/components/db/AppSidebar';
import { TabsBar } from '@/components/db/TabsBar';
import { DataTable } from '@/components/db/DataTable';
import { QueryEditor } from '@/components/db/QueryEditor';
import { TabItem } from '@/types';

const Index = () => {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const openTable = useCallback((schema: string, table: string) => {
    const existingTab = tabs.find(t => t.type === 'table' && t.schema === schema && t.table === table);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: TabItem = {
      id: `table-${schema}-${table}-${Date.now()}`,
      schema,
      table,
      type: 'table',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const openQueryEditor = useCallback(() => {
    const newTab: TabItem = {
      id: `query-${Date.now()}`,
      schema: '',
      table: 'Query',
      type: 'query',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <AppSidebar
        onTableSelect={openTable}
        onOpenQueryEditor={openQueryEditor}
        selectedTable={activeTab?.type === 'table' ? { schema: activeTab.schema, table: activeTab.table } : null}
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
          />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab ? (
            activeTab.type === 'query' ? (
              <QueryEditor />
            ) : (
              <DataTable schema={activeTab.schema} table={activeTab.table} />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to DBManager</h2>
                <p className="text-muted-foreground text-sm">
                  Select a table from the sidebar to view and edit data, or create a new query.
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
