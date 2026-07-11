import { formatBytes } from '../layout/Sidebar';
import FileIcon from './FileIcon';

export default function FileList({ folders, files, onNavigate, onPreview, onContextMenu }) {
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

  const renderRow = (item, type) => {
    const isFolder = type === 'folder';

    const handleRowClick = () => {
      if (isFolder) {
        onNavigate(item._id);
      } else {
        onPreview(item);
      }
    };

    const handleRightClick = (e) => {
      e.preventDefault();
      if (onContextMenu) {
        onContextMenu(e, type, item);
      }
    };

    return (
      <tr
        key={item._id}
        onDoubleClick={handleRowClick}
        onContextMenu={handleRightClick}
        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer select-none group transition"
      >
        <td className="px-6 py-3.5 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            {isFolder ? (
              <div className="flex items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400 w-10 h-10 flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <FileIcon
                mimeType={item.mimeType}
                extension={item.extension}
                fileId={item._id}
                className="w-10 h-10 flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-450 block truncate" title={item.name || item.originalName}>
                {item.name || item.originalName}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
          {isFolder ? 'Folder' : (item.mimeType?.split('/')[1]?.toUpperCase() || item.extension?.toUpperCase() || 'FILE')}
        </td>
        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
          {isFolder ? '—' : formatBytes(item.size)}
        </td>
        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-3.5 whitespace-nowrap text-right text-sm">
          <button
            onClick={handleRightClick}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-850">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                Name
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                Type
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                Size
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                Last Modified
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {folders.map((folder) => renderRow(folder, 'folder'))}
            {files.map((file) => renderRow(file, 'file'))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
