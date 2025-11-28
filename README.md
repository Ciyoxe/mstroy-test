## TreeStore + AG Grid demo

Проект демонстрирует класс `TreeStore` для работы с древовидными данными и Vue‑компонент на основе `ag-grid-vue3`, который визуализирует дерево в виде таблицы с группировкой строк.

### TreeStore

- **Класс и типы**: `src/lib/TreeStore.ts`
    - **Методы**:
        - `getAll(): T[]` – все элементы (копия массива).
        - `getItem(id: Id): T | undefined` – один элемент по `id`.
        - `getChildren(id: Id | null): T[]` – прямые дети.
        - `getAllChildren(id: Id | null): T[]` – все потомки на любой глубине.
        - `getAllParents(id: Id): T[]` – цепочка от элемента до корня (элемент включительно).
        - `addItem(item: T): void` – добавить элемент, бросает ошибку при дубликате `id`.
        - `updateItem(item: T): void` – обновить элемент, при смене `parent` перестраивает связи.
        - `removeItem(id: Id): void` – удалить элемент и всех его потомков.
        - `hasChildren(id: Id | null): boolean` – есть ли у узла дети (удобно для UI).

### Визуализация с AG Grid

- **Компонент грида**: `src/components/Grid.vue`
    - Принимает пропсы:
        - `items` – массив элементов.
        - `columnNames` – заголовки колонок.
    - Использует:
        - `TreeStore` для построения дерева.
        - `<AgGridVue>` с опциями:
            - `treeData` + `getDataPath` для иерархии.
            - `autoGroupColumnDef` с выводом категории строки: **Группа** / **Элемент**.
            - `rowNumbers` (Enterprise Row Numbers) для колонки `№ п/п`.

- **Точка входа**:
    - `src/App.vue` – монтирует `Grid.vue`, передаёт демо‑датасет.
    - `src/main.ts` – регистрирует модули AG Grid:
        - `AllCommunityModule` (community‑функциональность),
        - `TreeDataModule`, `RowNumbersModule` (enterprise‑фичи, необходимые для treeData и нумерации строк).

### Команды

- **Установка зависимостей**

```sh
npm install
```

- **Запуск dev‑сервера (Vite + Vue 3)**

```sh
npm run dev
```

- **Сборка (type‑check + production build)**

```sh
npm run build
```

- **Предпросмотр прод‑сборки**

```sh
npm run preview
```

- **Запуск unit‑тестов (Vitest)**

```sh
npm run test
```

- **Запуск бенчмарков `TreeStore`**

```sh
npm run bench
```
