import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '@/context/ThemeContext';
import { cn } from '@/lib/cn';
import { Menu, menuItemClasses } from './Menu';

const options: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  { value: 'light', label: 'Terang', description: 'Selalu mode terang', icon: Sun },
  { value: 'dark', label: 'Gelap', description: 'Selalu mode gelap', icon: Moon },
  { value: 'system', label: 'Ikuti perangkat', description: 'Sesuai pengaturan HP', icon: Monitor },
];

export function ThemeMenu() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const TriggerIcon = preference === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;
  const activeLabel = options.find((option) => option.value === preference)?.label ?? 'Tema';

  return (
    <Menu
      align="right"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={`Ganti tema (aktif: ${activeLabel})`}
          aria-expanded={open}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <TriggerIcon className="h-4 w-4" />
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
        </button>
      )}
    >
      {({ close }) => (
        <div className="p-1.5">
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Tema tampilan
          </p>
          {options.map((option) => {
            const Icon = option.icon;
            const active = preference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setPreference(option.value);
                  close();
                }}
                className={cn(menuItemClasses, active && 'text-brand-700 dark:text-brand-300')}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-[11px] font-normal text-slate-400">
                    {option.description}
                  </span>
                </span>
                {active && <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
              </button>
            );
          })}
        </div>
      )}
    </Menu>
  );
}
