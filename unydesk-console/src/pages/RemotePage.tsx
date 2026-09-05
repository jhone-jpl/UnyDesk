import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../auth';
import { PageHeader } from '../components/ui/PageHeader';

export default function RemotePage() {
  const { id: routeId } = useParams();
  const { token } = useAuth();
  const [id, setId] = useState(routeId || '');
  const [copied, setCopied] = useState(false);

  const devices = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.devices(token!),
    enabled: !!token,
  });

  const device = (devices.data?.data || []).find((d) => d.id === id);

  function copyId() {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
  }

  const deepLink = id ? `unydesk://${id}` : '';

  return (
    <div>
      <PageHeader
        title="Remoto"
        description="Conexão via app nativo UnyDesk (sem web stream no MVP)."
        crumbs={[{ label: 'Operação' }, { label: 'Remoto' }]}
      />

      <div className="painel" style={{ marginBottom: 16 }}>
        <form className="form-row-uny" onSubmit={onSubmit}>
          <label className="campo" style={{ flex: 1, minWidth: '14rem' }}>
            Peer ID
            <input
              className="input"
              placeholder="ID do dispositivo"
              value={id}
              onChange={(e) => setId(e.target.value)}
              list="device-ids"
            />
          </label>
          <datalist id="device-ids">
            {(devices.data?.data || []).map((d) => (
              <option key={d.guid} value={d.id}>
                {d.device_name || d.hostname || d.id}
              </option>
            ))}
          </datalist>
          <button
            type="button"
            className="btn btn-primario"
            onClick={copyId}
            disabled={!id}
          >
            {copied ? 'Copiado' : 'Copiar ID'}
          </button>
        </form>
      </div>

      {id ? (
        <div className="painel">
          <div className="painel-cabecalho">
            <h2>{device?.device_name || device?.hostname || id}</h2>
            <span
              className={
                device?.disabled
                  ? 'selo selo-atencao'
                  : device?.online
                    ? 'selo selo-ok'
                    : 'selo selo-neutro'
              }
            >
              {device?.disabled
                ? 'Desativado'
                : device?.online
                  ? 'Online'
                  : 'Offline / desconhecido'}
            </span>
          </div>
          <div className="painel-corpo">
            <p>
              SO: {device?.os || '—'} · Usuário:{' '}
              {device?.user_name || device?.username || '—'}
            </p>
            <ol style={{ paddingLeft: '1.2rem' }}>
              <li>Abra o UnyDesk Client nesta máquina de suporte.</li>
              <li>
                Cole o ID <code className="mono">{id}</code> e conecte.
              </li>
              <li>
                Deep link:{' '}
                <a className="link-sutil" href={deepLink}>
                  {deepLink}
                </a>
              </li>
            </ol>
          </div>
        </div>
      ) : null}
    </div>
  );
}
