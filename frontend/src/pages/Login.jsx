import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const accounts = [
  ['Administrator', 'admin_user', 'AdminPass123!'],
  ['Base Commander', 'commander_alpha', 'CommandPass123!'],
  ['Logistics Officer', 'logistics_officer', 'LogisticsPass123!']
];

export default function Login() {
  const { user, login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [form, setForm] = useState({ username: 'admin_user', password: 'AdminPass123!' }); const [error, setError] = useState(''); const [working, setWorking] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (event) => { event.preventDefault(); setWorking(true); setError(''); try { await login(form); navigate(location.state?.from?.pathname || '/', { replace: true }); } catch (failure) { setError(failure.message); } finally { setWorking(false); } };
  return <main className="login-page min-h-screen"><section className="login-panel"><div className="login-brand"><span>S</span><div>Sentinel<small>ASSET COMMAND</small></div></div><p className="eyebrow">RESTRICTED OPERATIONS PLATFORM</p><h1>Sign in to your command workspace.</h1><p className="muted">Role access controls inventory visibility and available operations.</p>
    {api.isDemo && <div className="demo-notice"><ShieldCheck size={17} /><span>Demo mode is active. Deploy the API and set <code>VITE_API_BASE_URL</code> to connect PostgreSQL.</span></div>}
    <form onSubmit={submit} className="login-form"><label>Username<input autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></label><label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button full" disabled={working}>{working ? 'Signing in…' : <><LockKeyhole size={16} />Sign in securely</>}</button></form>
    <div className="sample-logins"><b>Sample access</b>{accounts.map(([role, username, password]) => <button type="button" key={username} onClick={() => setForm({ username, password })}><span>{role}</span><small>{username}</small></button>)}</div>
  </section><aside className="login-aside"><ShieldCheck size={42} /><h2>Accountability at every movement.</h2><p>Secure asset visibility, atomic transfers, and an immutable audit trail across every base.</p></aside></main>;
}
