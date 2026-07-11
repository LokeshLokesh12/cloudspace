import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import FileIcon from '../components/files/FileIcon';
import PreviewModal from '../components/files/PreviewModal';
import { formatBytes } from '../components/layout/Sidebar';
import { fetchRecentFiles } from '../store/slices/fileSlice';
import api from '../services/api';

export default function Recent() {
  const dispatch = useDispatch();
  const { recentFiles, loading } = useSelector((state) => state.files);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    dispatch(fetchRecentFiles());
  }, [dispatch]);

  const handleDownload = (fileId, fileName) => {
    api
      .get(`/files/${fileId}/download`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((err) => {
        console.error('Download failed:', err);
      });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar Left */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
              Recent Files
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quickly access files you have recently uploaded or previewed.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-450" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold">No recent files</p>
              <p className="text-xs mt-1">Files you upload or view will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentFiles.map((file) => (
                <div
                  key={file._id}
                  onDoubleClick={() => setSelectedFile(file)}
                  className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-750 hover:shadow-md cursor-pointer select-none group transition-all duration-150"
                >
                  <div className="h-28 bg-slate-50 dark:bg-slate-850 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80 overflow-hidden relative">
                    <FileIcon
                      mimeType={file.mimeType}
                      extension={file.extension}
                      fileId={file._id}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-850 dark:text-white truncate group-hover:text-blue-650" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <div className="flex justify-between items-center text-xxs text-slate-400 mt-1">
                      <span>{formatBytes(file.size)}</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <PreviewModal
        isOpen={!!selectedFile}
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
