import { Credentials } from '../api/types';

export default function CredentialsModal({
  credentials,
  onClose,
}: {
  credentials: Credentials;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="card w-full max-w-sm space-y-3">
        <h2 className="text-lg font-semibold text-white">Account created</h2>
        <p className="text-sm text-slate-400">
          Share these credentials with the account holder through a secure channel. They will be
          asked to set a permanent password on first login.
        </p>
        <div className="bg-slate-800 rounded-lg p-3 space-y-1 font-mono text-sm">
          <div>
            <span className="text-slate-500">Access code: </span>
            {credentials.accessCode}
          </div>
          <div>
            <span className="text-slate-500">Temp password: </span>
            {credentials.tempPassword}
          </div>
        </div>
        <button className="btn-primary w-full" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
