export interface TabItem {
  id: string;
  schema: string;
  table: string;
  type: 'table' | 'query';
}

export interface TableState {
  schema: string;
  table: string;
  columns: import('@/lib/api').Column[];
  rows: Record<string, unknown>[];
  page: number;
  loading: boolean;
}
