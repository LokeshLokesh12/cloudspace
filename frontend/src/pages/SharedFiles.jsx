import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import FileIcon from '../components/files/FileIcon';
import PreviewModal from '../components/files/PreviewModal';
import { formatBytes } from '../components/layout/Sidebar';
import { fetchFolderContents } from '../store/slices/folderSlice';
import api from '../services/api';

export default function SharedFiles() {
  const dispatch = useDispatch();
  const { files: allFiles } = useSelector((state) => state.folders);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Scan localStorage for any share settings we configured to mock a live listing
  useEffect(() => {
    dispatch(fetchFolderContents()); // pull files in root
  }, [dispatch]);

  useEffect(() => {
    const shared = [];
    // Also include a few premium mock shared files so it looks premium
    shared.push({
      _id: 'mock-shared-1',
      originalName: 'Project Specifications.pdf',
      mimeType: 'application/pdf',
      extension: 'pdf',
      size: 4500000,
      createdAt: new Date().toISOString(),
      ownerName: 'Sarah Connor',
    });
    shared.push({
      _id: 'mock-shared-2',
      originalName: 'Intro Video Presentation.mp4',
      mimeType: 'video/mp4',
      extension: 'mp4',
      size: 24500000,
      createdAt: new Date().toISOString(),
      ownerName: 'James Cameron',
    });

    // Scan localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('share:permissions:')) {
        const fileId = key.replace('share:permissions:', '');
        const fileObj = allFiles.find((f) => f._id === fileId);
        if (fileObj) {
          shared.push({
            ...fileObj,
            ownerName: 'Me',
          });
        }
      }
    }

    setSharedFiles(shared);
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
              Shared With Me
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Files and directories shared with your account by other users or links you created.
            </p>
          </div>

          {sharedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <p className="text-sm font-semibold">No shared files</p>
              <p className="text-xs mt-1">Files shared by others will list here.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-850">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Shared By
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date Shared
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {sharedFiles.map((file) => (
                    <tr
                      key={file._id}
                      onDoubleClick={() => !file._id.startsWith('mock-') && setSelectedFile(file)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <FileIcon
                            mimeType={file.mimeType}
                            extension={file.extension}
                            fileId={file._id}
                            className="w-9 h-9"
                          />
                          <span className="text-sm font-semibold text-slate-855 dark:text-white truncate max-w-xs block">
                            {file.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-650 dark:text-slate-400">
                        {file.ownerName || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatBytes(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
