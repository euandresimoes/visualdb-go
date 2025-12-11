import { X, Table, Terminal, Plus } from 'lucide-react';
import { TabItem } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface TabsBarProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
}

export function TabsBar({ tabs, activeTabId, onTabSelect, onTabClose }: TabsBarProps) {
  return (
    <div className="h-10 border-b border-border bg-card/50 backdrop-blur-sm flex items-center">
      <ScrollArea className="w-full">
        <div className="flex items-center h-10 px-1">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={cn(
                'group flex items-center gap-2 h-8 px-3 rounded-md cursor-pointer transition-all text-sm',
                'hover:bg-muted/50',
                activeTabId === tab.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground'
              )}
              onClick={() => onTabSelect(tab.id)}
            >
              {tab.type === 'query' ? (
                <Terminal className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Table className="h-3.5 w-3.5 text-primary/70" />
              )}
              <span className="max-w-32 truncate">
                {tab.type === 'query' ? 'Query' : tab.table}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="ml-1 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
