'use client';

import Link from 'next/link';
import { MountainResult, getImageUrl, DEFAULT_IMAGE_URL } from '@/lib/types';

interface MountainCardProps {
  mountain: MountainResult;
}

export default function MountainCard({ mountain }: MountainCardProps) {
  const imageUrl = getImageUrl(mountain.imageUrl);

  return (
    <Link href={`/detail/${encodeURIComponent(mountain.name)}`} className="h-full">
      <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-slate-700 h-full flex flex-col w-full">
        <div className="h-36 xs:h-40 sm:h-44 bg-slate-700 relative overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={mountain.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_IMAGE_URL;
            }}
          />
          {mountain.statusLevel && (
            <div className="absolute top-2 right-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  mountain.statusLevel.includes('Awas')
                    ? 'bg-red-500 text-white'
                    : mountain.statusLevel.includes('Siaga')
                    ? 'bg-orange-500 text-white'
                    : mountain.statusLevel.includes('Waspada')
                    ? 'bg-yellow-500 text-white'
                    : 'bg-teal-500 text-white'
                }`}
              >
                {mountain.statusLevel}
              </span>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <h3 className="text-sm xs:text-base font-semibold text-white mb-2 truncate">
            {mountain.name}
          </h3>

          <div className="space-y-1 text-xs xs:text-sm flex-1">
            {mountain.province && (
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{mountain.province}</span>
              </div>
            )}

            {mountain.elevation && (
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>{mountain.elevation.toLocaleString()} mdpl</span>
              </div>
            )}

            {mountain.volcanicCategory && (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-teal-900/50 text-teal-300 rounded-full border border-teal-700">
                  {mountain.volcanicCategory}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
