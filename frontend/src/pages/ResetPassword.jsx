import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordConfirm, clearError } from '../store/slices/authSlice';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess(false);

    if (!token) {
      setLocalError('Reset token is missing from url');
      return;
    }

    if (!password) {
      setLocalError('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const result = await dispatch(resetPasswordConfirm({ token, password }));
    if (resetPasswordConfirm.fulfilled.match(result)) {
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div>
          <h1 className="text-center font-display text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 mb-1">
            CloudSpace
          </h1>
          <h2 className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Set a new password
          </h2>
        </div>

        {localError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg">
            {localError}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm p-4 rounded-lg text-center">
            <h4 className="font-semibold mb-1">Password Changed Successfully!</h4>
            <p className="mb-4 text-xs">Your password has been successfully reset. You can now log in using your new credentials.</p>
            <Link
              to="/login"
              className="inline-block py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-850 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-850 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-150"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {!success && (
          <div className="text-center text-sm mt-4">
            <Link
              to="/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
