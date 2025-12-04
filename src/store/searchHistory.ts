import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

interface SearchHistoryStore {
  history: SearchHistoryItem[];
  addSearch: (query: string) => void;
  clearHistory: () => void;
  removeItem: (timestamp: number) => void;
}

export const useSearchHistory = create<SearchHistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      addSearch: (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        
        set((state) => {
          const filteredHistory = state.history.filter(
            (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
          );
          
          const newHistory = [
            { query: trimmedQuery, timestamp: Date.now() },
            ...filteredHistory,
          ].slice(0, 10); // cuma 10 disimpan
          
          return { history: newHistory };
        });
      },
      clearHistory: () => set({ history: [] }),
      removeItem: (timestamp: number) => {
        set((state) => ({
          history: state.history.filter((item) => item.timestamp !== timestamp),
        }));
      },
    }),
    {
      name: 'search-history',
    }
  )
);
