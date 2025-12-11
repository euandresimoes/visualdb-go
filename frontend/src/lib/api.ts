const API_BASE = 'http://localhost:7020';

export interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const api = {
  async getSchemas(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/schemas`);
    const json: ApiResponse<string[]> = await res.json();
    return json.data;
  },

  async getTables(schema: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/tables?schema=${schema}`);
    const json: ApiResponse<string[]> = await res.json();
    return json.data;
  },

  async getColumns(schema: string, table: string): Promise<Column[]> {
    const res = await fetch(`${API_BASE}/columns?schema=${schema}&table=${table}`);
    const json: ApiResponse<Column[]> = await res.json();
    return json.data;
  },

  async getRows(schema: string, table: string, page: number = 1, limit: number = 50): Promise<Record<string, unknown>[]> {
    const res = await fetch(`${API_BASE}/rows?schema=${schema}&table=${table}&page=${page}&limit=${limit}`);
    const json: ApiResponse<Record<string, unknown>[]> = await res.json();
    return json.data;
  },

  async createRow(schema: string, table: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE}/rows?schema=${schema}&table=${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json: ApiResponse<Record<string, unknown>> = await res.json();
    return json.data;
  },

  async updateRow(
    schema: string,
    table: string,
    pkColumn: string,
    pkValue: unknown,
    data: Record<string, unknown>
  ): Promise<void> {
    await fetch(`${API_BASE}/rows?schema=${schema}&table=${table}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pk_column: pkColumn, pk_value: pkValue, data }),
    });
  },

  async deleteRow(schema: string, table: string, pkColumn: string, pkValue: unknown): Promise<void> {
    await fetch(`${API_BASE}/rows?schema=${schema}&table=${table}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pk_column: pkColumn, pk_value: pkValue }),
    });
  },
};
