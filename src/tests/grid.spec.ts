import Grid from '@/components/Grid.vue';
import type { TreeItem } from '@/lib/TreeStore';
import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';

const AgGridStub = defineComponent({
    name: 'AgGridVue',
    props: {
        columnDefs: { type: Array, required: true },
        autoGroupColumnDef: { type: Object, required: true },
        rowData: { type: Array, required: true },
        getDataPath: { type: Function, required: true },
        rowNumbers: { type: Object, required: true },
        treeData: { type: Boolean, default: false },
        animateRows: { type: Boolean, default: false },
    },
    setup(_, { slots }) {
        return () => h('div', { class: 'ag-grid-stub' }, slots.default?.());
    },
});

const sampleItems: TreeItem[] = [
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

type ExposedGridProps = {
    columnDefs: Array<{
        headerName?: string;
        valueGetter: (params: { data?: TreeItem }) => unknown;
    }>;
    autoGroupColumnDef: {
        valueGetter: (params: { data?: TreeItem }) => string;
    };
    rowData: TreeItem[];
    getDataPath: (data: TreeItem) => string[];
    rowNumbers: {
        minWidth?: number;
        headerComponent: new () => { getGui(): HTMLElement };
    };
    treeData?: boolean;
    animateRows?: boolean;
};

const mountGrid = () =>
    mount(Grid, {
        props: { items: sampleItems, columnNames },
        global: { stubs: { AgGridVue: AgGridStub } },
    });

const getAgGridProps = (wrapper: VueWrapper): ExposedGridProps =>
    wrapper.findComponent(AgGridStub).props() as ExposedGridProps;

const mountAndExtract = () => {
    const wrapper = mountGrid();
    return { wrapper, props: getAgGridProps(wrapper) };
};

describe('grid.vue', () => {
    it('passes normalized rowData and columnDefs to AgGridVue', () => {
        const { props } = mountAndExtract();

        expect(props.rowData).toEqual(sampleItems);
        expect(props.columnDefs).toHaveLength(Object.keys(columnNames).length);

        const firstColumn = props.columnDefs[0]!;
        const firstDataRow = sampleItems[0]!;
        expect(firstColumn.headerName).toBe('Название');

        if (typeof firstColumn.valueGetter !== 'function') {
            throw new Error('valueGetter is not defined for the first column');
        }

        const getterResult = firstColumn.valueGetter({ data: firstDataRow });
        expect(getterResult).toBe(firstDataRow.label);
    });

    it('labels groups versus elements through autoGroupColumnDef', () => {
        const wrapper = mountGrid();
        const { autoGroupColumnDef } = getAgGridProps(wrapper);

        if (typeof autoGroupColumnDef.valueGetter !== 'function') {
            throw new Error('autoGroupColumnDef valueGetter is missing');
        }

        const rootLabel = autoGroupColumnDef.valueGetter({ data: sampleItems[0]! });
        const leafLabel = autoGroupColumnDef.valueGetter({ data: sampleItems[6]! });

        expect(rootLabel).toBe('Группа (id: 1)');
        expect(leafLabel).toBe('Элемент (id: 7)');
    });

    it('builds correct hierarchical path via getDataPath', () => {
        const { props } = mountAndExtract();
        const { getDataPath } = props;

        const path = getDataPath(sampleItems[6]!);
        expect(path).toEqual(['1', '91064cee', '4', '7']);
        expect(getDataPath(sampleItems[0]!)).toEqual(['1']);
    });

    it('exposes rowNumbers configuration with header component', () => {
        const {
            props: { rowNumbers, treeData, animateRows },
        } = mountAndExtract();

        expect(treeData).toBe(true);
        expect(animateRows).toBe(true);
        expect(rowNumbers.minWidth).toBe(80);

        const headerInstance = new rowNumbers.headerComponent();
        expect(headerInstance.getGui().textContent).toBe('№ п/п');
    });
});
