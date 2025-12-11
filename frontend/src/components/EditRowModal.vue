<script setup lang="ts">
import { ref, watch } from "vue";

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
}

const props = defineProps<{
  show: boolean;
  columns: Column[];
  schema: string;
  table: string;
  row: Record<string, any> | null;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

let formData = ref<Record<string, any>>({});
let originalData = ref<Record<string, any>>({});
let submitting = ref<boolean>(false);

function isTimestampType(dataType: string): boolean {
  const lowerType = dataType.toLowerCase();
  return (
    lowerType.includes("timestamp") ||
    lowerType.includes("timestamptz") ||
    lowerType === "date"
  );
}

function getEditableColumns(): Column[] {
  return props.columns.filter((col) => {
    // Não mostrar colunas que são primary key
    if (col.is_primary_key) {
      return false;
    }
    return true;
  });
}

function getPrimaryKeyColumn(): Column | null {
  return props.columns.find((col) => col.is_primary_key) || null;
}

function formatValueForInput(value: any, dataType: string): any {
  if (value === null || value === undefined) {
    return null;
  }

  // Para timestamps, converter para formato datetime-local
  if (isTimestampType(dataType)) {
    if (typeof value === "string") {
      // Se já está em formato ISO, converter para datetime-local
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        // Formato: YYYY-MM-DDTHH:mm
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }
    return value;
  }

  // Para date, converter para formato date
  if (dataType.toLowerCase() === "date") {
    if (typeof value === "string") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }
    return value;
  }

  return value;
}

function initializeFormData() {
  if (!props.row) {
    formData.value = {};
    originalData.value = {};
    return;
  }

  formData.value = {};
  originalData.value = {};

  getEditableColumns().forEach((col) => {
    const value = props.row![col.column_name];
    const formattedValue = formatValueForInput(value, col.data_type);

    formData.value[col.column_name] = formattedValue;
    originalData.value[col.column_name] = value; // Guardar valor original para comparação
  });
}

function closeModal() {
  emit("close");
  formData.value = {};
  originalData.value = {};
}

function hasValueChanged(columnName: string): boolean {
  const currentValue = formData.value[columnName];
  const originalValue = originalData.value[columnName];

  // Comparar valores, tratando null/undefined/empty string
  if (
    currentValue === null ||
    currentValue === undefined ||
    currentValue === ""
  ) {
    return (
      originalValue !== null &&
      originalValue !== undefined &&
      originalValue !== ""
    );
  }

  if (
    originalValue === null ||
    originalValue === undefined ||
    originalValue === ""
  ) {
    return true;
  }

  // Comparação direta
  return currentValue !== originalValue;
}

async function updateRow() {
  if (props.schema === "None" || props.table === "None" || !props.row) {
    return;
  }

  const pkColumn = getPrimaryKeyColumn();
  if (!pkColumn) {
    alert("Não foi possível encontrar a coluna de chave primária.");
    return;
  }

  const pkValue = props.row[pkColumn.column_name];
  if (pkValue === null || pkValue === undefined) {
    alert("Não foi possível encontrar o valor da chave primária.");
    return;
  }

  submitting.value = true;
  try {
    // Preparar dados apenas com campos alterados
    const data: Record<string, any> = {};

    getEditableColumns().forEach((col) => {
      if (!hasValueChanged(col.column_name)) {
        return; // Pular campos não alterados
      }

      const value = formData.value[col.column_name];

      if (value === "" && col.is_nullable === "YES") {
        data[col.column_name] = null;
      } else if (value !== null && value !== undefined && value !== "") {
        if (isTimestampType(col.data_type) && typeof value === "string") {
          data[col.column_name] = value;
        }
      } else if (col.is_nullable === "NO") {
        // Campo obrigatório sem valor
        data[col.column_name] = value || "";
      }
    });

    // Se não há campos alterados, não fazer nada
    if (Object.keys(data).length === 0) {
      alert("Nenhum campo foi alterado.");
      submitting.value = false;
      return;
    }

    const response = await fetch(
      `http://localhost:7020/rows?schema=${props.schema}&table=${props.table}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pk_column: pkColumn.column_name,
          pk_value: pkValue,
          data: data,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      alert(`Erro ao atualizar row: ${error.message || "Erro desconhecido"}`);
      return;
    }

    // Sucesso - fechar modal e emitir evento
    closeModal();
    emit("updated");
  } catch (error) {
    console.error("Error updating row:", error);
    alert("Erro ao atualizar row. Verifique o console para mais detalhes.");
  } finally {
    submitting.value = false;
  }
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      initializeFormData();
    }
  }
);

watch(
  () => props.row,
  () => {
    if (props.show && props.row) {
      initializeFormData();
    }
  }
);
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <!-- Backdrop com blur -->
    <div
      class="absolute inset-0 bg-black/5 backdrop-blur-sm"
      v-on:click="closeModal"
    ></div>

    <!-- Modal -->
    <div
      class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Editar Row</h2>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="updateRow" class="space-y-4">
          <div
            v-for="column in getEditableColumns()"
            :key="column.column_name"
            class="space-y-2"
          >
            <label class="block text-sm font-medium text-gray-700">
              {{ column.column_name }}
              <span v-if="column.is_nullable === 'NO'" class="text-red-500"
                >*</span
              >
              <span class="text-xs text-gray-500 ml-2">
                ({{ column.data_type }})
              </span>
              <span
                v-if="hasValueChanged(column.column_name)"
                class="text-xs text-blue-600 ml-2 font-semibold"
              >
                (alterado)
              </span>
            </label>

            <!-- Campo para timestamps com opção NOW -->
            <div v-if="isTimestampType(column.data_type)">
              <div class="flex gap-2">
                <input
                  v-model="formData[column.column_name]"
                  type="datetime-local"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :required="column.is_nullable === 'NO'"
                />
              </div>
            </div>

            <!-- Campo para date com opção NOW -->
            <div v-else-if="column.data_type.toLowerCase() === 'date'">
              <div class="flex gap-2">
                <input
                  v-model="formData[column.column_name]"
                  type="date"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :required="column.is_nullable === 'NO'"
                />
              </div>
            </div>

            <!-- Campo para números -->
            <input
              v-else-if="
                column.data_type.includes('integer') ||
                column.data_type.includes('numeric') ||
                column.data_type.includes('decimal') ||
                column.data_type.includes('real') ||
                column.data_type.includes('double')
              "
              v-model="formData[column.column_name]"
              type="number"
              step="any"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :required="column.is_nullable === 'NO'"
            />

            <!-- Campo para boolean -->
            <select
              v-else-if="
                column.data_type.includes('boolean') ||
                column.data_type === 'bool'
              "
              v-model="formData[column.column_name]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :required="column.is_nullable === 'NO'"
            >
              <option :value="null">Selecione...</option>
              <option :value="true">true</option>
              <option :value="false">false</option>
            </select>

            <!-- Campo de texto padrão -->
            <input
              v-else
              v-model="formData[column.column_name]"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :required="column.is_nullable === 'NO'"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
              :disabled="submitting"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="submitting"
            >
              {{ submitting ? "Atualizando..." : "Atualizar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
