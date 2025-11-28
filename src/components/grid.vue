<template>
    <div class="grid">
        <AgGridVue
            class="grid__table"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColDef"
            :autoGroupColumnDef="autoGroupColumnDef"
            :rowData="rowData"
            :getDataPath="getDataPath"
            :getRowNodeId="getRowNodeId"
            rowNumbers
            treeData
            animateRows
        />
    </div>
</template>

<script setup lang="ts" generic="T extends TreeItem">
import { computed } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import type { ColDef, ValueGetterParams } from 'ag-grid-community';
import { TreeStore, type TreeItem } from '../TreeStore';

const { items, columnNames } = defineProps<{
    items: T[];
    columnNames: {
        [K in keyof Omit<T, 'id' | 'parent'>]: string;
    };
}>();

const store = new TreeStore<T>(items);
const rowData = computed(() => store.getAll());

const getDataPath = (data: TreeItem) => {
    const parents = store.getAllParents(data.id);
    return parents.reverse().map((item) => item.id.toString());
};

const getRowNodeId = (data: TreeItem) => data.id;

const columnDefs = computed(() => {
    return Object.entries(columnNames).map(([key, name]) => ({
        headerName: name,
        valueGetter: (params: ValueGetterParams<T>) => {
            if (!params.data) {
                return '';
            }
            return params.data[key];
        },
    }));
});

const defaultColDef = {
    resizable: true,
    sortable: true,
};

const autoGroupColumnDef: ColDef<T> = {
    headerName: 'Категория',
    valueGetter: (params: ValueGetterParams<T>) => {
        if (!params.data) {
            return '';
        }
        const id = params.data.id;
        const category = store.hasChildren(id) ? 'Группа' : 'Элемент';

        return `${category} (id: ${id})`;
    },
    cellRendererParams: {
        suppressCount: true,
    },
};
</script>

<style scoped>
.grid {
    width: 100%;
    height: 500px;
    margin: 0 auto;
}

.grid__table {
    width: 100%;
    height: 100%;
}
</style>
