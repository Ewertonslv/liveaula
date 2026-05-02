import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { secureStorage } from '@/lib/secureStorage';
import { apiFetch } from '@/lib/api';

const STORAGE_KEY = 'liveaula.selected-child-id';

interface ChildLink {
  id: string;
  name: string;
  gradeLevel: string;
  subject?: { id: string; name: string };
}

interface ContextValue {
  children: ChildLink[];
  selectedChildId: string | null;
  selectChild: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
}

const SelectedChildContext = createContext<ContextValue | null>(null);

export function SelectedChildProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<ChildLink[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<ChildLink[]>('/me/students');
      setList(data);
      const stored = await secureStorage.get(STORAGE_KEY);
      const validStored = stored && data.some((c) => c.id === stored) ? stored : null;
      setSelectedChildId(validStored ?? data[0]?.id ?? null);
    } catch {
      setList([]);
      setSelectedChildId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectChild = useCallback(async (id: string) => {
    setSelectedChildId(id);
    await secureStorage.save(STORAGE_KEY, id);
  }, []);

  return (
    <SelectedChildContext.Provider
      value={{ children: list, selectedChildId, selectChild, refresh, loading }}
    >
      {children}
    </SelectedChildContext.Provider>
  );
}

export function useSelectedChild(): ContextValue {
  const ctx = useContext(SelectedChildContext);
  if (!ctx) throw new Error('useSelectedChild must be used inside SelectedChildProvider');
  return ctx;
}
