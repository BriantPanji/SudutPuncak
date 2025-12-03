'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearchHistory } from '@/store/searchHistory';
import { useRecentViewed } from '@/store/recentViewed';
import { getImageUrl } from '@/lib/types';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { history, clearHistory, removeItem } = useSearchHistory();
  const { recentMountains } = useRecentViewed();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleHistoryClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            {/* <div className="text-6xl mb-4">🏔️</div> */}
            <div className="text-6xl mb-4 flex items-center justify-center"><Image src="/gunung.png" alt="Logo Gunung" width={125} height={125} /></div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-teal-400 mb-2">
              Sudut Puncak
            </h1>
            <p className="text-gray-400 text-sm xs:text-base">
              Pencarian Data Gunung Indonesia dengan SPARQL
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col xs:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari gunung..."
                  className="w-full px-5 py-4 pl-12 rounded-xl border-2 border-slate-700 bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Cari</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              💡 Contoh: &quot;Semeru&quot;, &quot;Jawa Timur&quot;, &quot;smr&quot;
            </p>
          </form>

          {/* Search History */}
          {mounted && history.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Riwayat Pencarian
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                  <div
                    key={item.timestamp}
                    className="group flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-teal-900/50 rounded-lg transition-colors"
                  >
                    <button
                      onClick={() => handleHistoryClick(item.query)}
                      className="text-sm text-gray-300 hover:text-teal-400 cursor-pointer"
                    >
                      {item.query}
                    </button>
                    <button
                      onClick={() => removeItem(item.timestamp)}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed Mountains */}
          {mounted && recentMountains.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Terakhir Dilihat
              </h2>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                {recentMountains.map((mountain) => (
                  <Link 
                    key={mountain.timestamp} 
                    href={`/detail/${encodeURIComponent(mountain.name)}`}
                    className="group"
                  >
                    <div className="relative rounded-lg overflow-hidden bg-slate-700 aspect-square">
                      <img
                        src={getImageUrl(mountain.imageUrl)}
                        alt={mountain.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://datagunung.com/images/default-image.webp';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-xs font-medium text-white truncate">{mountain.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2025 Sudut Corp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


