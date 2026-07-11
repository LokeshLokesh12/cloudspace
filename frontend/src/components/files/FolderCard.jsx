export default function FolderCard({ folder, onNavigate, onContextMenu }) {
  const handleDoubleClick = () => {
    onNavigate(folder._id);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, 'folder', folder);
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md cursor-pointer select-none group transition-all duration-150"
    >
      <div className="flex-shrink-0 text-amber-500 group-hover:scale-105 transition-transform duration-150">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-850 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {folder.name}
        </p>
        <p className="text-xxs text-slate-400 mt-0.5">Folder</p>
      </div>
    </div>
  );
}
