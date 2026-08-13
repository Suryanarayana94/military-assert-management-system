import { NavLink, Outlet } from 'react-router-dom';
import { ArrowLeftRight, ClipboardCheck, LayoutDashboard, LogOut, PackagePlus, ScrollText, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
  { to: '/purchases', label: 'Purchases', icon: PackagePlus, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
  { to: '/transfers', label: 'Transfers', icon: Truck, roles: ['ADMIN', 'LOGISTICS_OFFICER'] },
  { to: '/operations', label: 'Assignments & expenditure', icon: ClipboardCheck, roles: ['ADMIN', 'BASE_COMMANDER'] },
  { to: '/audit', label: 'Audit trail', icon: ScrollText, roles: ['ADMIN'] }
];

export default function Shell() {
  const { user, logout } = useAuth();
  const accessible = nav.filter((item) => item.roles.includes(user.role));
  return <div className="app-shell min-h-screen">
    <aside className="sidebar">
      <div className="brand"><span>S</span><div>Sentinel<small>ASSET COMMAND</small></div></div>
      <div className="command-card"><small>ACTIVE COMMAND</small><b>Joint Operations Command</b><span>{user.base?.name || 'Global asset visibility'}</span></div>
      <nav>{accessible.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon size={18} />{label}</NavLink>)}</nav>
      <div className="sidebar-footer">
        <div className="secure"><ShieldCheck size={19} /><span>SECURE SESSION<small>{api.isDemo ? 'Demo data mode' : 'Live API connected'}</small></span></div>
        <div className="profile"><span className="avatar">{user.username.slice(0, 2).toUpperCase()}</span><span><b>{user.username}</b><small>{user.role.replaceAll('_', ' ')}</small></span><button title="Sign out" onClick={logout}><LogOut size={16} /></button></div>
      </div>
    </aside>
    <main className="workspace"><Outlet /></main>
  </div>;
}
