export type Id = string | number;

export type TreeItem = { id: Id; parent: Id | null } & Record<string, unknown>;

export class TreeStore<T extends TreeItem> {
    private itemsGroupedById: Map<Id, T>;
    private childrenGroupedByParent: Map<Id | null, Set<Id>>;

    private setChild(parentId: Id | null, childId: Id) {
        const children = this.childrenGroupedByParent.get(parentId);
        if (children) {
            children.add(childId);
        } else {
            this.childrenGroupedByParent.set(parentId, new Set([childId]));
        }
    }
    private removeChild(parentId: Id | null, childId: Id) {
        const children = this.childrenGroupedByParent.get(parentId);
        if (children) {
            children.delete(childId);
        } else {
            throw new Error(`${childId} is not a child of ${parentId}`);
        }
    }

    constructor(items: T[]) {
        this.itemsGroupedById = new Map();
        this.childrenGroupedByParent = new Map();

        for (const item of items) {
            this.addItem(item);
        }
    }

    /** Возвращает исходный массив элементов (копию). */
    getAll(): T[] {
        return Array.from(this.itemsGroupedById.values());
    }

    /** Возвращает элемент по id. */
    getItem(id: Id): T | undefined {
        return this.itemsGroupedById.get(id);
    }

    /** Возвращает прямых дочерних элементов по id родителя. */
    getChildren(id: Id | null): T[] {
        const childrenIds = this.childrenGroupedByParent.get(id);
        const childrenItems = [] as T[];

        if (childrenIds) {
            for (const id of childrenIds) childrenItems.push(this.getItem(id)!);
        }
        return childrenItems;
    }

    hasChildren(id: Id | null) {
        return Boolean(this.childrenGroupedByParent.get(id)?.size);
    }

    /** Возвращает всех дочерних элементов (прямых и вложенных) для элемента с данным id. */
    getAllChildren(id: Id | null): T[] {
        if (!this.childrenGroupedByParent.has(id)) {
            return [];
        }

        const result: T[] = [];
        const stack: Id[] = [...this.childrenGroupedByParent.get(id)!];

        while (stack.length) {
            const currentId = stack.pop()!;
            const current = this.getItem(currentId);
            if (!current) continue;

            result.push(current);

            const childrenIds = this.childrenGroupedByParent.get(currentId);
            if (childrenIds && childrenIds.size) {
                stack.push(...childrenIds.values());
            }
        }

        return result;
    }

    /**
     * Возвращает цепочку родителей, начиная с самого элемента, чей id передан в аргументе, и до корня.
     * Порядок: [элемент, его родитель, ..., корневой элемент].
     */
    getAllParents(id: Id): T[] {
        const result: T[] = [];
        let current = this.getItem(id);

        while (current) {
            result.push(current);
            if (current.parent === null || current.parent === undefined) {
                break;
            }
            current = this.getItem(current.parent);
        }

        return result;
    }

    /** Добавляет новый элемент в хранилище. */
    addItem(item: T): void {
        if (this.itemsGroupedById.has(item.id)) {
            throw new Error(`Item with id "${item.id}" already exists`);
        }

        this.itemsGroupedById.set(item.id, item);
        this.setChild(item.parent, item.id);
    }

    /** Обновляет элемент в хранилище. Ожидается полный объект с тем же id. */
    updateItem(itemToUpdate: T): void {
        const existing = this.getItem(itemToUpdate.id);
        if (!existing) {
            throw new Error(`Item with id "${itemToUpdate.id}" does not exist`);
        }

        this.itemsGroupedById.set(itemToUpdate.id, itemToUpdate);

        // Если изменился parent, нужно обновить индексы дочерних связей
        const oldParentId = existing.parent;
        const newParentId = itemToUpdate.parent;

        if (oldParentId !== newParentId) {
            this.removeChild(oldParentId, itemToUpdate.id);
            this.setChild(newParentId, itemToUpdate.id);

            // по хорошему, тут надо чекнуть, не появились ли циклы в 'графе'
            // но тогда время выполнения метода улетит в небеса
        }
    }

    /** Удаляет элемент и всех его потомков из хранилища. */
    removeItem(id: Id): void {
        const rootItem = this.getItem(id);
        if (!rootItem) {
            throw new Error(`Item with id ${id} does not exists`);
        }

        this.removeChild(rootItem.parent, rootItem.id);

        const itemsToDelete = this.getAllChildren(id).concat([rootItem]);
        for (const item of itemsToDelete) {
            this.itemsGroupedById.delete(item.id);
            this.childrenGroupedByParent.delete(item.id);
        }
    }
}
