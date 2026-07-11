import { useState, useEffect } from 'react';
import { formatBytes } from '../layout/Sidebar';

export default function ShareModal({ isOpen, item, type, onClose }) {
  const [visibility, setVisibility] = useState('private'); // private, specific_users, anyone_with_link
  const [emails, setEmails] = useState('');
  const [permission, setPermission] = useState('view_only');
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Key for localStorage persistence
  const storageKey = item ? `share:permissions:${item._id}` : null;

  useEffect(() => {
    if (isOpen && storageKey) {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setVisibility(parsed.visibility || 'private');
          setAllowedUsers(parsed.allowedUsers || []);
          setShareLink(parsed.shareLink || '');
        } catch (e) {
          console.error('Failed to parse share details', e);
        }
      } else {
        // Reset state for new item
        setVisibility('private');
        setAllowedUsers([]);
        setShareLink('');
      }
      setCopied(false);
      setEmails('');
      setPermission('view_only');
    }
  }, [isOpen, storageKey]);

  if (!isOpen || !item) return null;

  const saveSettings = (newVisibility, newAllowedUsers, newShareLink) => {
    if (!storageKey) return;
    const dataToSave = {
      visibility: newVisibility ?? visibility,
      allowedUsers: newAllowedUsers ?? allowedUsers,
      shareLink: newShareLink ?? shareLink,
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!emails.trim()) return;

    const emailList = emails
      .split(',')
      .map((em) => em.trim())
      .filter((em) => em && em.includes('@'));

    if (emailList.length === 0) return;

    const newUsers = [...allowedUsers];
    emailList.forEach((email) => {
      if (!newUsers.some((u) => u.email === email)) {
        newUsers.push({ email, permission });
      }
    });

    setAllowedUsers(newUsers);
    setEmails('');
    saveSettings(visibility, newUsers, shareLink);
  };

  const handleRemoveUser = (emailToRemove) => {
    const updated = allowedUsers.filter((u) => u.email !== emailToRemove);
    setAllowedUsers(updated);
    saveSettings(visibility, updated, shareLink);
  };

  const handleVisibilityChange = (e) => {
    const val = e.target.value;
    setVisibility(val);

    let link = shareLink;
    if (val === 'anyone_with_link' && !shareLink) {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      link = `${window.location.origin}/preview?token=${token}&fileId=${item._id}`;
      setShareLink(link);
    }
    saveSettings(val, allowedUsers, link);
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">
              Share "{item.name || item.originalName}"
            </h3>
            <p className="text-xxs text-slate-400 mt-0.5 uppercase tracking-wider">
              {type === 'folder' ? 'Folder settings' : 'File settings'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-55"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* General Visibility Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            General Access
          </label>
          <select
            value={visibility}
            onChange={handleVisibilityChange}
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-850 sm:text-sm font-semibold"
          >
            <option value="private">Restricted (Only you can access)</option>
            <option value="specific_users">Specific Users (Shared with list below)</option>
            <option value="anyone_with_link">Anyone with the link (Public link access)</option>
          </select>
        </div>

        {/* Link sharing section */}
        {visibility === 'anyone_with_link' && (
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3.5 space-y-2.5">
            <label className="block text-xxs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Access Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-1.5 border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 text-xs rounded-lg select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}

        {/* Specific user listing section */}
        {visibility === 'specific_users' && (
          <div className="space-y-4">
            {/* Add email list form */}
            <form onSubmit={handleAddUser} className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Add People & Permissions
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter emails (comma separated)"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-350 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-850 sm:text-sm"
                />
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="px-2 py-2 border border-slate-350 dark:border-slate-700 text-slate-850 dark:text-white rounded-lg focus:outline-none dark:bg-slate-850 text-xs font-semibold"
                >
                  <option value="view_only">Viewer</option>
                  <option value="download_only">Downloader</option>
                  <option value="edit_download">Editor (Download)</option>
                  <option value="edit_download_delete">Editor (Delete)</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-semibold rounded-lg text-xs transition"
                >
                  Add
                </button>
              </div>
            </form>

            {/* Allowed User List */}
            <div className="space-y-2.5">
              <label className="block text-xxs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                People with Access ({allowedUsers.length})
              </label>
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/40">
                {allowedUsers.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No users added yet.</p>
                ) : (
                  allowedUsers.map((user) => (
                    <div key={user.email} className="flex justify-between items-center py-2 px-1 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-850 dark:text-white truncate block">
                          {user.email}
                        </span>
                        <span className="text-xxs text-slate-400 capitalize">
                          {user.permission.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(user.email)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
}
