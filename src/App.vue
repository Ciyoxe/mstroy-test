<template>
    <main class="app-shell">
        <TreeStoreGrid :items :column-names />
    </main>
</template>

<script setup lang="ts">
import TreeStoreGrid from './components/grid.vue';

const items = [
    { id: 1, parent: null, label: 'Айтем 1' },
    { id: '91064cee', parent: 1, label: 'Айтем 2' },
    { id: 3, parent: 1, label: 'Айтем 3' },
    { id: 4, parent: '91064cee', label: 'Айтем 4' },
    { id: 5, parent: '91064cee', label: 'Айтем 5' },
    { id: 6, parent: '91064cee', label: 'Айтем 6' },
    { id: 7, parent: 4, label: 'Айтем 7' },
    { id: 8, parent: 4, label: 'Айтем 8' },
];
const columnNames = {
    label: 'Название',
};
</script>

<style scoped>
.app-shell {
    min-height: 100vh;
    padding: 2rem 1rem;
    box-sizing: border-box;
    background: #f7f8fc;
    font-family: 'Inter', system-ui, sans-serif;
}

header {
    margin-bottom: 1.25rem;
}

header h1 {
    margin: 0 0 0.25rem;
    font-size: 1.75rem;
}

header p {
    margin: 0;
    color: #5a5f70;
}
</style>
