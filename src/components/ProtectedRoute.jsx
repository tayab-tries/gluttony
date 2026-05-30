import { Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import UserNotRegisteredError from '../components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { currentUser, authReady, authError } = useAuth();

  if (!authReady) {
    return fallback;
  }

  if (authError) {
    if (authError === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  if (!currentUser) {
    return unauthenticatedElement;
  }

  return <Outlet />;
}
