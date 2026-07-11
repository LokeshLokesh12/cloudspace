import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFolderTree } from '../../store/slices/folderSlice';

// Rename Modal Component
export function RenameModal({ isOpen, item, type, onClose, onConfirm }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || item.originalName || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm(item._id, name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Rename {type === 'folder' ? 'Folder' : 'File'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-350 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-850 sm:text-sm"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold rounded-lg text-white"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirm Modal Component
export function DeleteConfirmModal({ isOpen, item, type, isPermanent, onClose, onConfirm }) {
  if (!isOpen || !item) return null;

  const displayName = item.name || item.originalName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-650 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">
            {isPermanent ? 'Permanently Delete' : 'Move to Trash'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Are you sure you want to {isPermanent ? 'permanently delete' : 'delete'} <span className="font-semibold text-slate-800 dark:text-white">"{displayName}"</span>? 
            {isPermanent ? ' This action is irreversible.' : ' You can restore it from the trash later.'}
          </p>
        </div>
        <div className="flex space-x-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(item._id)}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-sm font-semibold rounded-lg text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Move Folder/File Modal Component
export function MoveModal({ isOpen, item, type, onClose, onConfirm }) {
  const dispatch = useDispatch();
  const { tree } = useSelector((state) => state.folders);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchFolderTree());
    }
  }, [isOpen, dispatch]);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    if (!selectedFolderId) return;
    onConfirm(item._id, selectedFolderId);
  };

  const renderFolderNode = (node, depth = 0) => {
    // Avoid moving folder into itself or its descendants
    const isSelf = type === 'folder' && node._id === item._id;
    if (isSelf) return null;

    const isSelected = selectedFolderId === node._id;

    return (
      <div key={node._id} style={{ marginLeft: `${depth * 12}px` }}>
        <button
          onClick={() => setSelectedFolderId(node._id)}
          className={`flex items-center space-x-2 w-full px-3 py-1.5 rounded-lg text-left text-xs font-semibold select-none transition ${
            isSelected
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="truncate">{node.name === 'Home' ? 'My Files' : node.name}</span>
        </button>
        {node.children && node.children.length > 0 && (
          <div className="space-y-1 mt-1 border-l border-slate-100 dark:border-slate-800 ml-3.5 pl-1.5">
            {node.children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">
          Move {type === 'folder' ? 'Folder' : 'File'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose a destination folder to move <span className="font-semibold text-slate-850 dark:text-white">"{item.name || item.originalName}"</span>:
        </p>

        {/* Tree Directory List */}
        <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-850 rounded-xl p-3 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
          {tree && tree._id ? renderFolderNode(tree) : (
            <div className="text-center py-6 text-xs text-slate-400">Loading directory tree...</div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedFolderId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold rounded-lg text-white disabled:opacity-50 transition"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
