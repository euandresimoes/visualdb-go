<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const emit = defineEmits<{
  schemaChange: [schema: string];
  tableChange: [table: string];
}>();

let schemasList = ref<string[]>(["None"]);
let selectedSchema = ref<string>("None");

let tableList = ref<string[]>(["None"]);
let selectedTable = ref<string>("None");

// Carregar do localStorage
function loadFromLocalStorage() {
  const savedSchema = localStorage.getItem("selectedSchema");
  const savedTable = localStorage.getItem("selectedTable");

  if (savedSchema) {
    selectedSchema.value = savedSchema;
  }
  if (savedTable) {
    selectedTable.value = savedTable;
  }
}

// Salvar no localStorage
function saveToLocalStorage() {
  localStorage.setItem("selectedSchema", selectedSchema.value);
  localStorage.setItem("selectedTable", selectedTable.value);
}

async function fetchSchemas() {
  const response = await fetch("http://localhost:7020/schemas");
  const data = await response.json().then((res) => res.data);
  schemasList.value = ["None", ...(data || [])];
}

async function fetchTables() {
  if (selectedSchema.value === "None") {
    tableList.value = ["None"];
    return;
  }

  const response = await fetch(
    `http://localhost:7020/tables?schema=${selectedSchema.value}`
  );
  const data = await response.json().then((res) => res.data);
  tableList.value = ["None", ...(data || [])];
}

// Watch para buscar tables quando schema mudar
watch(selectedSchema, async () => {
  await fetchTables();
  saveToLocalStorage();
  emit("schemaChange", selectedSchema.value);
});

// Watch para salvar table quando mudar
watch(selectedTable, () => {
  saveToLocalStorage();
  emit("tableChange", selectedTable.value);
});

onMounted(async () => {
  // Carregar valores salvos primeiro
  loadFromLocalStorage();

  // Buscar schemas
  await fetchSchemas();

  // Se tiver schema salvo e não for "None", buscar tables
  if (selectedSchema.value !== "None") {
    await fetchTables();
  }

  // Emitir valores iniciais
  emit("schemaChange", selectedSchema.value);
  emit("tableChange", selectedTable.value);
});
</script>

<template>
  <header
    class="w-full h-auto py-5 px-10 flex flex-wrap justify-between items-center border-b-2"
  >
    <div class="flex gap-10">
      <h1>Welcome!</h1>
      <!-- Select Schema -->
      <div class="flex flex-wrap justify-center items-center gap-3">
        <label>Schema</label>
        <select name="schema_select" v-model="selectedSchema">
          <option v-for="schema in schemasList" :value="schema">
            {{ schema }}
          </option>
        </select>
      </div>

      <!-- Select Table -->
      <div class="flex flex-wrap justify-center items-center gap-3">
        <label>Table</label>
        <select name="table_select" v-model="selectedTable">
          <option v-for="table in tableList" :value="table">
            {{ table }}
          </option>
        </select>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
