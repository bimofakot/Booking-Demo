import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  History,
  LayoutDashboard,
  LogIn,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePendingBookings } from '@/hooks/usePendingBookings';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  end?: boolean;
}

export function BottomNav() {
  const { user } = useAuth();
  const { bookings: pendingBookings } = usePendingBookings(user?.role === 'owner');
  const pendingCount = pendingBookings.length;

  let items: NavItem[];
  if (!user) {
    items = [
      { to: '/', label: 'Jadwal', icon: CalendarDays, end: true },
      { to: '/login', label: 'Masuk', icon: LogIn },
      { to: '/daftar', label: 'Daftar', icon: UserPlus },
    ];
  } else if (user.role === 'owner') {
    items = [
      { to: '/', label: 'Jadwal', icon: CalendarDays, end: true },
      { to: '/booking-saya', label: 'Riwayat', icon: History },
      { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, badge: pendingCount },
    ];
  } else {
    items = [
      { to: '/', label: 'Jadwal', icon: CalendarDays, end: true },
      { to: '/booking-saya', label: 'Riwayat', icon: History },
    ];
  }

  return (
    <nav
      aria-label="Navigasi bawah"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-950/95"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-bold transition',
                  isActive
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-slate-400 dark:text-slate-500',
                )
              }
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold leading-none text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
