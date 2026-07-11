import { useSelector } from 'react-redux';

export default function Breadcrumb({ onNavigate }) {
  const { breadcrumb } = useSelector((state) => state.folders);

  if (!breadcrumb || breadcrumb.length === 0) return null;

  return (
    <nav className="flex py-3 text-slate-700 dark:text-slate-350" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap text-sm font-medium">
        {breadcrumb.map((item, index) => {
          const isLast = index === breadcrumb.length - 1;

          return (
            <li key={item._id} className="inline-flex items-center">
              {index > 0 && (
                <svg className="w-5 h-5 text-slate-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {isLast ? (
                <span className="text-slate-800 dark:text-white font-bold select-none cursor-default max-w-[120px] md:max-w-xs truncate">
                  {item.name === 'Home' ? 'My Files' : item.name}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(item._id)}
                  className="inline-flex items-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-450 hover:underline max-w-[120px] md:max-w-xs truncate"
                >
                  {item.name === 'Home' ? 'My Files' : item.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
