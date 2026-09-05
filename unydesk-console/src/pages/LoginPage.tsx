import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import { useAuth } from '../auth';

export default function LoginPage() {
  const { token, login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/devices" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="marca">
          <div className="marca-icone" aria-hidden>
            <Monitor size={17} strokeWidth={2.25} />
          </div>
          <div>
            <div className="marca-texto">UnyDesk</div>
            <div className="sidebar-perfil-cargo">Console Unysystems</div>
          </div>
        </div>
        <label className="campo">
          Usuário
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
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
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <div className="alerta alerta-erro">{error}</div> : null}
        <button type="submit" className="btn btn-primario" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
