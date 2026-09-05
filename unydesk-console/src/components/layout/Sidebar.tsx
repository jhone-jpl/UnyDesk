import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Lock,
  LogOut,
  Monitor,
  Settings,
  User,
} from 'lucide-react';
import { navGroups, type NavItem } from '../../lib/nav';

type SidebarProps = {
  userName?: string;
  userRole?: string;
  userInitials?: string;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onLock?: () => void;
  showCaptions?: boolean;
};

function itemActive(pathname: string, item: NavItem) {
  if (!item.href) return false;
  return item.end ? pathname === item.href : pathname.startsWith(item.href);
}

export function Sidebar({
  userName = 'Usuário',
  userRole = 'Operador',
  userInitials = 'UD',
  onLogout,
  onOpenSettings,
  onLock,
  showCaptions = true,
}: SidebarProps) {
  const { pathname } = useLocation();
  const [menuUser, setMenuUser] = useState(false);
  const rodapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuUser) return;
    const onDown = (e: MouseEvent) => {
      if (!rodapeRef.current?.contains(e.target as Node)) setMenuUser(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuUser(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuUser]);

  return (
    <aside className="sidebar" aria-label="Menu lateral">
      <div className="marca">
        <div className="marca-icone" aria-hidden>
          <Monitor size={17} strokeWidth={2.25} />
        </div>
        <div>
          <div className="marca-texto">
            UnyDesk <span className="marca-sub">v0.1</span>
          </div>
        </div>
      </div>

      <nav className="nav" aria-label="Principal">
        {navGroups.map((g) => (
          <div key={g.caption}>
            <div className="nav-caption" hidden={!showCaptions}>
              {g.caption}
            </div>
            {g.items.map((item) => {
              const Icon = item.icon;
              if (!item.href) return null;
              const ativo = itemActive(pathname, item);
              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  end={item.end}
                  className={ativo ? 'nav-item ativo' : 'nav-item'}
                >
                  <Icon
                    className="nav-item-icone"
                    size={18}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="nav-item-label">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-rodape" ref={rodapeRef}>
        {menuUser ? (
          <div className="user-menu" role="menu" aria-label="Menu do usuário">
            <button
              type="button"
              className="user-menu-item"
              role="menuitem"
              onClick={() => setMenuUser(false)}
            >
              <User size={20} strokeWidth={1.75} />
              <span>Minha conta</span>
            </button>
            <button
              type="button"
              className="user-menu-item"
              role="menuitem"
              onClick={() => {
                setMenuUser(false);
                onOpenSettings?.();
              }}
            >
              <Settings size={20} strokeWidth={1.75} />
              <span>Configurações</span>
            </button>
            <button
              type="button"
              className="user-menu-item"
              role="menuitem"
              onClick={() => {
                setMenuUser(false);
                onLock?.();
              }}
            >
              <Lock size={20} strokeWidth={1.75} />
              <span>Tela de bloqueio</span>
            </button>
            <button
              type="button"
              className="user-menu-item perigo"
              role="menuitem"
              onClick={() => {
                setMenuUser(false);
                onLogout?.();
              }}
            >
              <LogOut size={20} strokeWidth={1.75} />
              <span>Sair</span>
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className={menuUser ? 'sidebar-perfil aberto' : 'sidebar-perfil'}
          aria-expanded={menuUser}
          aria-haspopup="menu"
          onClick={() => setMenuUser((v) => !v)}
        >
          <div className="avatar">{userInitials}</div>
          <div className="sidebar-perfil-meta">
            <div className="sidebar-perfil-nome">{userName}</div>
            <div className="sidebar-perfil-cargo">{userRole}</div>
          </div>
          <LayoutGrid
            size={16}
            strokeWidth={2}
            color="var(--texto-muted)"
            aria-hidden
          />
        </button>
      </div>
    </aside>
  );
}
