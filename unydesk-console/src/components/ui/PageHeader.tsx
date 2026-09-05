import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Crumb = { label: string; to?: string };

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="cabecalho-pagina">
      <div>
        {crumbs?.length ? (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`}>
                {i > 0 ? <span className="breadcrumb-sep">/</span> : null}
                {c.to ? (
                  <Link to={c.to}>{c.label}</Link>
                ) : (
                  <span className="breadcrumb-atual">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="cabecalho-acoes">{actions}</div> : null}
    </div>
  );
}
