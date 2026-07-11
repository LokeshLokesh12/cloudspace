import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelUpload, clearCompletedUploads } from '../../store/slices/fileSlice';
import { formatBytes } from '../layout/Sidebar';

export default function UploadProgress() {
  const dispatch = useDispatch();
  const { uploadQueue } = useSelector((state) => state.files);
  const [isMinimized, setIsMinimized] = useState(false);

  if (uploadQueue.length === 0) return null;

  const totalUploads = uploadQueue.length;
  const activeUploads = uploadQueue.filter((u) => u.status === 'uploading').length;
  const completedUploads = uploadQueue.filter((u) => u.status === 'success').length;

  const handleCancel = (id) => {
    dispatch(cancelUpload(id));
  };

  const handleClearCompleted = () => {
    dispatch(clearCompletedUploads());
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors duration-300">
      {/* Widget Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {activeUploads > 0 ? (
            <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="text-xs font-bold font-display tracking-wider">
            {activeUploads > 0
              ? `Uploading ${activeUploads} file${activeUploads > 1 ? 's' : ''}`
              : `Uploaded ${completedUploads} file${completedUploads > 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Minimize button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition"
          >
            {isMinimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {/* Clear completed button */}
          {activeUploads === 0 && (
            <button
              onClick={handleClearCompleted}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition"
              title="Clear completed uploads"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Upload Queue List */}
      {!isMinimized && (
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {uploadQueue.map((item) => (
            <div key={item.id} className="p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate w-48 block" title={item.fileName}>
                  {item.fileName}
                </span>
                <span className="text-xxs text-slate-450 dark:text-slate-400 flex-shrink-0">
                  {formatBytes(item.size)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Progress bar */}
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      item.status === 'failed'
                        ? 'bg-red-500'
                        : item.status === 'cancelled'
                        ? 'bg-slate-400'
                        : item.status === 'success'
                        ? 'bg-green-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>

                {/* Status indicator / cancel trigger */}
                <div className="flex items-center text-xxs font-bold">
                  {item.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 dark:text-blue-400">{item.progress}%</span>
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-red-650"
                        title="Cancel upload"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {item.status === 'success' && (
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </span>
                  )}

                  {item.status === 'failed' && (
                    <span className="text-red-600 dark:text-red-400">Failed</span>
                  )}

                  {item.status === 'cancelled' && (
                    <span className="text-slate-400">Cancelled</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
