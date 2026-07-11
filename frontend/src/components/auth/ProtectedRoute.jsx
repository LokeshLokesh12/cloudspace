import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchProfile, setAuthChecked } from '../../store/slices/authSlice';

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, token, loading, authChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    } else if (!token) {
      dispatch(setAuthChecked(true));
    }
  }, [dispatch, token, user]);

  if (token && !user && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-sm text-slate-550 dark:text-slate-450 font-medium">Entering workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated && authChecked) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
