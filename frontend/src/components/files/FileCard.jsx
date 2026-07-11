import FileIcon from './FileIcon';
import { formatBytes } from '../layout/Sidebar';

export default function FileCard({ file, onPreview, onContextMenu }) {
  const handleDoubleClick = () => {
    onPreview(file);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, 'file', file);
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md cursor-pointer select-none group transition-all duration-150"
    >
      {/* File Visual Preview Box */}
      <div className="h-28 bg-slate-50 dark:bg-slate-850 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden relative">
        <FileIcon
          mimeType={file.mimeType}
          extension={file.extension}
          fileId={file._id}
          className="w-full h-full"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </div>

      {/* File Info */}
      <div className="p-3 flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-850 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400" title={file.originalName}>
          {file.originalName}
        </p>
        <div className="flex justify-between items-center text-xxs text-slate-400 mt-1">
          <span>{formatBytes(file.size)}</span>
          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
