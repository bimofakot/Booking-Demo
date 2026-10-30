import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  History,
  LayoutDashboard,
  LogIn,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { usePendingBookings } from '@/hooks/usePendingBookings';
import { ROLE_LABEL } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Menu, menuItemClasses } from '@/components/ui/Menu';
import { ThemeMenu } from '@/components/ui/ThemeMenu';

function NavItem({
  to,
  icon: Icon,
  label,
  badge,
  end,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-brand-50 text-brand-800 dark:bg-brand-500/10 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold leading-none text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );
}

function AccountMenu({
  user,
  pendingCount,
  loggingOut,
  onLogout,
}: {
  user: User;
  pendingCount: number;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  const isOwner = user.role === 'owner';

  return (
    <Menu
      align="right"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-1.5 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-emerald-500 text-xs font-extrabold uppercase text-white">
            {user.username.slice(0, 1)}
          </span>
          <span className="hidden max-w-24 truncate text-sm font-semibold text-slate-700 dark:text-slate-200 sm:block">
            {user.username}
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
        </button>
      )}
    >
      {({ close }) => (
        <div className="p-1.5">
          <div className="px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {user.username}
              </p>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide',
                  isOwner
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                {ROLE_LABEL[user.role]}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>

          <div className="mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" />

          <Link to="/booking-saya" onClick={close} className={menuItemClasses}>
            <History className="h-4 w-4" />
            Riwayat saya
          </Link>

          {isOwner && (
            <Link to="/owner" onClick={close} className={menuItemClasses}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="flex-1">Dashboard owner</span>
              {pendingCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              close();
              onLogout();
            }}
            disabled={loggingOut}
            className="mt-1 w-full justify-start rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      )}
    </Menu>
  );
}

export function Header() {
  const { user, loading, logout } = useAuth();
  const { bookings: pendingBookings } = usePendingBookings(user?.role === 'owner');
  const pendingCount = pendingBookings.length;
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Logo />

        <nav className="ml-5 hidden items-center gap-1 sm:flex" aria-label="Navigasi utama">
          <NavItem to="/" icon={CalendarDays} label="Jadwal" end />
          {user && <NavItem to="/booking-saya" icon={History} label="Riwayat" />}
          {user?.role === 'owner' && (
            <NavItem to="/owner" icon={LayoutDashboard} label="Dashboard" badge={pendingCount} />
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeMenu />
          {loading ? (
            <span className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          ) : user ? (
            <AccountMenu
              user={user}
              pendingCount={pendingCount}
              loggingOut={loggingOut}
              onLogout={() => void handleLogout()}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className={buttonClasses({ variant: 'outline', size: 'sm' })}
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
              <Link
                to="/daftar"
                className={buttonClasses({ size: 'sm', className: 'hidden sm:inline-flex' })}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
