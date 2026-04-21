import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, UserCog, Link2, ScrollText, LogOut, Building2, Wand2, Globe, MapPin, Trophy
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/clients', icon: Building2, label: 'Clients' },
  { to: '/admin/staff', icon: UserCog, label: 'Staff' },
  { to: '/admin/regions', icon: Globe, label: 'Regions' },
  { to: '/admin/redirects', icon: Link2, label: 'Redirects' },
  { to: '/admin/audit-log', icon: ScrollText, label: 'Audit Log' },
];

const regionalLinks = [
  { to: '/regional', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/regional/agents', icon: UserCog, label: 'Sales Agents' },
  { to: '/regional/clients', icon: Building2, label: 'Clients' },
];

const agentLinks = [
  { to: '/agent', icon: LayoutDashboard, label: 'My Clients', end: true },
  { to: '/agent/wizard', icon: Wand2, label: 'Setup Wizard' },
];

const clientLinks = [
  { to: '/client', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/client/team', icon: Users, label: 'Team' },
  { to: '/client/reviews', icon: ScrollText, label: 'Reviews' },
];

export default function Sidebar({ role, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const links = role === 'super_admin' ? adminLinks
    : role === 'regional_manager' ? regionalLinks
    : role === 'sales_agent' ? agentLinks
    : clientLinks;

  const roleLabel = role === 'super_admin' ? 'Super Admin'
    : role === 'regional_manager' ? 'Regional Manager'
    : role === 'sales_agent' ? 'Sales Agent'
    : 'Client';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-zinc-200 flex flex-col sm:w-56 max-w-xs" data-testid="sidebar">
      <div className="p-5 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <img src="https://static.prod-images.emergentagent.com/jobs/d2ed1487-14a4-4fc1-8e2b-3d8f6aaf654d/images/a3e0b2130b485bc9bbe242cae0bab2b7c522b549d1955c31a2b1627d78900940.png" alt="Tellvy" className="w-7 h-7" />
          <span className="font-heading text-lg font-medium tracking-tight text-[#09090B]">Tellvy</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${isActive ? 'bg-[#002FA7] text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-[#09090B]'}`
            }
            data-testid={`sidebar-link-${label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-200">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-[#09090B] truncate">{user?.name}</p>
          <p className="text-xs text-zinc-400 truncate">{roleLabel}{user?.region ? ` \u00b7 ${user.region}` : ''}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-sm text-zinc-600 hover:bg-zinc-100 hover:text-[#09090B] transition-colors" data-testid="sidebar-logout-button">
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
