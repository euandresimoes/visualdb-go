export type Column = {
  pk: boolean;
  name: string;
  type: string;
  nullable: string;
  default?: string;
};

type Table = {
  name: string;
  columns: Column[];
};

type DBStore = {
  schema: string | null;
  table: Table | null;
};

const state: DBStore = {
  schema: null,
  table: null,
};

export const dbStore = {
  getState(): DBStore {
    return state;
  },

  getSchema(): string | null {
    return state.schema;
  },

  setSchema(schema: string | null): void {
    state.schema = schema;
  },

  getTable(): Table | null {
    return state.table;
  },

  setTable(table: Table | null): void {
    state.table = table;
  },
};
