import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, UserCog, Users, MousePointerClick, Activity, Globe, Crown } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/admin/audit-logs').then(r => setRecentLogs(r.data.slice(0, 8))).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Regions', value: stats.total_regions, icon: Globe, color: 'text-[#002FA7]' },
    { label: 'Sales Agents', value: stats.total_agents, icon: UserCog, color: 'text-amber-600' },
    { label: 'Regional Mgrs', value: stats.total_rms, icon: Crown, color: 'text-violet-600' },
    { label: 'Total Clients', value: stats.total_clients, icon: Building2, color: 'text-emerald-600' },
    { label: 'Active Clients', value: stats.active_clients, icon: Activity, color: 'text-teal-600' },
    { label: 'Team Members', value: stats.total_members, icon: Users, color: 'text-rose-600' },
  ] : [];

  return (
    <div className="p-6 space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Global Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Full platform oversight across all regions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-sm border-zinc-200 shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">{label}</span>
                <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.5} />
              </div>
              <p className="font-heading text-2xl font-medium text-[#09090B]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regions overview */}
      {stats?.regions?.length > 0 && (
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg font-medium tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} /> Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.regions.map(r => (
                <span key={r} className="px-3 py-1.5 bg-[#002FA7]/5 text-[#002FA7] text-sm rounded-sm border border-[#002FA7]/10">{r}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg font-medium tracking-tight">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-zinc-500">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-zinc-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-[#002FA7] mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#09090B]">{log.details}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{new Date(log.timestamp).toLocaleString()} &middot; {log.user_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
