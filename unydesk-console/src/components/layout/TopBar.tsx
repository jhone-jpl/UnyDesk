import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Maximize2,
  Minimize2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
} from 'lucide-react';
import { searchNav, type SearchHit } from '../../lib/nav';

type TopBarProps = {
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  sidebarOculto?: boolean;
  themeEscuro?: boolean;
  iniciais?: string;
};

export function TopBar({
  onToggleSidebar,
  onToggleTheme,
  sidebarOculto = false,
  themeEscuro = false,
  iniciais = 'UD',
}: TopBarProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [aberto, setAberto] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>(() => searchNav(''));
  const [ativo, setAtivo] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const filtrar = useCallback((q: string) => {
    setQuery(q);
    setHits(searchNav(q));
    setAtivo(0);
  }, []);

  const irPara = useCallback(
    (href: string) => {
      navigate(href);
      setAberto(false);
      setQuery('');
      setHits(searchNav(''));
      inputRef.current?.blur();
    },
    [navigate],
  );

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAberto(true);
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [aberto]);

  return (
    <header className="topo">
      <div className="topo-esq">
        <button
          type="button"
          className={sidebarOculto ? 'topo-menu-btn ativo' : 'topo-menu-btn'}
          onClick={onToggleSidebar}
          aria-label={sidebarOculto ? 'Mostrar menu' : 'Ocultar menu'}
        >
          {sidebarOculto ? (
            <PanelLeftOpen size={18} strokeWidth={2} />
          ) : (
            <PanelLeftClose size={18} strokeWidth={2} />
          )}
        </button>

        <div className="topo-busca-wrap" ref={wrapRef}>
          <div className="topo-busca">
            <Search size={16} strokeWidth={2} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              placeholder="Buscar páginas…"
              value={query}
              onChange={(e) => {
                filtrar(e.target.value);
                setAberto(true);
              }}
              onFocus={() => setAberto(true)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setAtivo((i) => Math.min(i + 1, hits.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setAtivo((i) => Math.max(i - 1, 0));
                } else if (e.key === 'Enter' && hits[ativo]) {
                  e.preventDefault();
                  irPara(hits[ativo].href);
                } else if (e.key === 'Escape') {
                  setAberto(false);
                }
              }}
              aria-label="Buscar navegação"
            />
            <kbd>Ctrl K</kbd>
          </div>
          {aberto ? (
            <div className="topo-busca-dropdown" role="listbox">
              {hits.length ? (
                hits.map((h, i) => (
                  <button
                    key={`${h.href}-${h.label}`}
                    type="button"
                    role="option"
                    aria-selected={i === ativo}
                    className={
                      i === ativo ? 'topo-busca-item ativo' : 'topo-busca-item'
                    }
                    onMouseEnter={() => setAtivo(i)}
                    onClick={() => irPara(h.href)}
                  >
                    <span>{h.label}</span>
                    <span className="topo-busca-grupo">{h.group}</span>
                  </button>
                ))
              ) : (
                <div className="topo-busca-vazio">Nenhum resultado</div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="topo-direita">
        <button
          type="button"
          className="topo-icon-btn"
          onClick={onToggleTheme}
          aria-label="Alternar tema"
        >
          {themeEscuro ? (
            <Sun size={18} strokeWidth={2} />
          ) : (
            <Moon size={18} strokeWidth={2} />
          )}
        </button>
        <button
          type="button"
          className="topo-icon-btn"
          onClick={toggleFullscreen}
          aria-label="Tela cheia"
        >
          {fullscreen ? (
            <Minimize2 size={18} strokeWidth={2} />
          ) : (
            <Maximize2 size={18} strokeWidth={2} />
          )}
        </button>
        <div className="avatar avatar-sm" aria-hidden>
          {iniciais}
        </div>
      </div>
    </header>
  );
}
