import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrash, restoreFile, restoreFolder, permanentDeleteFile, permanentDeleteFolder, emptyTrash } from '../store/slices/fileSlice';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import FileIcon from '../components/files/FileIcon';
import { formatBytes } from '../components/layout/Sidebar';
import { DeleteConfirmModal } from '../components/files/Modals';

export default function Trash() {
  const dispatch = useDispatch();
  const { trash, loading } = useSelector((state) => state.files);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteType, setDeleteType] = useState('file'); // file or folder
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTrash());
  }, [dispatch]);

  const handleRestore = (id, type) => {
    if (type === 'folder') {
      dispatch(restoreFolder(id)).then(() => dispatch(fetchTrash()));
    } else {
      dispatch(restoreFile(id)).then(() => dispatch(fetchTrash()));
    }
  };

  const handleDeleteTrigger = (item, type) => {
    setSelectedItem(item);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (id) => {
    if (deleteType === 'folder') {
      dispatch(permanentDeleteFolder(id)).then(() => {
        setShowDeleteModal(false);
        setSelectedItem(null);
        dispatch(fetchTrash());
      });
    } else {
      dispatch(permanentDeleteFile(id)).then(() => {
        setShowDeleteModal(false);
        setSelectedItem(null);
        dispatch(fetchTrash());
      });
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete all items in trash? This cannot be undone.')) {
      dispatch(emptyTrash()).then(() => dispatch(fetchTrash()));
    }
  };

  const hasTrash = trash.files.length > 0 || trash.folders.length > 0;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar Left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action Bar */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
                Trash
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Items deleted will be stored here. You can restore them or permanently delete them.
              </p>
            </div>

            {hasTrash && (
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 hover:bg-red-100/60 dark:hover:bg-red-950/40 text-xs font-semibold rounded-xl transition"
              >
                Empty Trash
              </button>
            )}
          </div>

          {/* Deleted List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-450" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : !hasTrash ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-sm font-semibold">Trash is empty</p>
              <p className="text-xs mt-1">No items found in your trash bin.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-850">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Deleted At
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Folders */}
                    {trash.folders.map((folder) => (
                      <tr key={folder._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="text-amber-500 w-9 h-9 bg-amber-50 dark:bg-amber-955/20 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-xs block">
                              {folder.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          Folder
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          —
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {folder.deletedAt ? new Date(folder.deletedAt).toLocaleString() : 'Recently'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-3">
                          <button
                            onClick={() => handleRestore(folder._id, 'folder')}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteTrigger(folder, 'folder')}
                            className="text-red-650 hover:text-red-750 font-semibold"
                          >
                            Delete Permanently
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Files */}
                    {trash.files.map((file) => (
                      <tr key={file._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <FileIcon
                              mimeType={file.mimeType}
                              extension={file.extension}
                              fileId={file._id}
                              className="w-9 h-9"
                            />
                            <span className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-xs block" title={file.originalName}>
                              {file.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {formatBytes(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {file.deletedAt ? new Date(file.deletedAt).toLocaleString() : 'Recently'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-3">
                          <button
                            onClick={() => handleRestore(file._id, 'file')}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteTrigger(file, 'file')}
                            className="text-red-650 hover:text-red-750 font-semibold"
                          >
                            Delete Permanently
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Permanent Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        item={selectedItem}
        type={deleteType}
        isPermanent={true}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
