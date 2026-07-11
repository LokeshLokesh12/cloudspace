import FolderCard from './FolderCard';
import FileCard from './FileCard';

export default function FileGrid({ folders, files, onNavigate, onPreview, onContextMenu }) {
  const hasContent = folders.length > 0 || files.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
        <svg className="w-16 h-16 stroke-1 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-semibold">This folder is empty</p>
        <p className="text-xs mt-1">Drag and drop files or click "Upload File" to add files.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Folders Grid */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-3 select-none">
            Folders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                onNavigate={onNavigate}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Grid */}
      {files.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-3 select-none">
            Files
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <FileCard
                key={file._id}
                file={file}
                onPreview={onPreview}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
