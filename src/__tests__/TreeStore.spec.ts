import { describe, expect, it } from 'vitest';
import type { TreeItem } from '../TreeStore';
import { TreeStore } from '../TreeStore';

const items: TreeItem[] = [
    { id: 1, parent: null, label: 'Айтем 1' },
    { id: '91064cee', parent: 1, label: 'Айтем 2' },
    { id: 3, parent: 1, label: 'Айтем 3' },
    { id: 4, parent: '91064cee', label: 'Айтем 4' },
    { id: 5, parent: '91064cee', label: 'Айтем 5' },
    { id: 6, parent: '91064cee', label: 'Айтем 6' },
    { id: 7, parent: 4, label: 'Айтем 7' },
    { id: 8, parent: 4, label: 'Айтем 8' },
];

describe('TreeStore', () => {
    it('getAll should return all items', () => {
        const store = new TreeStore(items);
        const all = store.getAll();

        expect(all).toHaveLength(items.length);
        expect(all).toEqual(items);
        expect(all).not.toBe(items); // должна быть копия
    });

    it('getItem should return correct item by id', () => {
        const store = new TreeStore(items);

        expect(store.getItem(1)?.label).toBe('Айтем 1');
        expect(store.getItem('91064cee')?.label).toBe('Айтем 2');
        expect(store.getItem(999)).toBeUndefined();
    });

    it('getChildren should return direct children for given parent id', () => {
        const store = new TreeStore(items);

        const childrenOf1 = store.getChildren(1);
        expect(childrenOf1.map((i) => i.id).sort()).toEqual(['91064cee', 3].sort());

        const childrenOf91064 = store.getChildren('91064cee');
        expect(childrenOf91064.map((i) => i.id).sort()).toEqual([4, 5, 6].sort());

        const childrenOf4 = store.getChildren(4);
        expect(childrenOf4.map((i) => i.id).sort()).toEqual([7, 8].sort());

        const childrenOfLeaf = store.getChildren(7);
        expect(childrenOfLeaf).toEqual([]);
    });

    it('getAllChildren should return all descendants (deep) for given parent id', () => {
        const store = new TreeStore(items);

        const allChildrenOf1 = store.getAllChildren(1);
        expect(allChildrenOf1.map((i) => i.id).sort()).toEqual(['91064cee', 3, 4, 5, 6, 7, 8].sort());

        const allChildrenOf91064 = store.getAllChildren('91064cee');
        expect(allChildrenOf91064.map((i) => i.id).sort()).toEqual([4, 5, 6, 7, 8].sort());

        const allChildrenOf4 = store.getAllChildren(4);
        expect(allChildrenOf4.map((i) => i.id).sort()).toEqual([7, 8].sort());
    });

    it('getAllParents should return chain from item to root (inclusive)', () => {
        const store = new TreeStore(items);

        // Для элемента 7 путь: 7 -> 4 -> '91064cee' -> 1
        const parentsOf7 = store.getAllParents(7);
        expect(parentsOf7.map((i) => i.id)).toEqual([7, 4, '91064cee', 1]);

        // Для корневого элемента только он сам
        const parentsOf1 = store.getAllParents(1);
        expect(parentsOf1.map((i) => i.id)).toEqual([1]);
    });

    it('addItem should add new item and make it available via methods', () => {
        const store = new TreeStore(items);

        store.addItem({ id: 9, parent: 3, label: 'Айтем 9' });

        expect(store.getItem(9)).toMatchObject({ id: 9, parent: 3, label: 'Айтем 9' });
        expect(store.getChildren(3).map((i) => i.id)).toContain(9);
        expect(store.getAll()).toHaveLength(items.length + 1);
    });

    it('addItem should throw on duplicate id', () => {
        const store = new TreeStore(items);

        expect(() => store.addItem({ id: 1, parent: null, label: 'Дубликат' })).toThrowError();
    });

    it('updateItem should update existing item and handle parent change', () => {
        const store = new TreeStore(items);

        // Переносим элемент 3 под '91064cee'
        store.updateItem({ id: 3, parent: '91064cee', label: 'Айтем 3 изменён' });

        const updated = store.getItem(3)!;
        expect(updated.parent).toBe('91064cee');
        expect(updated.label).toBe('Айтем 3 изменён');

        const childrenOf1 = store.getChildren(1);
        expect(childrenOf1.map((i) => i.id)).not.toContain(3);

        const childrenOf91064 = store.getChildren('91064cee');
        expect(childrenOf91064.map((i) => i.id)).toContain(3);
    });

    it('updateItem should throw when item does not exist', () => {
        const store = new TreeStore(items);

        expect(() => store.updateItem({ id: 999, parent: null, label: 'Не существует' } as TreeItem)).toThrowError();
    });

    it('removeItem should remove item and all its descendants', () => {
        const store = new TreeStore(items);

        // Удаляем id = '91064cee' и всех его потомков
        store.removeItem('91064cee');

        const remainingIds = store
            .getAll()
            .map((i) => i.id)
            .sort();
        expect(remainingIds).toEqual([1, 3].sort());

        // Проверяем, что потомков больше нет в структуре
        expect(store.getItem('91064cee')).toBeUndefined();
        expect(store.getItem(4)).toBeUndefined();
        expect(store.getItem(5)).toBeUndefined();
        expect(store.getItem(6)).toBeUndefined();
        expect(store.getItem(7)).toBeUndefined();
        expect(store.getItem(8)).toBeUndefined();
    });

    it('removeItem should throw error if item does not exists', () => {
        const store = new TreeStore(items);
        expect(() => store.removeItem(999)).throws();
    });
});
