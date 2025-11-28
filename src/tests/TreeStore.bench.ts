import { bench, describe } from 'vitest';
import { TreeStore, type TreeItem } from '../TreeStore';

type BenchmarkNode = TreeItem & { label: string };

interface GeneratedTree {
    items: BenchmarkNode[];
    rootId: TreeItem['id'];
    leafIds: TreeItem['id'][];
    midNodeId: TreeItem['id'];
}

const generateTree = (levels: number, branching: number): GeneratedTree => {
    if (levels < 1 || branching < 1) {
        throw new Error('levels and branching must be >= 1');
    }

    const items: BenchmarkNode[] = [];
    const leafIds: TreeItem['id'][] = [];
    let currentLayer: BenchmarkNode[] = [];
    let nextId = 1;

    const root: BenchmarkNode = { id: nextId++, parent: null, label: 'Root' };
    items.push(root);
    currentLayer.push(root);

    for (let level = 1; level < levels; level += 1) {
        const nextLayer: BenchmarkNode[] = [];
        for (const parent of currentLayer) {
            for (let offset = 0; offset < branching; offset += 1) {
                const node: BenchmarkNode = {
                    id: nextId,
                    parent: parent.id,
                    label: `Node ${nextId}`,
                };
                nextId += 1;
                items.push(node);
                nextLayer.push(node);
            }
        }
        currentLayer = nextLayer;
    }

    leafIds.push(...currentLayer.map((node) => node.id));

    return {
        items,
        leafIds,
        rootId: root.id,
        midNodeId: items.find((node) => node.parent === root.id)?.id ?? root.id,
    };
};

const TREE_CONFIG = {
    levels: 6,
    branchingFactor: 5,
};

const dataset = generateTree(TREE_CONFIG.levels, TREE_CONFIG.branchingFactor);
const sharedStore = new TreeStore(dataset.items);

const pickLeaf = (index = 0) => dataset.leafIds[Math.min(index, dataset.leafIds.length - 1)] ?? dataset.rootId;

const freshStore = () => new TreeStore(dataset.items);

let dynamicId = dataset.items.length + 1;

describe('TreeStore bench', () => {
    bench('getChildren(root)', () => {
        sharedStore.getChildren(dataset.rootId);
    });

    bench('getChildren(mid node)', () => {
        sharedStore.getChildren(dataset.midNodeId);
    });

    bench('getAllChildren(mid node)', () => {
        sharedStore.getAllChildren(dataset.midNodeId);
    });

    bench('getAllChildren(parent of deep leaf)', () => {
        const parentId = sharedStore.getItem(pickLeaf(10))?.parent ?? null;
        sharedStore.getAllChildren(parentId);
    });

    bench('getAllParents(deep leaf)', () => {
        sharedStore.getAllParents(pickLeaf(10));
    });

    bench('addItem on fresh store', () => {
        const store = freshStore();
        store.addItem({
            id: dynamicId++,
            parent: pickLeaf(),
            label: 'Bench node',
        });
    });

    bench('updateItem on fresh store', () => {
        const store = freshStore();
        const target = store.getItem(pickLeaf()) as BenchmarkNode;
        store.updateItem({ ...target, label: 'Updated during bench' });
    });

    bench('removeItem on fresh store', () => {
        const store = freshStore();
        store.removeItem(dataset.midNodeId);
    });

    bench('constructor with large dataset', () => {
        freshStore();
    });
});
