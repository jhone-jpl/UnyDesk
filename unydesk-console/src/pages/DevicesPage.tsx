import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Monitor, MonitorOff, Wifi } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth';
import { PageHeader } from '../components/ui/PageHeader';

function fmt(ts?: string) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function DevicesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.devices(token!),
    refetchInterval: 5000,
    enabled: !!token,
  });

  const mutate = useMutation({
    mutationFn: async ({
      guid,
      action,
    }: {
      guid: string;
      action: 'enable' | 'disable' | 'delete';
    }) => {
      if (action === 'enable') return api.enableDevice(token!, guid);
      if (action === 'disable') return api.disableDevice(token!, guid);
      return api.deleteDevice(token!, guid);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  });

  const devices = q.data?.data || [];
  const online = devices.filter((d) => d.online && !d.disabled).length;
  const offline = devices.filter((d) => !d.online && !d.disabled).length;
  const disabled = devices.filter((d) => d.disabled).length;

  return (
    <div>
      <PageHeader
        title="Dispositivos"
        description="Inventário online/offline dos agentes UnyDesk."
        crumbs={[
          { label: 'Início', to: '/devices' },
          { label: 'Dispositivos' },
        ]}
        actions={
          <span className="selo selo-neutro">{q.data?.total ?? 0} total</span>
        }
      />

      <div className="metricas">
        <div className="card-metrica">
          <div className="card-metrica-icone">
            <Wifi size={18} />
          </div>
          <div>
            <strong className="num">{online}</strong>
            <span>Online</span>
          </div>
        </div>
        <div className="card-metrica">
          <div className="card-metrica-icone">
            <MonitorOff size={18} />
          </div>
          <div>
            <strong className="num">{offline}</strong>
            <span>Offline</span>
          </div>
        </div>
        <div className="card-metrica">
          <div className="card-metrica-icone">
            <Monitor size={18} />
          </div>
          <div>
            <strong className="num">{disabled}</strong>
            <span>Desativados</span>
          </div>
        </div>
      </div>

      {q.isLoading ? <p style={{ color: 'var(--texto-muted)' }}>Carregando…</p> : null}
      {q.error ? (
        <div className="alerta alerta-erro">{(q.error as Error).message}</div>
      ) : null}

      <div className="painel">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Nome</th>
              <th>ID</th>
              <th>Usuário</th>
              <th>SO</th>
              <th>Último online</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr
                key={d.guid}
                className={
                  d.disabled
                    ? 'linha-atencao'
                    : d.online
                      ? 'linha-ok'
                      : undefined
                }
              >
                <td>
                  <span
                    className={
                      d.disabled
                        ? 'selo selo-atencao'
                        : d.online
                          ? 'selo selo-ok'
                          : 'selo selo-neutro'
                    }
                  >
                    {d.disabled ? 'Desativado' : d.online ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td>
                  <div className="produto-nome">
                    {d.device_name || d.hostname || '—'}
                  </div>
                </td>
                <td>
                  <code className="mono">{d.id}</code>
                </td>
                <td>{d.user_name || d.username || '—'}</td>
                <td style={{ maxWidth: 220 }}>{d.os || '—'}</td>
                <td>{fmt(d.last_online)}</td>
                <td>
                  <div className="acoes-linha">
                    <Link className="link-sutil" to={`/remote/${d.id}`}>
                      Conectar
                    </Link>
                    {d.disabled ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          mutate.mutate({ guid: d.guid, action: 'enable' })
                        }
                      >
                        Ativar
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          mutate.mutate({ guid: d.guid, action: 'disable' })
                        }
                      >
                        Desativar
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-perigo"
                      onClick={() => {
                        if (confirm(`Excluir dispositivo ${d.id}?`)) {
                          mutate.mutate({ guid: d.guid, action: 'delete' });
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!devices.length && !q.isLoading ? (
              <tr>
                <td colSpan={7} className="tabela-vazia">
                  Nenhum dispositivo ainda. Instale o agente UnyDesk apontando
                  para esta API ou use Deploy.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
