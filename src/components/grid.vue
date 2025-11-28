<template>
    <div class="grid">
        <AgGridVue
            class="grid__table"
            animateRows
            treeData
            :columnDefs
            :autoGroupColumnDef
            :rowData
            :getDataPath
            :rowNumbers
        />
    </div>
</template>

<script setup lang="ts" generic="T extends TreeItem">
import { computed } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import type { ValueGetterParams } from 'ag-grid-community';
import { TreeStore, type TreeItem } from '../TreeStore';

const { items, columnNames } = defineProps<{
    items: T[];
    columnNames: {
        [K in keyof Omit<T, 'id' | 'parent'>]: string;
    };
}>();

const store = new TreeStore<T>(items);
const rowData = computed(() => store.getAll());

const columnDefs = computed(() => {
    return Object.entries(columnNames).map(([key, name]) => ({
        headerName: name,
        valueGetter: (params: ValueGetterParams<T>) => {
            if (!params.data) {
                return '';
            }
            return params.data[key];
        },
        flex: 1,
    }));
});

const autoGroupColumnDef = {
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
    width: 300,
};

const getDataPath = (data: TreeItem) =>
    store
        .getAllParents(data.id)
        .reverse()
        .map((item) => item.id.toString());

class RowNumberHeaderComponent {
    private el;

    constructor() {
        this.el = document.createElement('span');
        this.el.textContent = '№ п/п';
    }
    getGui() {
        return this.el;
    }
}

const rowNumbers = {
    minWidth: 80,
    headerComponent: RowNumberHeaderComponent,
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
