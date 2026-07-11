import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatBytes } from '../layout/Sidebar';

export default function PreviewModal({ isOpen, file, onClose, onDownload }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (isOpen && file) {
      setLoading(true);
      setError(null);
      setTextContent('');
      
      // Clean up previous blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }

      api
        .get(`/files/${file._id}/preview`, { responseType: 'blob' })
        .then((res) => {
          if (!active) return;
          const mime = file.mimeType || res.data.type;
          
          if (mime.startsWith('text/') || mime === 'application/json' || file.extension === 'js' || file.extension === 'css') {
            // Read as text
            const reader = new FileReader();
            reader.onload = () => {
              if (active) {
                setTextContent(reader.result);
                setLoading(false);
              }
            };
            reader.readAsText(res.data);
          } else {
            // Create object URL for rendering media
            const url = URL.createObjectURL(res.data);
            setBlobUrl(url);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load preview:', err);
          if (active) {
            setError('Could not render preview for this file. It may be corrupted or unavailable.');
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const isImage = file.mimeType?.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const isVideo = file.mimeType?.startsWith('video/');
  const isAudio = file.mimeType?.startsWith('audio/');
  const isText = file.mimeType?.startsWith('text/') || file.extension === 'json' || file.extension === 'js' || file.extension === 'css';

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-450" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading secure preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-450">{error}</p>
          <button
            onClick={() => onDownload(file._id, file.originalName)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-md transition"
          >
            Download file to open
          </button>
        </div>
      );
    }

    if (isImage && blobUrl) {
      return (
        <div className="flex items-center justify-center max-h-[70vh] overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 p-2">
          <img src={blobUrl} alt={file.originalName} className="max-w-full max-h-[68vh] object-contain rounded-lg shadow-sm" />
        </div>
      );
    }

    if (isPdf && blobUrl) {
      return (
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <embed src={blobUrl} type="application/pdf" className="w-full h-[65vh]" />
        </div>
      );
    }

    if (isVideo && blobUrl) {
      return (
        <div className="flex items-center justify-center max-h-[70vh] bg-black rounded-xl overflow-hidden">
          <video src={blobUrl} controls className="max-w-full max-h-[68vh] object-contain" />
        </div>
      );
    }

    if (isAudio && blobUrl) {
      return (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <audio src={blobUrl} controls className="w-full max-w-md mx-auto" />
        </div>
      );
    }

    if (isText) {
      return (
        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-auto text-xs font-mono max-h-[60vh] text-left select-text whitespace-pre-wrap">
          <code>{textContent}</code>
        </pre>
      );
    }

    // Default Fallback
    return (
      <div className="p-10 text-center bg-slate-50 dark:bg-slate-950 rounded-xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Preview is not supported for this file type.
        </p>
        <button
          onClick={() => onDownload(file._id, file.originalName)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          Download to View
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-slate-850 dark:text-white truncate" title={file.originalName}>
              {file.originalName}
            </h3>
            <p className="text-xxs text-slate-400 mt-0.5">
              {formatBytes(file.size)} &bull; {file.mimeType}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDownload(file._id, file.originalName)}
              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Download file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-red-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Close preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto mt-4 min-h-[300px] flex flex-col justify-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
