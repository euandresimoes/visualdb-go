<script setup lang="ts">
import { ref, watch } from "vue";
import Header from "./components/Header.vue";
import TableTabs from "./components/TableTabs.vue";
import Sidebar from "./components/Sidebar.vue";
const selectedSchema = ref<string>("None");
const selectedTable = ref<string>("None");
function handleSchemaChange(schema: string) {
  selectedSchema.value = schema;
}
function handleTableChange(table: string) {
  selectedTable.value = table;
}
function handleTabChange({ schema, table }: { schema: string; table: string }) {
  selectedSchema.value = schema;
  selectedTable.value = table;
}
</script>
<template>
  <div class="app-container">
    <Header
      @schema-change="handleSchemaChange"
      @table-change="handleTableChange"
    />
    <div class="main-layout">
      <Sidebar
        @schemaChange="handleSchemaChange"
        @tableChange="handleTableChange"
      />
      <TableTabs
        :schema="selectedSchema"
        :table="selectedTable"
        @update:modelValue="handleTabChange"
        class="table-tabs-container"
      />
    </div>
  </div>
</template>
<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.table-tabs-container {
  flex: 1;
  overflow: hidden;
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
}
</style>