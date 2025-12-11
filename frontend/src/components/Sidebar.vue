<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

// Add type declarations for window.localStorage
declare global {
  interface Window {
    localStorage: Storage;
  }
}

const emit = defineEmits<{
  (e: "schemaChange", schema: string): void;
  (e: "tableChange", table: string): void;
}>();

interface Table {
  name: string;
  // Add more table properties if needed in the future
}

interface Schema {
  name: string;
  tables: Table[];
  expanded: boolean;
}

const schemas = ref<Schema[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Load data from localStorage
function loadFromLocalStorage() {
  // This function is kept for consistency with the original code
  // The actual loading is handled in fetchSchemas()
  return {
    schema: localStorage.getItem("selectedSchema") || "None",
    table: localStorage.getItem("selectedTable") || "None",
  };
}

// Toggle schema expansion
function toggleSchema(schema: Schema) {
  schema.expanded = !schema.expanded;

  // If expanding and tables haven't been loaded yet, fetch them
  if (schema.expanded && (!schema.tables || schema.tables.length === 0)) {
    fetchTables(schema);
  }
}

// Handle table selection
function selectTable(schemaName: string, tableName: string) {
  // Update localStorage
  localStorage.setItem("selectedSchema", schemaName);
  localStorage.setItem("selectedTable", tableName);

  // Emit events
  emit("schemaChange", schemaName);
  emit("tableChange", tableName);
}

// Fetch all schemas
async function fetchSchemas() {
  try {
    loading.value = true;
    const response = await fetch("http://localhost:7020/schemas");
    const data = await response.json().then((res) => res.data || []);

    // Initialize schemas with expanded: false
    schemas.value = data.map((name: string) => ({
      name,
      tables: [],
      expanded: false,
    }));

    // Load the saved schema and table after schemas are loaded
    const savedSchema = localStorage.getItem("selectedSchema");
    const savedTable = localStorage.getItem("selectedTable");

    if (savedSchema && savedSchema !== "None") {
      const schema = schemas.value.find((s) => s.name === savedSchema);
      if (schema) {
        // Fetch tables for the saved schema
        await fetchTables(schema);

        // If there's a saved table, select it
        if (savedTable && savedTable !== "None") {
          // The table selection will be handled by the watch effect
        }
      }
    }
  } catch (err) {
    console.error("Error fetching schemas:", err);
    error.value = "Failed to load schemas";
  } finally {
    loading.value = false;
  }
}

// Fetch tables for a specific schema
async function fetchTables(schema: Schema) {
  try {
    const response = await fetch(
      `http://localhost:7020/tables?schema=${schema.name}`
    );
    const data = await response.json().then((res) => res.data || []);

    // Update the schema with its tables
    schema.tables = data.map(
      (name: string) =>
        ({
          name,
          // Add more table properties if needed
        } as Table)
    );
  } catch (err) {
    console.error(`Error fetching tables for schema ${schema.name}:`, err);
    error.value = `Failed to load tables for schema ${schema.name}`;
  }
}

// Watch for changes to the selected schema/table in localStorage
const selectedSchema = ref(localStorage.getItem("selectedSchema") || "None");
const selectedTable = ref(localStorage.getItem("selectedTable") || "None");

watch(
  [selectedSchema, selectedTable],
  ([newSchema, newTable]) => {
    // This will trigger a re-render with the new selection
    if (newSchema && newTable) {
      emit("schemaChange", newSchema);
      emit("tableChange", newTable);
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadFromLocalStorage();
  fetchSchemas();
});
</script>

<template>
  <div class="sidebar">
    <h2 class="sidebar-title">Database Explorer</h2>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="schemas.length === 0" class="empty">No schemas found</div>

    <div v-else class="schema-list">
      <div v-for="schema in schemas" :key="schema.name" class="schema-item">
        <div
          class="schema-header"
          @click="toggleSchema(schema)"
          :class="{ expanded: schema.expanded }"
        >
          <span class="toggle-icon">
            {{ schema.expanded ? "▼" : "▶" }}
          </span>
          <span class="schema-name">{{ schema.name }}</span>
        </div>

        <div v-if="schema.expanded" class="table-list">
          <div
            v-for="table in schema.tables"
            :key="table.name"
            class="table-item"
            :class="{
              selected:
                selectedSchema === schema.name && selectedTable === table.name,
            }"
            @click="selectTable(schema.name, table.name)"
          >
            {{ table.name }}
          </div>

          <div v-if="schema.tables.length === 0" class="no-tables">
            No tables found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  padding: 1rem;
  box-sizing: border-box;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.schema-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.schema-header:hover {
  background-color: #e9e9e9;
}

.schema-header.expanded {
  font-weight: 600;
}

.toggle-icon {
  display: inline-block;
  width: 20px;
  text-align: center;
  margin-right: 4px;
  font-size: 0.8em;
  color: #666;
}

.schema-name {
  flex: 1;
}

.table-list {
  margin-left: 20px;
  border-left: 1px solid #ddd;
  padding-left: 12px;
  margin-top: 4px;
  margin-bottom: 8px;
}

.table-item {
  padding: 0.4rem 0.5rem;
  margin: 2px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.table-item:hover {
  background-color: #e9e9e9;
}

.table-item.selected {
  background-color: #e0e0e0;
  font-weight: 500;
}

.loading,
.error,
.empty,
.no-tables {
  padding: 0.5rem;
  color: #666;
  font-style: italic;
  font-size: 0.9em;
}

.error {
  color: #d32f2f;
}
</style>
