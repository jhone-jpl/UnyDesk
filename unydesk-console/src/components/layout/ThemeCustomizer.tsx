import { useEffect, type ReactNode } from 'react';
import { Check, Cpu, X } from 'lucide-react';
import {
  ACCENT_PRESETS,
  defaultThemeSettings,
  type AccentPreset,
  type SidebarTheme,
  type ThemeMode,
  type ThemeSettings,
} from '@uny/design-system';

type ThemeCustomizerProps = {
  open: boolean;
  settings: ThemeSettings;
  onClose: () => void;
  onChange: (next: ThemeSettings) => void;
  onReset: () => void;
};

function PresetCard({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={active ? 'cfg-preset ativo' : 'cfg-preset'}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="cfg-preset-label">{label}</span>
      <span className="cfg-preset-icon" aria-hidden>
        {children}
      </span>
    </button>
  );
}

function MiniLayout({ dark }: { dark?: boolean }) {
  return (
    <span className={dark ? 'cfg-mini dark' : 'cfg-mini'}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function ThemeCustomizer({
  open,
  settings,
  onClose,
  onChange,
  onReset,
}: ThemeCustomizerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = <K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <>
      <button
        type="button"
        className="cfg-backdrop"
        aria-label="Fechar configurações"
        onClick={onClose}
      />
      <aside
        className="cfg-offcanvas"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cfg-titulo"
      >
        <div className="cfg-header">
          <h2 id="cfg-titulo">Configurações</h2>
          <button
            type="button"
            className="cfg-fechar"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="cfg-body">
          <section className="cfg-secao">
            <h3>Modo tema</h3>
            <p>Escolha o modo claro, escuro ou automático.</p>
            <div className="cfg-grade tres">
              <PresetCard
                label="Claro"
                active={settings.theme === 'light'}
                onClick={() => set('theme', 'light' satisfies ThemeMode)}
              >
                <MiniLayout />
              </PresetCard>
              <PresetCard
                label="Escuro"
                active={settings.theme === 'dark'}
                onClick={() => set('theme', 'dark')}
              >
                <MiniLayout dark />
              </PresetCard>
              <PresetCard
                label="Padrão"
                active={settings.theme === 'auto'}
                onClick={() => set('theme', 'auto')}
              >
                <Cpu size={22} strokeWidth={1.75} />
              </PresetCard>
            </div>
          </section>

          <section className="cfg-secao">
            <h3>Tema da barra lateral</h3>
            <p>Escolha o tema da barra lateral.</p>
            <div className="cfg-grade dois">
              <PresetCard
                label="Escuro"
                active={settings.sidebar === 'dark'}
                onClick={() => set('sidebar', 'dark' satisfies SidebarTheme)}
              >
                <MiniLayout dark />
              </PresetCard>
              <PresetCard
                label="Claro"
                active={settings.sidebar === 'light'}
                onClick={() => set('sidebar', 'light')}
              >
                <MiniLayout />
              </PresetCard>
            </div>
          </section>

          <section className="cfg-secao">
            <h3>Cor de destaque</h3>
            <p>Escolha a cor principal do tema.</p>
            <div
              className="cfg-acentos"
              role="listbox"
              aria-label="Cor de destaque"
            >
              {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((id) => {
                const c = ACCENT_PRESETS[id];
                const ativo = settings.accent === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="option"
                    aria-selected={ativo}
                    className={ativo ? 'cfg-acento ativo' : 'cfg-acento'}
                    style={{ background: c.hex }}
                    title={c.label}
                    onClick={() => set('accent', id)}
                  >
                    {ativo ? (
                      <Check size={14} strokeWidth={3} color="#fff" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="cfg-secao">
            <h3>Legenda da barra lateral</h3>
            <p>Ocultar / exibir legendas de grupo.</p>
            <div className="cfg-grade dois">
              <PresetCard
                label="Mostrar legenda"
                active={settings.caption}
                onClick={() => set('caption', true)}
              >
                <MiniLayout />
              </PresetCard>
              <PresetCard
                label="Ocultar legenda"
                active={!settings.caption}
                onClick={() => set('caption', false)}
              >
                <MiniLayout />
              </PresetCard>
            </div>
          </section>

          <section className="cfg-secao">
            <h3>Largura do layout</h3>
            <p>Largura total ou contêiner fixo.</p>
            <div className="cfg-grade dois">
              <PresetCard
                label="Largura total"
                active={!settings.boxed}
                onClick={() => set('boxed', false)}
              >
                <MiniLayout />
              </PresetCard>
              <PresetCard
                label="Largura fixa"
                active={settings.boxed}
                onClick={() => set('boxed', true)}
              >
                <MiniLayout />
              </PresetCard>
            </div>
          </section>

          <section className="cfg-secao">
            <button
              type="button"
              className="btn btn-perigo"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onReset}
            >
              Redefinir layout
            </button>
            <p className="cfg-hint">
              Padrão: {defaultThemeSettings.theme} · accent Azul marca · sidebar
              clara
            </p>
          </section>
        </div>
      </aside>
    </>
  );
}
