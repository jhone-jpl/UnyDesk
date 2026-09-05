type LockScreenProps = {
  userName: string;
  userInitials: string;
  onUnlock: () => void;
};

export function LockScreen({
  userName,
  userInitials,
  onUnlock,
}: LockScreenProps) {
  return (
    <div className="lock-screen" role="dialog" aria-modal="true">
      <div className="lock-card">
        <div className="avatar avatar-lg">{userInitials}</div>
        <h2>{userName}</h2>
        <p>Sessão bloqueada</p>
        <button type="button" className="btn btn-primario" onClick={onUnlock}>
          Desbloquear
        </button>
      </div>
    </div>
  );
}
