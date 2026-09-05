import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../auth';
import { PageHeader } from '../components/ui/PageHeader';

export default function UsersPage() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users(token!),
    enabled: !!token,
  });
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: () =>
      api.createUser(token!, {
        name,
        password,
        email: email || undefined,
      }),
    onSuccess: () => {
      setName('');
      setPassword('');
      setEmail('');
      setError('');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ guid, enable }: { guid: string; enable: boolean }) =>
      enable
        ? api.enableUser(token!, guid)
        : api.disableUser(token!, guid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Contas do painel e do login no cliente UnyDesk."
        crumbs={[{ label: 'Administração' }, { label: 'Usuários' }]}
      />

      {user?.is_admin ? (
        <div className="painel" style={{ marginBottom: 16 }}>
          <div className="painel-cabecalho">
            <h2>Novo usuário</h2>
          </div>
          <form className="form-row-uny" onSubmit={onSubmit}>
            <label className="campo">
              Usuário
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="campo">
              Senha
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <label className="campo">
              E-mail
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="opcional"
              />
            </label>
            <button
              type="submit"
              className="btn btn-primario"
              disabled={create.isPending}
            >
              Adicionar
            </button>
          </form>
          {error ? (
            <div className="alerta alerta-erro" style={{ margin: '0 18px 16px' }}>
              {error}
            </div>
          ) : null}
        </div>
      ) : (
        <p style={{ color: 'var(--texto-muted)' }}>
          Apenas administradores podem criar usuários.
        </p>
      )}

      <div className="painel">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(q.data?.data || []).map((u) => (
              <tr key={u.guid}>
                <td className="produto-nome">{u.name}</td>
                <td>{u.email || '—'}</td>
                <td>
                  <span className={u.is_admin ? 'selo selo-info' : 'selo selo-neutro'}>
                    {u.is_admin ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      u.status === 0 ? 'selo selo-atencao' : 'selo selo-ok'
                    }
                  >
                    {u.status === 0 ? 'Desativado' : 'Ativo'}
                  </span>
                </td>
                <td>
                  {user?.is_admin && u.guid !== user.guid ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        toggle.mutate({
                          guid: u.guid,
                          enable: u.status === 0,
                        })
                      }
                    >
                      {u.status === 0 ? 'Ativar' : 'Desativar'}
                    </button>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
