import { createApp } from 'vue';
import App from './App.vue';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { TreeDataModule, RowNumbersModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule, RowNumbersModule]);

createApp(App).mount('#app');
