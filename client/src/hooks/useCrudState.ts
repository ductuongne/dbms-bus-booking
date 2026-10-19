import { useState, useMemo } from 'react';

export interface UseCrudStateOptions<T> {
  initialData: T[];
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
}

export function useCrudState<T extends { id?: string }>({
  initialData,
  searchFilter,
  pageSize = 10,
}: UseCrudStateOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) {
      return data;
    }
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => searchFilter(item, q));
  }, [data, searchQuery, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const addItem = (item: T) => {
    setData((prev) => [item, ...prev]);
    setIsCreateModalOpen(false);
  };

  const updateItem = (idKey: keyof T, idValue: unknown, updatedFields: Partial<T>) => {
    setData((prev) =>
      prev.map((item) => (item[idKey] === idValue ? { ...item, ...updatedFields } : item))
    );
    setEditingItem(null);
  };

  const deleteItem = (idKey: keyof T, idValue: unknown) => {
    setData((prev) => prev.filter((item) => item[idKey] !== idValue));
    setDeletingItem(null);
  };

  return {
    data,
    paginatedData,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q);
      setCurrentPage(1);
    },
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount: filteredData.length,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    addItem,
    updateItem,
    deleteItem,
  };
}

