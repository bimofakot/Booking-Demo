import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  role?: Role;
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600 dark:text-brand-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          message:
            role === 'owner'
              ? 'Masuk sebagai owner untuk membuka dashboard.'
              : 'Masuk dulu untuk membuka halaman ini.',
        }}
      />
    );
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
