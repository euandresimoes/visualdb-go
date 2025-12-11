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
const formData = ref<Record<string, any>>({});
const submitting = ref<boolean>(false);
const formErrors = ref<Record<string, string>>({});
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
    // Skip auto-increment primary keys
    return !(col.is_primary_key && col.column_default?.includes("nextval"));
  });
}
function initializeFormData() {
  formData.value = {};
  formErrors.value = {};
  
  getEditableColumns().forEach((col) => {
    // Initialize with empty string for all fields
    formData.value[col.column_name] = "";
    
    // Only set default value if it exists and not a sequence
    if (col.column_default && !col.column_default.includes("nextval")) {
      formData.value[col.column_name] = col.column_default;
    }
  });
}
function validateForm(): boolean {
  formErrors.value = {};
  let isValid = true;
  getEditableColumns().forEach((col) => {
    const value = formData.value[col.column_name];
    
    // Check required fields
    if (col.is_nullable === "NO" && (value === "" || value === null || value === undefined)) {
      formErrors.value[col.column_name] = "This field is required";
      isValid = false;
    }
  });
  return isValid;
}
function closeModal() {
  emit("close");
  formData.value = {};
  formErrors.value = {};
}
async function createRow() {
  if (!validateForm()) {
    return;
  }
  if (props.schema === "None" || props.table === "None") {
    return;
  }
  submitting.value = true;
  
  try {
    // Prepare payload with only non-empty values
    const payload: Record<string, any> = {};
    
    getEditableColumns().forEach((col) => {
      const value = formData.value[col.column_name];
      
      // Skip empty strings for non-required fields
      if (value === "" && col.is_nullable === "YES") {
        return;
      }
      
      // Convert empty strings to null for nullable fields
      if (value === "" && col.is_nullable === "NO") {
        payload[col.column_name] = null;
      } else {
        payload[col.column_name] = value;
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
      throw new Error(error.message || "Failed to create row");
    }
    closeModal();
    emit("created");
  } catch (error) {
    console.error("Error creating row:", error);
    alert(`Error: ${error.message || "Failed to create row"}`);
  } finally {
    submitting.value = false;
  }
}
watch(() => props.show, (newValue) => {
  if (newValue) {
    initializeFormData();
  }
});
</script>
<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="absolute inset-0 bg-black/5 backdrop-blur-sm" @click="closeModal"></div>
    <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Create New Row</h2>
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
            class="space-y-1"
          >
            <label class="block text-sm font-medium text-gray-700">
              {{ column.column_name }}
              <span v-if="column.is_nullable === 'NO'" class="text-red-500">*</span>
              <span class="text-xs text-gray-500 ml-2">({{ column.data_type }})</span>
            </label>
            <div v-if="isTimestampType(column.data_type)">
              <input
                v-model="formData[column.column_name]"
                type="datetime-local"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                :class="formErrors[column.column_name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'"
                :required="column.is_nullable === 'NO'"
              />
            </div>
            <input
              v-else-if="['integer', 'numeric', 'decimal', 'real', 'double', 'serial', 'bigserial'].some(type => 
                column.data_type.includes(type)
              )"
              v-model="formData[column.column_name]"
              type="number"
              step="any"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              :class="formErrors[column.column_name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'"
              :required="column.is_nullable === 'NO'"
            />
            <select
              v-else-if="column.data_type === 'boolean'"
              v-model="formData[column.column_name]"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              :class="formErrors[column.column_name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'"
              :required="column.is_nullable === 'NO'"
            >
              <option value="">-- Select --</option>
              <option :value="true">True</option>
              <option :value="false">False</option>
            </select>
            <textarea
              v-else-if="column.data_type.includes('text') || column.data_type.includes('varchar')"
              v-model="formData[column.column_name]"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              :class="formErrors[column.column_name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'"
              :required="column.is_nullable === 'NO'"
              rows="3"
            ></textarea>
            <input
              v-else
              v-model="formData[column.column_name]"
              type="text"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              :class="formErrors[column.column_name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'"
              :required="column.is_nullable === 'NO'"
            />
            <p v-if="formErrors[column.column_name]" class="text-red-500 text-sm mt-1">
              {{ formErrors[column.column_name] }}
            </p>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              :disabled="submitting"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="submitting"
            >
              <span v-if="submitting">Creating...</span>
              <span v-else>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>