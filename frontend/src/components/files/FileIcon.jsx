import { useEffect, useState } from 'react';
import api from '../../services/api';

export function AuthenticatedThumbnail({ fileId, mimeType, className }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (mimeType.startsWith('image/')) {
      setLoading(true);
      api
        .get(`/files/${fileId}/preview`, { responseType: 'blob' })
        .then((res) => {
          if (active) {
            const url = URL.createObjectURL(res.data);
            setSrc(url);
          }
        })
        .catch(() => {
          // fallback to general image icon
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [fileId, mimeType]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`}>
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (src) {
    return <img src={src} alt="thumbnail" className={`object-cover ${className}`} />;
  }

  // Fallback image icon
  return (
    <div className={`flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 ${className}`}>
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

export default function FileIcon({ mimeType, extension, fileId, className = 'w-10 h-10' }) {
  if (mimeType.startsWith('image/')) {
    return <AuthenticatedThumbnail fileId={fileId} mimeType={mimeType} className={className} />;
  }

  let colorClass = 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400';
  let iconPath = (
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  );

  if (mimeType === 'application/pdf') {
    colorClass = 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400';
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    );
  } else if (mimeType.startsWith('video/')) {
    colorClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    );
  } else if (mimeType.startsWith('audio/')) {
    colorClass = 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400';
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    );
  } else if (mimeType.startsWith('text/') || extension === 'json' || extension === 'js' || extension === 'css') {
    colorClass = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400';
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    );
  } else if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) {
    colorClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
    iconPath = (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-lg ${colorClass} ${className}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        {iconPath}
      </svg>
    </div>
  );
}
