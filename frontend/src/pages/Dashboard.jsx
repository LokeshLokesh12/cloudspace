import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import FileGrid from '../components/files/FileGrid';
import FileList from '../components/files/FileList';
import ContextMenu from '../components/common/ContextMenu';
import UploadProgress from '../components/files/UploadProgress';
import PreviewModal from '../components/files/PreviewModal';
import ShareModal from '../components/files/ShareModal';
import { RenameModal, DeleteConfirmModal, MoveModal } from '../components/files/Modals';

import {
  fetchFolderContents,
  fetchBreadcrumb,
  createFolder,
  renameFolder,
  moveFolder,
  deleteFolder,
} from '../store/slices/folderSlice';
import {
  renameFile,
  moveFile,
  deleteFile,
  copyFile,
  uploadFileWithProgress,
} from '../store/slices/fileSlice';
import api from '../services/api';

export default function Dashboard() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const folderIdParam = searchParams.get('folder') || null;

  const { folders, files, currentFolderId, loading: folderLoading } = useSelector((state) => state.folders);
  const { loading: fileLoading } = useSelector((state) => state.files);

  // UI state
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, item }

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // rename, delete, move, share, preview
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('file'); // file or folder

  useEffect(() => {
    dispatch(fetchFolderContents(folderIdParam));
    dispatch(fetchBreadcrumb(folderIdParam));
  }, [dispatch, folderIdParam]);

  const handleNavigate = (id) => {
    if (id) {
      setSearchParams({ folder: id });
    } else {
      setSearchParams({});
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (!droppedFiles.length) return;

    droppedFiles.forEach((file) => {
      const uploadId = Math.random().toString(36).substring(2, 9);
      dispatch(uploadFileWithProgress({ file, folderId: currentFolderId, uploadId }))
        .unwrap()
        .then(() => {
          dispatch(fetchFolderContents(currentFolderId));
        });
    });
  };

  const handleContextMenuTrigger = (e, type, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      item,
    });
  };

  const triggerModal = (modalName, type, item) => {
    setSelectedItem(item);
    setSelectedType(type);
    setActiveModal(modalName);
  };

  const handleRenameConfirm = (id, newName) => {
    if (selectedType === 'folder') {
      dispatch(renameFolder({ folderId: id, name: newName })).then(() => {
        setActiveModal(null);
        dispatch(fetchFolderContents(currentFolderId));
      });
    } else {
      dispatch(renameFile({ fileId: id, originalName: newName })).then(() => {
        setActiveModal(null);
        dispatch(fetchFolderContents(currentFolderId));
      });
    }
  };

  const handleDeleteConfirm = (id) => {
    if (selectedType === 'folder') {
      dispatch(deleteFolder(id)).then(() => {
        setActiveModal(null);
        dispatch(fetchFolderContents(currentFolderId));
      });
    } else {
      dispatch(deleteFile(id)).then(() => {
        setActiveModal(null);
        dispatch(fetchFolderContents(currentFolderId));
      });
    }
  };

  const handleMoveConfirm = (id, targetFolderId) => {
    if (selectedType === 'folder') {
      dispatch(moveFolder({ folderId: id, targetFolderId })).then(() => {
        setActiveModal(null);
        dispatch(fetchFolderContents(currentFolderId));
      });
    } else {
      dispatch(moveFile({ fileId: id, targetFolderId })).then(() => {
        setActiveModal(null);
        dispatch(fetchFolderContents(currentFolderId));
      });
    }
  };

  const handleCopyConfirm = (id) => {
    dispatch(copyFile({ fileId: id, targetFolderId: currentFolderId })).then(() => {
      dispatch(fetchFolderContents(currentFolderId));
    });
  };

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

  // Filter content by search query
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFiles = files.filter((f) =>
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContextMenuOptions = () => {
    if (!contextMenu) return [];
    const { type, item } = contextMenu;

    const options = [
      {
        label: 'Rename',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        ),
        onClick: () => triggerModal('rename', type, item),
      },
      {
        label: 'Move',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        ),
        onClick: () => triggerModal('move', type, item),
      },
    ];

    if (type === 'file') {
      options.unshift({
        label: 'Preview',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        onClick: () => triggerModal('preview', type, item),
      });

      options.push(
        {
          label: 'Copy File',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          ),
          onClick: () => handleCopyConfirm(item._id),
        },
        {
          label: 'Download',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
            </svg>
          ),
          onClick: () => handleDownload(item._id, item.originalName),
        }
      );
    }

    options.push(
      { divider: true },
      {
        label: 'Share Access',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        ),
        onClick: () => triggerModal('share', type, item),
      },
      {
        label: 'Delete',
        danger: true,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => triggerModal('delete', type, item),
      }
    );

    return options;
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar Left */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onSearchChange={setSearchQuery} />

        {/* Drag and Drop Container Wrapper */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex-1 overflow-y-auto p-6 relative flex flex-col space-y-6 ${
            dragActive ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
          }`}
        >
          {/* Drag Overlay visual shield */}
          {dragActive && (
            <div className="absolute inset-0 bg-blue-600/10 border-2 border-dashed border-blue-500 rounded-3xl m-4 pointer-events-none flex flex-col items-center justify-center space-y-3 z-30 backdrop-blur-xs">
              <svg className="w-16 h-16 text-blue-500 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
              </svg>
              <h2 className="text-xl font-bold font-display text-blue-650 dark:text-blue-400">
                Drop your files here
              </h2>
              <p className="text-sm text-slate-500">Files will be instantly uploaded to this directory.</p>
            </div>
          )}

          {/* Breadcrumb Path & View Mode Selection Row */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-4 py-1.5 rounded-2xl shadow-xxs">
            <Breadcrumb onNavigate={handleNavigate} />
            
            {/* View Mode controls */}
            <div className="flex items-center space-x-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-650 dark:text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-650 dark:text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="flex-1">
            {folderLoading || fileLoading ? (
              <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-450" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : viewMode === 'grid' ? (
              <FileGrid
                folders={filteredFolders}
                files={filteredFiles}
                onNavigate={handleNavigate}
                onPreview={(file) => triggerModal('preview', 'file', file)}
                onContextMenu={handleContextMenuTrigger}
              />
            ) : (
              <FileList
                folders={filteredFolders}
                files={filteredFiles}
                onNavigate={handleNavigate}
                onPreview={(file) => triggerModal('preview', 'file', file)}
                onContextMenu={handleContextMenuTrigger}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Upload Queue Progress */}
      <UploadProgress />

      {/* Modals & Dialog integrations */}
      <RenameModal
        isOpen={activeModal === 'rename'}
        item={selectedItem}
        type={selectedType}
        onClose={() => setActiveModal(null)}
        onConfirm={handleRenameConfirm}
      />

      <DeleteConfirmModal
        isOpen={activeModal === 'delete'}
        item={selectedItem}
        type={selectedType}
        isPermanent={false}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeleteConfirm}
      />

      <MoveModal
        isOpen={activeModal === 'move'}
        item={selectedItem}
        type={selectedType}
        onClose={() => setActiveModal(null)}
        onConfirm={handleMoveConfirm}
      />

      <ShareModal
        isOpen={activeModal === 'share'}
        item={selectedItem}
        type={selectedType}
        onClose={() => setActiveModal(null)}
      />

      <PreviewModal
        isOpen={activeModal === 'preview'}
        file={selectedItem}
        onClose={() => setActiveModal(null)}
        onDownload={handleDownload}
      />

      {/* Custom Context Menu popover */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={getContextMenuOptions()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
