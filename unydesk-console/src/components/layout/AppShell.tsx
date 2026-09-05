import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  applyThemeSettings,
  defaultThemeSettings,
  loadThemeSettings,
  resolveThemeMode,
  saveThemeSettings,
  type ThemeSettings,
} from '@uny/design-system';
import { useAuth } from '../../auth';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ThemeCustomizer } from './ThemeCustomizer';
import { LockScreen } from './LockScreen';

const STORAGE_KEY = 'uny-sidebar-oculto';
const MQ_MOBILE = '(max-width: 1100px)';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [sidebarOculto, setSidebarOculto] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cfgAberto, setCfgAberto] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    try {
      return loadThemeSettings();
    } catch {
      return defaultThemeSettings;
    }
  });

  useEffect(() => {
    applyThemeSettings(theme);

    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setSidebarOculto(true);
    } catch {
      /* ignore */
    }

    const mq = window.matchMedia(MQ_MOBILE);
    const syncMobile = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMobileAberto(false);
    };
    syncMobile();
    mq.addEventListener('change', syncMobile);

    const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    const syncAuto = () => {
      const current = loadThemeSettings();
      if (current.theme === 'auto') {
        applyThemeSettings(current);
        setTheme({ ...current });
      }
    };
    mqDark.addEventListener('change', syncAuto);

    return () => {
      mq.removeEventListener('change', syncMobile);
      mqDark.removeEventListener('change', syncAuto);
    };
    // bootstrap listeners once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTheme = useCallback((next: ThemeSettings) => {
    setTheme(next);
    saveThemeSettings(next);
    applyThemeSettings(next);
  }, []);

  const resetTheme = useCallback(() => {
    updateTheme({ ...defaultThemeSettings });
  }, [updateTheme]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileAberto((v) => !v);
      return;
    }
    setSidebarOculto((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [isMobile]);

  const toggleThemeRapido = useCallback(() => {
    const resolved = resolveThemeMode(theme.theme);
    updateTheme({
      ...theme,
      theme: resolved === 'dark' ? 'light' : 'dark',
    });
  }, [theme, updateTheme]);

  const iniciais = (user?.name || 'UD').slice(0, 2).toUpperCase();
  const role = user?.is_admin ? 'Administrador' : 'Operador';

  const appClass = [
    'app',
    sidebarOculto ? 'sidebar-oculto' : '',
    mobileAberto ? 'sidebar-mobile-aberta' : '',
    theme.boxed ? 'layout-boxed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={appClass}>
      <Sidebar
        userName={user?.name || 'Usuário'}
        userRole={role}
        userInitials={iniciais}
        onLogout={() => logout()}
        onOpenSettings={() => setCfgAberto(true)}
        onLock={() => setBloqueado(true)}
        showCaptions={theme.caption}
      />
      <button
        type="button"
        className="sidebar-overlay"
        aria-label="Fechar menu"
        onClick={() => setMobileAberto(false)}
      />
      <div className="conteudo">
        <TopBar
          onToggleSidebar={toggleSidebar}
          onToggleTheme={toggleThemeRapido}
          sidebarOculto={isMobile ? !mobileAberto : sidebarOculto}
          themeEscuro={resolveThemeMode(theme.theme) === 'dark'}
          iniciais={iniciais}
        />
        <main className="pagina">{children}</main>
      </div>
      <ThemeCustomizer
        open={cfgAberto}
        settings={theme}
        onClose={() => setCfgAberto(false)}
        onChange={updateTheme}
        onReset={resetTheme}
      />
      {bloqueado ? (
        <LockScreen
          userName={user?.name || 'Usuário'}
          userInitials={iniciais}
          onUnlock={() => setBloqueado(false)}
        />
      ) : null}
    </div>
  );
}
