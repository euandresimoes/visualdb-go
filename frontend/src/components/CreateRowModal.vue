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
}>();

const emit = defineEmits<{
  close: [];
  created: [];
}>();

let formData = ref<Record<string, any>>({});
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
    // Não mostrar colunas que são primary key com default (auto-increment)
    if (col.is_primary_key && col.column_default) {
      return false;
    }
    return true;
  });
}

function initializeFormData() {
  formData.value = {};
  getEditableColumns().forEach((col) => {
    if (col.column_default && !col.column_default.includes("nextval")) {
      // Se tem default e não é sequence, usar o default
      formData.value[col.column_name] = col.column_default;
    } else if (col.is_nullable === "YES") {
      formData.value[col.column_name] = null;
    } else {
      formData.value[col.column_name] = "";
    }
  });
}

function closeModal() {
  emit("close");
  formData.value = {};
}

async function createRow() {
  if (props.schema === "None" || props.table === "None") {
    return;
  }

  submitting.value = true;
  try {
    // Preparar dados para envio
    const payload: Record<string, any> = {};

    getEditableColumns().forEach((col) => {
      const value = formData.value[col.column_name];

      if (value === "" && col.is_nullable === "YES") {
        payload[col.column_name] = null;
      } else if (value !== null && value !== undefined && value !== "") {
        if (isTimestampType(col.data_type) && typeof value === "string") {
          payload[col.column_name] = value;
        }
      } else if (col.is_nullable === "NO") {
        // Campo obrigatório sem valor
        payload[col.column_name] = value || "";
      }
    });

    const response = await fetch(
      `http://localhost:7020/rows?schema=${props.schema}&table=${props.table}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      alert(`Erro ao criar row: ${error.message || "Erro desconhecido"}`);
      return;
    }

    // Sucesso - fechar modal e emitir evento
    closeModal();
    emit("created");
  } catch (error) {
    console.error("Error creating row:", error);
    alert("Erro ao criar row. Verifique o console para mais detalhes.");
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
          <h2 class="text-xl font-semibold text-gray-800">Criar Nova Row</h2>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="createRow" class="space-y-4">
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
              :placeholder="
                column.column_default &&
                !column.column_default.includes('nextval')
                  ? `Padrão: ${column.column_default}`
                  : ''
              "
            />

            <div
              v-if="column.is_primary_key"
              class="text-xs text-blue-600 mt-1"
            >
              Chave Primária
            </div>
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
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="submitting"
            >
              {{ submitting ? "Criando..." : "Criar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
