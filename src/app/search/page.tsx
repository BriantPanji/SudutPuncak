'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MountainCard from '@/components/MountainCard';
import { MountainResult, SearchResponse, ProvincesResponse } from '@/lib/types';
import { useSearchHistory } from '@/store/searchHistory';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const initialProvince = searchParams.get('province') || '';
  const initialMinElevation = searchParams.get('minElevation') || '';
  const initialSortBy = searchParams.get('sortBy') || 'relevance';
  const initialSortOrder = searchParams.get('sortOrder') || 'asc';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [bestMatches, setBestMatches] = useState<MountainResult[]>([]);
  const [otherMatches, setOtherMatches] = useState<MountainResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [provinces, setProvinces] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [minElevation, setMinElevation] = useState(initialMinElevation);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [showFilters, setShowFilters] = useState(
    !!(initialProvince || initialMinElevation || initialSortBy !== 'relevance')
  );

  const { addSearch } = useSearchHistory();

  useEffect(() => {
    async function fetchProvinces() {
      try {
        const response = await fetch('/api/search?provinces=true');
        const data: ProvincesResponse = await response.json();
        if (data.provinces) {
          setProvinces(data.provinces);
        }
      } catch (err) {
        console.error('Failed to fetch provinces', err);
      }
    }
    fetchProvinces();
  }, []);

  const handleSearch = useCallback(async (query: string, province?: string, minElev?: string, sort?: string, order?: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query);
      if (province) params.set('province', province);
      if (minElev) params.set('minElevation', minElev);
      if (sort && sort !== 'relevance') {
        params.set('sortBy', sort);
        params.set('sortOrder', order || 'asc');
      }

      const response = await fetch(`/api/search?${params.toString()}`);
      const data: SearchResponse = await response.json();

      if (data.error) {
        setError(data.message || data.error);
        setBestMatches([]);
        setOtherMatches([]);
      } else {
        setBestMatches(data.bestMatches || []);
        setOtherMatches(data.otherMatches || []);
        if (query.trim()) {
          addSearch(query);
        }
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Pastikan Jena Fuseki berjalan.');
      setBestMatches([]);
      setOtherMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [addSearch]);

  useEffect(() => {
    if (initialQuery || initialProvince || initialMinElevation || initialSortBy !== 'relevance') {
      handleSearch(initialQuery, initialProvince, initialMinElevation, initialSortBy, initialSortOrder);
    }
  }, [initialQuery, initialProvince, initialMinElevation, initialSortBy, initialSortOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (selectedProvince) params.set('province', selectedProvince);
    if (minElevation) params.set('minElevation', minElevation);
    if (sortBy !== 'relevance') {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }

    router.push(`/search?${params.toString()}`);
    handleSearch(searchQuery, selectedProvince, minElevation, sortBy, sortOrder);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (selectedProvince) params.set('province', selectedProvince);
    if (minElevation) params.set('minElevation', minElevation);
    if (sortBy !== 'relevance') {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }

    router.push(`/search?${params.toString()}`);
    handleSearch(searchQuery, selectedProvince, minElevation, sortBy, sortOrder);
  };

  const clearFilters = () => {
    setSelectedProvince('');
    setMinElevation('');
    setSortBy('relevance');
    setSortOrder('asc');

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);

    router.push(`/search?${params.toString()}`);
    handleSearch(searchQuery, '', '', 'relevance', 'asc');
  };

  const updateURLWithFilters = (province: string, elevation: string, sort: string, order: string) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (province) params.set('province', province);
    if (elevation) params.set('minElevation', elevation);
    if (sort !== 'relevance') {
      params.set('sortBy', sort);
      params.set('sortOrder', order);
    }
    router.push(`/search?${params.toString()}`);
  };

  const totalResults = bestMatches.length + otherMatches.length;

  const sortResults = (results: MountainResult[]) => {
    if (sortBy === 'relevance') return results;

    return [...results].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'province':
          comparison = (a.province || '').localeCompare(b.province || '');
          break;
        case 'elevation':
          comparison = (a.elevation || 0) - (b.elevation || 0);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const sortedBestMatches = sortResults(bestMatches);
  const sortedOtherMatches = sortResults(otherMatches);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */ }
      <header className="bg-slate-800 shadow-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-teal-400 hover:text-teal-300">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            <form onSubmit={ handleSubmit } className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={ searchQuery }
                  onChange={ (e) => setSearchQuery(e.target.value) }
                  placeholder="Cari gunung... (cth: smr untuk Semeru)"
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={ () => setShowFilters(!showFilters) }
                className={ `px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${showFilters || selectedProvince || minElevation || sortBy !== 'relevance'
                  ? 'bg-teal-600 border-teal-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                  }` }
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={ isLoading }
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                { isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <span className="hidden sm:inline">Cari</span>
                ) }
              </button>
            </form>
          </div>

          {/* Filters Panel */ }
          { showFilters && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Province Filter */ }
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Provinsi</label>
                  <select
                    value={ selectedProvince }
                    onChange={ (e) => {
                      setSelectedProvince(e.target.value);
                    } }
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Semua Provinsi</option>
                    { provinces.map((prov) => (
                      <option key={ prov } value={ prov }>{ prov }</option>
                    )) }
                  </select>
                </div>

                {/* Min Elevation Filter */ }
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min. Ketinggian (mdpl)</label>
                  <input
                    type="number"
                    value={ minElevation }
                    onChange={ (e) => setMinElevation(e.target.value) }
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Sort By */ }
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Urutkan</label>
                  <select
                    value={ sortBy }
                    onChange={ (e) => setSortBy(e.target.value) }
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="relevance">Relevansi</option>
                    <option value="name">Nama Gunung</option>
                    <option value="province">Provinsi</option>
                    <option value="elevation">Ketinggian</option>
                  </select>
                </div>

                {/* Sort Order */ }
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Urutan</label>
                  <select
                    value={ sortOrder }
                    onChange={ (e) => setSortOrder(e.target.value) }
                    disabled={ sortBy === 'relevance' }
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    <option value="asc">A-Z / Terendah</option>
                    <option value="desc">Z-A / Tertinggi</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={ handleFilterChange }
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Terapkan Filter
                </button>
                <button
                  type="button"
                  onClick={ clearFilters }
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          ) }
        </div>
      </header>

      {/* Main Content */ }
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Active Filters Display */ }
        { (selectedProvince || minElevation || sortBy !== 'relevance') && (
          <div className="flex flex-wrap gap-2 mb-4">
            { selectedProvince && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-900/50 text-teal-300 rounded-full text-sm border border-teal-700">
                Provinsi: { selectedProvince }
                <button onClick={ () => {
                  setSelectedProvince('');
                  updateURLWithFilters('', minElevation, sortBy, sortOrder);
                  handleSearch(searchQuery, '', minElevation, sortBy, sortOrder);
                } } className="hover:text-white cursor-pointer">×</button>
              </span>
            ) }
            { minElevation && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-900/50 text-teal-300 rounded-full text-sm border border-teal-700">
                Min: { minElevation } mdpl
                <button onClick={ () => {
                  setMinElevation('');
                  updateURLWithFilters(selectedProvince, '', sortBy, sortOrder);
                  handleSearch(searchQuery, selectedProvince, '', sortBy, sortOrder);
                } } className="hover:text-white cursor-pointer">×</button>
              </span>
            ) }
            { sortBy !== 'relevance' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-900/50 text-teal-300 rounded-full text-sm border border-teal-700">
                Urut: { sortBy === 'name' ? 'Nama' : sortBy === 'province' ? 'Provinsi' : 'Ketinggian' } ({ sortOrder === 'asc' ? '↑' : '↓' })
                <button onClick={ () => {
                  setSortBy('relevance');
                  setSortOrder('asc');
                  updateURLWithFilters(selectedProvince, minElevation, 'relevance', 'asc');
                  handleSearch(searchQuery, selectedProvince, minElevation, 'relevance', 'asc');
                } } className="hover:text-white cursor-pointer">×</button>
              </span>
            ) }
          </div>
        ) }

        {/* Error Message */ }
        { error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-300 font-medium">Error</p>
                <p className="text-red-400 text-sm">{ error }</p>
              </div>
            </div>
          </div>
        ) }

        {/* Results */ }
        { hasSearched && !error && (
          <div>
            <p className="text-gray-400 mb-6">
              { totalResults > 0
                ? `Ditemukan ${totalResults} gunung${initialQuery ? ` untuk "${initialQuery}"` : ''}`
                : `Tidak ditemukan hasil${initialQuery ? ` untuk "${initialQuery}"` : ''}` }
            </p>

            {/* Best Matches */ }
            { sortedBestMatches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Hasil Terbaik ({ sortedBestMatches.length })
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 auto-rows-fr">
                  { sortedBestMatches.map((mountain) => (
                    <MountainCard key={ mountain.uri } mountain={ mountain } />
                  )) }
                </div>
              </div>
            ) }

            {/* Other Matches */ }
            { sortedOtherMatches.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  Hasil Lainnya ({ sortedOtherMatches.length })
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 auto-rows-fr">
                  { sortedOtherMatches.map((mountain) => (
                    <MountainCard key={ mountain.uri } mountain={ mountain } />
                  )) }
                </div>
              </div>
            ) }
          </div>
        ) }

        {/* No Search Yet */ }
        { !hasSearched && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              Masukkan kata kunci pencarian
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Cari gunung berdasarkan nama, provinsi, atau deskripsi. Gunakan singkatan seperti &quot;smr&quot; untuk mencari &quot;Semeru&quot;.
            </p>
          </div>
        ) }
      </main>

      {/* Footer */ }
      <footer className="bg-slate-800 border-t border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2025 Sudut Corp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-teal-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Memuat...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
