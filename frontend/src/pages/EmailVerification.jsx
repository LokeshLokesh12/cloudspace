import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmailToken } from '../store/slices/authSlice';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const doVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing from the URL.');
        return;
      }
      
      const result = await dispatch(verifyEmailToken(token));
      if (verifyEmailToken.fulfilled.match(result)) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.payload || 'Invalid or expired verification token.');
      }
    };
    
    doVerification();
  }, [dispatch, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 mb-1">
            CloudSpace
          </h1>
          <h2 className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
            Email Verification
          </h2>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Verifying your email address, please wait...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 dark:text-green-400 font-semibold">Your email has been verified successfully!</p>
              <p className="text-slate-550 dark:text-slate-450 text-xs">You can now proceed to your cloud workspace.</p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block py-2 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continue to Workspace
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-750 dark:text-red-400 font-semibold">Verification Failed</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{errorMessage}</p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block py-2 px-6 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-350 dark:hover:bg-slate-700 transition"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
