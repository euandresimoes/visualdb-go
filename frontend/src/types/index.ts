export interface QueryResult {
  status: number;
  message: string;
  data: string | null;
}

export interface TabItem {
  id: string;
  schema: string;
  table: string;
  type: "table" | "query";
  query?: string;
  queryResult?: QueryResult | null;
}

export interface TableState {
  schema: string;
  table: string;
  columns: import("@/lib/api").Column[];
  rows: Record<string, unknown>[];
  page: number;
  loading: boolean;
}
