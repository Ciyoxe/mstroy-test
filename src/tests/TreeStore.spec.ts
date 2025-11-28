import { describe, expect, it } from 'vitest';
import type { TreeItem } from '../TreeStore';
import { TreeStore } from '../TreeStore';

const seedItems: TreeItem[] = [
    { id: 1, parent: null, label: 'Айтем 1' },
    { id: '91064cee', parent: 1, label: 'Айтем 2' },
    { id: 3, parent: 1, label: 'Айтем 3' },
    { id: 4, parent: '91064cee', label: 'Айтем 4' },
    { id: 5, parent: '91064cee', label: 'Айтем 5' },
    { id: 6, parent: '91064cee', label: 'Айтем 6' },
    { id: 7, parent: 4, label: 'Айтем 7' },
    { id: 8, parent: 4, label: 'Айтем 8' },
];

const createStore = () => new TreeStore(seedItems);
const idsOf = (items: TreeItem[]) => items.map((item) => item.id).sort();

describe('TreeStore', () => {
    describe('read helpers', () => {
        it('getAll returns a detached copy', () => {
            const store = createStore();
            const all = store.getAll();

            expect(all).toEqual(seedItems);
            expect(all).not.toBe(seedItems);
        });

        it('getItem finds entries by id', () => {
            const store = createStore();
            expect(store.getItem(1)?.label).toBe('Айтем 1');
            expect(store.getItem('91064cee')?.label).toBe('Айтем 2');
            expect(store.getItem(999)).toBeUndefined();
        });
    });

    describe('hierarchy traversal', () => {
        it('getChildren lists direct children only', () => {
            const store = createStore();
            expect(idsOf(store.getChildren(1))).toEqual(['91064cee', 3].sort());
            expect(idsOf(store.getChildren('91064cee'))).toEqual([4, 5, 6].sort());
            expect(idsOf(store.getChildren(4))).toEqual([7, 8].sort());
            expect(store.getChildren(7)).toEqual([]);
        });

        it('getAllChildren walks through every descendant', () => {
            const store = createStore();
            expect(idsOf(store.getAllChildren(1))).toEqual(['91064cee', 3, 4, 5, 6, 7, 8].sort());
            expect(idsOf(store.getAllChildren('91064cee'))).toEqual([4, 5, 6, 7, 8].sort());
            expect(idsOf(store.getAllChildren(4))).toEqual([7, 8].sort());
            expect(store.getAllChildren(8)).toEqual([]);
        });

        it('getAllParents returns path up to the root', () => {
            const store = createStore();
            expect(store.getAllParents(7).map((i) => i.id)).toEqual([7, 4, '91064cee', 1]);
            expect(store.getAllParents(1).map((i) => i.id)).toEqual([1]);
            expect(store.getAllParents(999)).toEqual([]);
        });
    });

    describe('mutations', () => {
        it('addItem inserts and exposes new nodes', () => {
            const store = createStore();
            store.addItem({ id: 9, parent: 3, label: 'Айтем 9' });
            expect(store.getItem(9)).toMatchObject({ id: 9, parent: 3, label: 'Айтем 9' });
            expect(store.getChildren(3).map((i) => i.id)).toContain(9);
            expect(store.getAll()).toHaveLength(seedItems.length + 1);
        });

        it('addItem rejects duplicate ids', () => {
            const store = createStore();
            expect(() => store.addItem({ id: 1, parent: null, label: 'Дубликат' })).toThrowError();
        });

        it('addItem can create new root nodes', () => {
            const store = createStore();
            store.addItem({ id: 'root', parent: null, label: 'Новый корень' });
            expect(store.getChildren(null).map((i) => i.id)).toContain('root');
            expect(store.getItem('root')?.parent).toBeNull();
        });

        it('updateItem handles parent changes', () => {
            const store = createStore();
            store.updateItem({ id: 3, parent: '91064cee', label: 'Айтем 3 изменён' });

            expect(store.getItem(3)).toMatchObject({ parent: '91064cee', label: 'Айтем 3 изменён' });
            expect(store.getChildren(1).map((i) => i.id)).not.toContain(3);
            expect(store.getChildren('91064cee').map((i) => i.id)).toContain(3);
        });

        it('updateItem without parent change keeps siblings intact', () => {
            const store = createStore();
            store.updateItem({ id: 4, parent: '91064cee', label: 'Айтем 4 переименован' });
            const siblings = store.getChildren('91064cee').map((i) => i.id);
            expect(store.getItem(4)?.label).toBe('Айтем 4 переименован');
            expect(siblings).toContain(4);
            expect(siblings.length).toBe(3);
        });

        it('updateItem throws for unknown ids', () => {
            const store = createStore();
            expect(() =>
                store.updateItem({ id: 999, parent: null, label: 'Не существует' } as TreeItem),
            ).toThrowError();
        });

        it('removeItem deletes nodes and descendants', () => {
            const store = createStore();
            store.removeItem('91064cee');

            expect(idsOf(store.getAll())).toEqual([1, 3].sort());
            ['91064cee', 4, 5, 6, 7, 8].forEach((id) => expect(store.getItem(id)).toBeUndefined());
            expect(store.getChildren(1).map((i) => i.id)).toEqual([3]);
        });

        it('removeItem throws when id missing', () => {
            const store = createStore();
            expect(() => store.removeItem(999)).throws();
        });
    });
});
