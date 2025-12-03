import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentMountain {
  name: string;
  province: string | null;
  imageUrl: string | null;
  timestamp: number;
}

interface RecentViewedStore {
  recentMountains: RecentMountain[];
  addMountain: (mountain: { name: string; province: string | null; imageUrl: string | null }) => void;
  clearRecent: () => void;
}

export const useRecentViewed = create<RecentViewedStore>()(
  persist(
    (set) => ({
      recentMountains: [],
      addMountain: (mountain) => {
        set((state) => {
          // Remove duplicate if exists
          const filtered = state.recentMountains.filter(
            (m) => m.name.toLowerCase() !== mountain.name.toLowerCase()
          );
          
          // Add new at the beginning
          const newList = [
            { ...mountain, timestamp: Date.now() },
            ...filtered,
          ].slice(0, 5); // Keep only last 5
          
          return { recentMountains: newList };
        });
      },
      clearRecent: () => set({ recentMountains: [] }),
    }),
    {
      name: 'recent-viewed',
    }
  )
);
