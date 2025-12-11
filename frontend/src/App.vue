<script setup lang="ts">
import { ref } from "vue";
import Header from "./components/Header.vue";
import TableRows from "./components/TableRows.vue";

let selectedSchema = ref<string>("None");
let selectedTable = ref<string>("None");

function handleSchemaChange(schema: string) {
  selectedSchema.value = schema;
}

function handleTableChange(table: string) {
  selectedTable.value = table;
}
</script>

<template>
  <main class="w-full h-screen flex flex-col overflow-hidden">
    <Header
      @schema-change="handleSchemaChange"
      @table-change="handleTableChange"
    />
    <div class="flex-1 overflow-y-auto">
      <TableRows :schema="selectedSchema" :table="selectedTable" />
    </div>
  </main>
</template>

<style scoped></style>
