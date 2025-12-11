<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from "vue";
import CreateRowModal from "./CreateRowModal.vue";
import EditRowModal from "./EditRowModal.vue";

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
}

const props = defineProps<{
  schema: string;
  table: string;
}>();

let columns = ref<Column[]>([]);
let rows = ref<Record<string, any>[]>([]);
let loading = ref<boolean>(false);
let currentPage = ref<number>(1);
let limit = ref<number>(20);
let selectedRows = ref<Set<number>>(new Set());
let selectAllCheckbox = ref<HTMLInputElement | null>(null);
let showCreateModal = ref<boolean>(false);
let showEditModal = ref<boolean>(false);
let selectedRowForEdit = ref<Record<string, any> | null>(null);
let deleting = ref<boolean>(false);

const limitOptions = [20, 40, 60, 80, 100];

async function fetchColumns() {
  if (props.schema === "None" || props.table === "None") {
    columns.value = [];
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:7020/columns?schema=${props.schema}&table=${props.table}`
    );
    const data = await response.json().then((res) => res.data);
    columns.value = data || [];
  } catch (error) {
    console.error("Error fetching columns:", error);
    columns.value = [];
  }
}

async function fetchRows() {
  if (props.schema === "None" || props.table === "None") {
    rows.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:7020/rows?schema=${props.schema}&table=${props.table}&page=${currentPage.value}&limit=${limit.value}`
    );
    const data = await response.json().then((res) => res.data);
    rows.value = data || [];
    selectedRows.value.clear(); // Limpar seleção ao mudar página
  } catch (error) {
    console.error("Error fetching rows:", error);
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function toggleRowSelection(index: number) {
  if (selectedRows.value.has(index)) {
    selectedRows.value.delete(index);
  } else {
    selectedRows.value.add(index);
  }
}

function toggleSelectAll() {
  if (selectedRows.value.size === rows.value.length) {
    selectedRows.value.clear();
  } else {
    selectedRows.value = new Set(rows.value.map((_, index) => index));
  }
}

function isRowSelected(index: number): boolean {
  return selectedRows.value.has(index);
}

function isAllSelected(): boolean {
  return rows.value.length > 0 && selectedRows.value.size === rows.value.length;
}

function isIndeterminate(): boolean {
  return (
    selectedRows.value.size > 0 && selectedRows.value.size < rows.value.length
  );
}

function nextPage() {
  currentPage.value++;
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function onLimitChange() {
  currentPage.value = 1; // Resetar para primeira página ao mudar limit
  fetchRows();
}

function openCreateModal() {
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

function openEditModal(row: Record<string, any>) {
  selectedRowForEdit.value = { ...row }; // Copiar a row para não modificar a original
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  selectedRowForEdit.value = null;
}

async function handleRowCreated() {
  await fetchRows();
}

async function handleRowUpdated() {
  await fetchRows();
}

function getPrimaryKeyColumn(): Column | null {
  return columns.value.find((col) => col.is_primary_key) || null;
}

async function deleteSingleRow(row: Record<string, any>) {
  if (props.schema === "None" || props.table === "None") {
    return;
  }

  const pkColumn = getPrimaryKeyColumn();
  if (!pkColumn) {
    alert("Não foi possível encontrar a coluna de chave primária.");
    return;
  }

  const pkValue = row[pkColumn.column_name];
  if (pkValue === null || pkValue === undefined) {
    alert("Não foi possível encontrar o valor da chave primária.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:7020/rows?schema=${props.schema}&table=${props.table}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pk_column: pkColumn.column_name,
          pk_value: pkValue,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      alert(`Erro ao deletar row: ${error.message || "Erro desconhecido"}`);
      return;
    }

    // Sucesso - recarregar dados
    await fetchRows();
  } catch (error) {
    console.error("Error deleting row:", error);
    alert("Erro ao deletar row. Verifique o console para mais detalhes.");
  }
}

async function deleteSelectedRows() {
  if (props.schema === "None" || props.table === "None") {
    return;
  }

  if (selectedRows.value.size === 0) {
    return;
  }

  const pkColumn = getPrimaryKeyColumn();
  if (!pkColumn) {
    alert("Não foi possível encontrar a coluna de chave primária.");
    return;
  }

  deleting.value = true;
  const selectedIndices = Array.from(selectedRows.value);
  const errors: string[] = [];

  try {
    // Deletar cada row selecionada
    for (const index of selectedIndices) {
      const row = rows.value[index];

      if (!row) {
        errors.push(`Row ${index + 1}: row não encontrada`);
        continue;
      }

      const pkValue = row[pkColumn.column_name];

      if (pkValue === null || pkValue === undefined) {
        errors.push(`Row ${index + 1}: valor de chave primária não encontrado`);
        continue;
      }

      try {
        const response = await fetch(
          `http://localhost:7020/rows?schema=${props.schema}&table=${props.table}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pk_column: pkColumn.column_name,
              pk_value: pkValue,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          errors.push(
            `Row ${index + 1}: ${error.message || "Erro desconhecido"}`
          );
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: Erro ao deletar`);
        console.error(`Error deleting row ${index + 1}:`, error);
      }
    }

    if (errors.length > 0) {
      alert(`Alguns erros ocorreram:\n${errors.join("\n")}`);
    } else {
      // Sucesso - recarregar dados
      selectedRows.value.clear();
      await fetchRows();
    }
  } catch (error) {
    console.error("Error in delete operation:", error);
    alert("Erro ao deletar rows. Verifique o console para mais detalhes.");
  } finally {
    deleting.value = false;
  }
}

watch(
  () => [props.schema, props.table],
  () => {
    currentPage.value = 1;
    selectedRows.value.clear();
    fetchColumns();
    fetchRows();
  },
  { immediate: true }
);

watch(currentPage, () => {
  fetchRows();
});

watch(
  () => [selectedRows.value.size, rows.value.length],
  () => {
    nextTick(() => {
      if (selectAllCheckbox.value) {
        selectAllCheckbox.value.indeterminate = isIndeterminate();
      }
    });
  }
);

onMounted(() => {
  fetchColumns();
  fetchRows();
});
</script>

<template>
  <div class="w-full h-full">
    <div v-if="loading" class="text-center py-10">
      <p>Carregando dados...</p>
    </div>
    <div v-else-if="rows.length === 0" class="text-center py-10">
      <p class="text-gray-500">
        Selecione um schema e uma tabela para ver os dados
      </p>
    </div>
    <div v-else class="h-full flex flex-col">
      <!-- Controles de paginação e limit -->
      <div class="flex flex-wrap justify-between items-center bg-white p-4">
        <div class="flex items-center gap-4">
          <button
            @click="openCreateModal"
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
          >
            + Criar Nova Row
          </button>
          <button
            @click="deleteSelectedRows"
            :disabled="selectedRows.size === 0 || deleting"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              deleting ? "Deletando..." : `🗑️ Deletar (${selectedRows.size})`
            }}
          </button>
          <label class="text-sm font-medium text-gray-700"
            >Itens por página:</label
          >
          <select
            v-model="limit"
            @change="onLimitChange"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="opt in limitOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Anterior
          </button>
          <span class="text-sm font-medium text-gray-700">
            Página {{ currentPage }}
          </span>
          <button
            @click="nextPage"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
          >
            Próxima
          </button>
        </div>
      </div>

      <!-- Tabela de dados -->
      <div
        class="flex-1 overflow-auto bg-white rounded-lg border border-gray-300"
      >
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr>
              <!-- Checkbox para selecionar todos -->
              <th class="px-4 py-3 text-left border-b">
                <input
                  ref="selectAllCheckbox"
                  type="checkbox"
                  :checked="isAllSelected()"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <!-- Coluna de ações -->
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
              >
                Ações
              </th>
              <!-- Cabeçalhos das colunas com tipos -->
              <th
                v-for="column in columns"
                :key="column.column_name"
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
              >
                <div class="flex flex-col">
                  <span class="font-semibold">{{ column.column_name }}</span>
                  <span class="text-xs text-gray-500 font-normal mt-1">
                    {{ column.data_type }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(row, index) in rows"
              :key="index"
              :class="[
                'hover:bg-gray-50',
                isRowSelected(index) ? 'bg-blue-50' : '',
              ]"
            >
              <!-- Checkbox da linha -->
              <td class="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="isRowSelected(index)"
                  @change="toggleRowSelection(index)"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
              <!-- Ações da linha -->
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(row)"
                    class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs font-medium"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteSingleRow(row)"
                    class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-medium"
                  >
                    Deletar
                  </button>
                </div>
              </td>
              <!-- Dados da linha -->
              <td
                v-for="column in columns"
                :key="column.column_name"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
              >
                <span
                  v-if="
                    row[column.column_name] !== null &&
                    row[column.column_name] !== undefined
                  "
                >
                  {{ row[column.column_name] }}
                </span>
                <span v-else class="text-gray-400 italic">null</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Criação -->
    <CreateRowModal
      :show="showCreateModal"
      :columns="columns"
      :schema="props.schema"
      :table="props.table"
      @close="closeCreateModal"
      @created="handleRowCreated"
    />

    <!-- Modal de Edição -->
    <EditRowModal
      :show="showEditModal"
      :columns="columns"
      :schema="props.schema"
      :table="props.table"
      :row="selectedRowForEdit"
      @close="closeEditModal"
      @updated="handleRowUpdated"
    />
  </div>
</template>

<style scoped></style>
