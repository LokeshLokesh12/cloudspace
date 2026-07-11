import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import FileIcon from '../components/files/FileIcon';
import PreviewModal from '../components/files/PreviewModal';
import { formatBytes } from '../components/layout/Sidebar';
import { fetchFolderContents } from '../store/slices/folderSlice';
import api from '../services/api';

export default function Favorites() {
  const dispatch = useDispatch();
  const { files: allFiles } = useSelector((state) => state.folders);
  const [favoriteFiles, setFavoriteFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    dispatch(fetchFolderContents()); // fetch root files
  }, [dispatch]);

  useEffect(() => {
    // Generate mock favorites alongside user-flagged favorites
    const favs = [];
    
    // Add default mock favorite
    // favs.push({
    //   _id: 'mock-fav-1',
    //   originalName: 'Financial Report 2026.xlsx',
    //   mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //   extension: 'xlsx',
    //   size: 1540000,
    //   createdAt: new Date().toISOString(),
    // });

    // Check localStorage for user favorited files
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('favorite:file:')) {
        const fileId = key.replace('favorite:file:', '');
        const fileObj = allFiles.find((f) => f._id === fileId);
        if (fileObj) {
          favs.push(fileObj);
        }
      }
    }

    setFavoriteFiles(favs);
  }, [allFiles]);

  const handleDownload = (fileId, fileName) => {
    if (fileId.startsWith('mock-')) {
      alert('Mock file downloads will be supported once connected to live backend databases.');
      return;
    }
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
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
              Favorites
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Access your starred documents and folders instantly.
            </p>
          </div>

          {favoriteFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-sm font-semibold">No starred items</p>
              <p className="text-xs mt-1">Right-click files or folders and select star to add them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteFiles.map((file) => (
                <div
                  key={file._id}
                  onDoubleClick={() => !file._id.startsWith('mock-') && setSelectedFile(file)}
                  className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-750 hover:shadow-md cursor-pointer select-none group transition-all duration-150"
                >
                  <div className="h-28 bg-slate-50 dark:bg-slate-850 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    <FileIcon
                      mimeType={file.mimeType}
                      extension={file.extension}
                      fileId={file._id}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-855 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-450" title={file.originalName}>
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
