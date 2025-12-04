'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MountainResult, RelatedMountain, RelatedResponse, getImageUrl, DEFAULT_IMAGE_URL } from '@/lib/types';
import { useRecentViewed } from '@/store/recentViewed';
import InfoPopup, { categoryInfo, statusInfo, restrictionInfo } from '@/components/InfoPopup';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const mountainName = decodeURIComponent(params.name as string);

  const [mountain, setMountain] = useState<MountainResult | null>(null);
  const [relatedMountains, setRelatedMountains] = useState<RelatedMountain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showRestrictionPopup, setShowRestrictionPopup] = useState(false);

  const { addMountain } = useRecentViewed();

  useEffect(() => {
    async function fetchMountain() {
      try {
        const response = await fetch(`/api/search?name=${encodeURIComponent(mountainName)}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else if (data.mountain) {
          setMountain(data.mountain);
          addMountain({
            name: data.mountain.name,
            province: data.mountain.province,
            imageUrl: data.mountain.imageUrl,
          });

          const relatedResponse = await fetch(`/api/search?relatedTo=${encodeURIComponent(data.mountain.name)}`);
          const relatedData: RelatedResponse = await relatedResponse.json();
          if (relatedData.relatedMountains) {
            setRelatedMountains(relatedData.relatedMountains);
          }
        } else {
          setError('Gunung tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data gunung');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMountain();
  }, [mountainName, addMountain]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-teal-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Memuat data gunung...</p>
        </div>
      </div>
    );
  }

  if (error || !mountain) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏔️</div>
          <h1 className="text-xl font-semibold text-gray-300 mb-2">Gunung Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-4">{error || 'Data gunung tidak tersedia'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(mountain.imageUrl);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <Link href="/" className="text-teal-400 hover:text-teal-300 font-medium">
              Sudut Puncak
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 md:h-96 bg-slate-800">
        <img
          src={imageUrl}
          alt={mountain.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE_URL;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {mountain.name}
            </h1>
            {mountain.province && (
              <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {mountain.province}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informasi Umum</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mountain.elevation && (
                  <div className="text-center p-3 bg-teal-900/30 rounded-lg border border-teal-800">
                    <div className="text-2xl font-bold text-teal-400">
                      {mountain.elevation.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">mdpl</div>
                  </div>
                )}
                {mountain.volcanicCategory && (
                  <button
                    onClick={() => setShowCategoryPopup(true)}
                    className="text-center p-3 bg-orange-900/30 rounded-lg border border-orange-800 hover:bg-orange-900/50 transition-colors cursor-pointer"
                  >
                    <div className="text-lg font-bold text-orange-400">
                      {mountain.volcanicCategory}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                      Kategori
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </button>
                )}
                {mountain.statusLevel && (
                  <button
                    onClick={() => setShowStatusPopup(true)}
                    className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      mountain.statusLevel.includes('Awas')
                        ? 'bg-red-900/30 border-red-800 hover:bg-red-900/50'
                        : mountain.statusLevel.includes('Siaga')
                        ? 'bg-orange-900/30 border-orange-800 hover:bg-orange-900/50'
                        : mountain.statusLevel.includes('Waspada')
                        ? 'bg-yellow-900/30 border-yellow-800 hover:bg-yellow-900/50'
                        : 'bg-green-900/30 border-green-800 hover:bg-green-900/50'
                    }`}
                  >
                    <div className={`text-lg font-bold ${
                      mountain.statusLevel.includes('Awas')
                        ? 'text-red-400'
                        : mountain.statusLevel.includes('Siaga')
                        ? 'text-orange-400'
                        : mountain.statusLevel.includes('Waspada')
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}>
                      {mountain.statusLevel}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                      Status
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </button>
                )}
                {mountain.lat && mountain.lon && (
                  <div className="text-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                    <div className="text-sm font-semibold text-blue-400">
                      {mountain.lat.toFixed(4)}°
                    </div>
                    <div className="text-sm font-semibold text-blue-400">
                      {mountain.lon.toFixed(4)}°
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Koordinat</div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {mountain.description && (
              <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Deskripsi</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {mountain.description}
                </p>
              </div>
            )}

            {/* Restrictions */}
            {(mountain.restrictedFrom || mountain.restrictedUntil) && (
              <button
                onClick={() => setShowRestrictionPopup(true)}
                className="w-full bg-red-900/30 rounded-xl border border-red-800 p-4 sm:p-6 hover:bg-red-900/50 transition-colors cursor-pointer text-left"
              >
                <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Pembatasan Akses
                  <svg className="h-4 w-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </h2>
                <div className="text-red-300 text-sm">
                  {mountain.restrictedFrom && (
                    <p>Dari: {new Date(mountain.restrictedFrom).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                  )}
                  {mountain.restrictedUntil && (
                    <p>Sampai: {new Date(mountain.restrictedUntil).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            {/* OpenStreetMap */}
            {mountain.lat && mountain.lon && (
              <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">Lokasi</h2>
                </div>
                <div className="h-64 sm:h-80">
                  <iframe
                    title={`Peta ${mountain.name}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mountain.lon - 0.02}%2C${mountain.lat - 0.02}%2C${mountain.lon + 0.02}%2C${mountain.lat + 0.02}&layer=mapnik&marker=${mountain.lat}%2C${mountain.lon}`}
                    style={{ border: 0 }}
                  ></iframe>
                </div>
                <div className="p-4 border-t border-slate-700">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${mountain.lat}&mlon=${mountain.lon}#map=14/${mountain.lat}/${mountain.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Buka di OpenStreetMap
                  </a>
                  {mountain.googleMapsUrl && (
                    <a
                      href={mountain.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Buka di Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Additional Links */}
            <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Tautan</h2>
              <div className="space-y-2">
                <a
                  href={`https://www.google.com/search?q=Gunung+${encodeURIComponent(mountain.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Cari di Google
                </a>
                <a
                  href={`https://id.wikipedia.org/wiki/Gunung_${encodeURIComponent(mountain.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Wikipedia Indonesia
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Mountains Section */}
        {relatedMountains.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Gunung dengan lokasi terdekat dan ketinggian serupa
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedMountains.map((related) => (
                <Link
                  key={related.uri}
                  href={`/detail/${encodeURIComponent(related.name)}`}
                  className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-teal-600 transition-colors group cursor-pointer"
                >
                  <div className="h-24 bg-slate-700 overflow-hidden">
                    <img
                      src={getImageUrl(related.imageUrl)}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE_URL;
                      }}
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-white truncate group-hover:text-teal-400 transition-colors">
                      {related.name}
                    </h3>
                    {related.elevation && (
                      <p className="text-xs text-gray-400">{related.elevation.toLocaleString()} mdpl</p>
                    )}
                    {related.province && (
                      <p className="text-xs text-gray-500 truncate">{related.province}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2025 Sudut Corp. All rights reserved.</p>
        </div>
      </footer>

      {/* Popups */}
      <InfoPopup
        isOpen={showCategoryPopup}
        onClose={() => setShowCategoryPopup(false)}
        title={categoryInfo.title}
      >
        {categoryInfo.content}
      </InfoPopup>

      <InfoPopup
        isOpen={showStatusPopup}
        onClose={() => setShowStatusPopup(false)}
        title={statusInfo.title}
      >
        {statusInfo.content}
      </InfoPopup>

      <InfoPopup
        isOpen={showRestrictionPopup}
        onClose={() => setShowRestrictionPopup(false)}
        title={restrictionInfo.title}
      >
        {restrictionInfo.content}
      </InfoPopup>
    </div>
  );
}
