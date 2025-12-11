<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import TableRows from "./TableRows.vue";

interface TableTab {
  id: string;
  schema: string;
  table: string;
  title: string;
  active: boolean;
}

const props = defineProps<{
  schema: string;
  table: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: { schema: string; table: string }): void;
}>();

const tabs = ref<TableTab[]>([]);
const activeTabId = ref<string | null>(null);

// Generate a unique ID for each tab
const generateId = () => Math.random().toString(36).substr(2, 9);

// Add a new tab
const addTab = (schema: string, table: string) => {
  if (schema === "None" || table === "None") return;

  const tabId = generateId();
  const title = `${schema}.${table}`;

  // Check if tab already exists
  const existingTabIndex = tabs.value.findIndex(
    (tab) => tab.schema === schema && tab.table === table
  );

  if (existingTabIndex >= 0) {
    // Activate existing tab
    setActiveTab(tabs.value[existingTabIndex]!.id);
    return;
  }

  // Add new tab
  const newTab = {
    id: tabId,
    schema,
    table,
    title,
    active: false,
  };

  tabs.value = [...tabs.value, newTab];
  setActiveTab(tabId);
};

// Set active tab
const setActiveTab = (tabId: string) => {
  tabs.value = tabs.value.map((tab) => ({
    ...tab,
    active: tab.id === tabId,
  }));

  activeTabId.value = tabId;
  const activeTab = tabs.value.find((tab) => tab.id === tabId);

  if (activeTab) {
    emit("update:modelValue", {
      schema: activeTab.schema,
      table: activeTab.table,
    });
  }
};

// Close a tab
const closeTab = (tabId: string, event: MouseEvent) => {
  event.stopPropagation();

  const tabIndex = tabs.value.findIndex((tab) => tab.id === tabId);
  if (tabIndex === -1) return;

  const newTabs = tabs.value.filter((tab) => tab.id !== tabId);
  tabs.value = newTabs;

  // If the closed tab was active, activate another tab
  if (tabId === activeTabId.value) {
    if (newTabs.length > 0) {
      // Try to activate the next tab, or the previous one if it was the last
      const newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
      setActiveTab(newActiveTab!.id);
    } else {
      // No tabs left
      activeTabId.value = null;
      emit("update:modelValue", { schema: "None", table: "None" });
    }
  }
};

// Watch for schema/table changes to add new tabs
watch(
  () => ({ schema: props.schema, table: props.table }),
  ({ schema, table }) => {
    if (schema !== "None" && table !== "None") {
      addTab(schema, table);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="table-tabs-container">
    <!-- Tabs -->
    <div class="tabs-header">
      <div class="tabs-container">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: tab.active }"
          @click="setActiveTab(tab.id)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <button
            class="tab-close"
            @click="closeTab(tab.id, $event)"
            aria-label="Close tab"
          >
            &times;
          </button>
        </div>
      </div>
      <div class="tabs-actions">
        <slot name="tabs-actions"></slot>
      </div>
    </div>

    <!-- Active tab content -->
    <div class="tab-content">
      <div v-if="!activeTabId" class="no-tabs-message">
        No tables open. Select a table from the sidebar to get started.
      </div>
      <template v-else>
        <TableRows
          v-for="tab in tabs"
          v-show="tab.active"
          :key="tab.id"
          :schema="tab.schema"
          :table="tab.table"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.table-tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 0 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tabs-container {
  display: flex;
  flex: 1;
  min-width: 0;
}

.tab {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  margin: 0.25rem 0.25rem 0 0;
  background-color: #e0e0e0;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  position: relative;
  max-width: 200px;
  min-width: 120px;
}

.tab:hover {
  background-color: #d0d0d0;
}

.tab.active {
  background-color: #fff;
  border-bottom: 1px solid #fff;
  margin-bottom: -1px;
  z-index: 1;
  box-shadow: 0 2px 0 -1px #fff;
}

.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  padding-right: 1rem;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  border-radius: 50%;
  color: #666;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  transition: all 0.2s;
}

.tab-close:hover {
  background-color: #ccc;
  color: #000;
}

.tabs-actions {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  border-left: 1px solid #ddd;
  margin-left: 0.5rem;
}

.tab-content {
  flex: 1;
  overflow: auto;
  position: relative;
  background-color: #fff;
}

.no-tabs-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-style: italic;
  padding: 2rem;
  text-align: center;
}

/* Custom scrollbar for tabs container */
.tabs-header::-webkit-scrollbar {
  height: 6px;
}

.tabs-header::-webkit-scrollbar-thumb {
  background-color: #aaa;
  border-radius: 3px;
}

.tabs-header::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
</style>
