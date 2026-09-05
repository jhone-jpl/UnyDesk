import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../auth';
import { PageHeader } from '../components/ui/PageHeader';

export default function DeployPage() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [created, setCreated] = useState<string | null>(null);
  const list = useQuery({
    queryKey: ['deploy-tokens'],
    queryFn: () => api.listDeployTokens(token!),
    enabled: !!token && !!user?.is_admin,
  });

  const create = useMutation({
    mutationFn: () => api.createDeployToken(token!, 'console'),
    onSuccess: (res) => {
      setCreated(res.token);
      qc.invalidateQueries({ queryKey: ['deploy-tokens'] });
    },
  });

  const apiHost =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:21114`
      : 'http://SERVER:21114';

  return (
    <div>
      <PageHeader
        title="Deploy"
        description="Enrollment unattended dos agentes UnyDesk."
        crumbs={[{ label: 'Administração' }, { label: 'Deploy' }]}
        actions={
          user?.is_admin ? (
            <button
              type="button"
              className="btn btn-primario"
              onClick={() => create.mutate()}
              disabled={create.isPending}
            >
              Gerar token de deploy
            </button>
          ) : null
        }
      />

      {created ? (
        <div className="painel" style={{ marginBottom: 16 }}>
          <div className="painel-cabecalho">
            <h2>Novo token</h2>
            <span className="selo selo-ok">Pronto</span>
          </div>
          <div className="painel-corpo">
            <p style={{ marginTop: 0 }}>
              Guarde agora — use no agente:
            </p>
            <code className="bloco">{created}</code>
            <pre>{`unydesk --deploy --token ${created}
# configure api-server / custom-rendezvous-server:
# ${apiHost}`}</pre>
          </div>
        </div>
      ) : null}

      <div className="painel" style={{ marginBottom: 16 }}>
        <div className="painel-cabecalho">
          <h2>Instruções</h2>
        </div>
        <div className="painel-corpo">
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            <li>
              Configure o cliente com <code className="mono">api-server={apiHost}</code>{' '}
              e o host do hbbs (porta 21116) + chave pública do relay.
            </li>
            <li>
              Gere um deploy token e execute{' '}
              <code className="mono">rustdesk --deploy --token &lt;TOKEN&gt;</code>{' '}
              no endpoint.
            </li>
            <li>
              O dispositivo aparece em Dispositivos após o primeiro
              heartbeat/sysinfo (&lt;15s).
            </li>
          </ol>
        </div>
      </div>

      <div className="painel">
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Label</th>
              <th>Criado</th>
              <th>Revogado</th>
            </tr>
          </thead>
          <tbody>
            {(list.data?.data || []).map((t) => (
              <tr key={t.token}>
                <td>
                  <code className="mono">
                    {t.token.slice(0, 8)}…{t.token.slice(-6)}
                  </code>
                </td>
                <td>{t.label || '—'}</td>
                <td>{new Date(t.created_at).toLocaleString()}</td>
                <td>
                  <span
                    className={
                      t.revoked ? 'selo selo-perigo' : 'selo selo-ok'
                    }
                  >
                    {t.revoked ? 'sim' : 'não'}
                  </span>
                </td>
              </tr>
            ))}
            {!list.data?.data?.length ? (
              <tr>
                <td colSpan={4} className="tabela-vazia">
                  Nenhum token ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
