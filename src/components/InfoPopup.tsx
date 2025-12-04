'use client';

import { useEffect } from 'react';

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InfoPopup({ isOpen, onClose, title, children }: InfoPopupProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-700 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 text-gray-300">
          {children}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// Info content for each type
export const categoryInfo = {
  title: 'Kategori Gunung Berapi',
  content: (
    <div className="space-y-3">
      <p className="text-sm">Kategori gunung berapi di Indonesia berdasarkan MAGMA Indonesia:</p>
      <div className="space-y-2">
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="font-semibold text-orange-400">Kategori A</span>
          <p className="text-sm mt-1">Gunung berapi yang memiliki catatan sejarah letusan sejak tahun 1600.</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="font-semibold text-yellow-400">Kategori B</span>
          <p className="text-sm mt-1">Gunung berapi yang memiliki catatan sejarah letusan sebelum tahun 1600.</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="font-semibold text-green-400">Kategori C</span>
          <p className="text-sm mt-1">Gunung berapi yang tidak memiliki catatan sejarah letusan, tetapi masih memperlihatkan jejak aktivitas vulkanik.</p>
        </div>
      </div>
    </div>
  ),
};

export const statusInfo = {
  title: 'Status Aktivitas Gunung',
  content: (
    <div className="space-y-3">
      <p className="text-sm">Status aktivitas gunung berapi berdasarkan tingkat kewaspadaan:</p>
      <div className="space-y-2">
        <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-green-500">
          <span className="font-semibold text-green-400">Normal (Level I)</span>
          <p className="text-sm mt-1">Aktivitas gunung dalam keadaan normal. Tidak ada aktivitas signifikan.</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
          <span className="font-semibold text-yellow-400">Waspada (Level II)</span>
          <p className="text-sm mt-1">Terjadi peningkatan aktivitas seismik atau visual. Masyarakat diminta waspada.</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-orange-500">
          <span className="font-semibold text-orange-400">Siaga (Level III)</span>
          <p className="text-sm mt-1">Peningkatan aktivitas signifikan. Evakuasi mungkin diperlukan di radius tertentu.</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-red-500">
          <span className="font-semibold text-red-400">Awas (Level IV)</span>
          <p className="text-sm mt-1">Aktivitas berbahaya. Evakuasi wajib di radius yang ditentukan.</p>
        </div>
      </div>
    </div>
  ),
};

export const restrictionInfo = {
  title: 'Pembatasan Akses',
  content: (
    <div className="space-y-3">
      <p className="text-sm">Pembatasan akses gunung dapat diberlakukan karena berbagai alasan:</p>
      <div className="space-y-2">
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="font-semibold text-red-400">Aktivitas Vulkanik</span>
          <p className="text-sm mt-1">Penutupan karena peningkatan aktivitas gunung berapi untuk keselamatan pendaki.</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="font-semibold text-yellow-400">Cuaca Ekstrem</span>
          <p className="text-sm mt-1">Penutupan sementara karena kondisi cuaca berbahaya seperti badai atau kabut tebal.</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <span className="font-semibold text-blue-400">Pemulihan Ekosistem</span>
          <p className="text-sm mt-1">Penutupan untuk pemulihan vegetasi dan habitat alam di kawasan gunung.</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">* Selalu periksa informasi terbaru sebelum melakukan pendakian.</p>
    </div>
  ),
};
