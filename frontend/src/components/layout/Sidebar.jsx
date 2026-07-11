import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStorageInfo } from '../../store/slices/fileSlice';

// Helper to format bytes
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const { storageInfo } = useSelector((state) => state.files);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    dispatch(fetchStorageInfo());
  }, [dispatch]);

  const navItems = [
    {
      to: '/',
      name: 'My Files',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      to: '/recent',
      name: 'Recent',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/shared',
      name: 'Shared With Me',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
    {
      to: '/favorites',
      name: 'Favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      to: '/trash',
      name: 'Trash',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full flex-shrink-0 transition-colors duration-300">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            C
          </div>
          <span className="font-display text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            CloudSpace
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Storage Indicator */}
      <div className="p-4 mx-4 mb-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          <span>Storage</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">{storageInfo.plan} Plan</span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              storageInfo.percentage > 90
                ? 'bg-red-500'
                : storageInfo.percentage > 70
                ? 'bg-yellow-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(100, storageInfo.percentage)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
          <span>{formatBytes(storageInfo.storageUsed)} / {formatBytes(storageInfo.storageLimit)}</span>
          <span className="font-semibold">{storageInfo.percentage}%</span>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="mt-3 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150"
        >
          Upgrade Storage
        </button>
      </div>

      {/* Upgrade Coming Soon Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Upgrade Coming Soon</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Payment integrations and storage plans are coming in the next version of CloudSpace. Thank you for your patience!
            </p>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
