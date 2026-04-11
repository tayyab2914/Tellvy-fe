import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, UserCog, Users, MousePointerClick, Activity, MapPin } from 'lucide-react';

export default function RegionalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.get('/regional/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/regional/agents').then(r => setAgents(r.data)).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Sales Agents', value: stats.total_agents, icon: UserCog, color: 'text-amber-600' },
    { label: 'Total Clients', value: stats.total_clients, icon: Building2, color: 'text-[#002FA7]' },
    { label: 'Active Clients', value: stats.active_clients, icon: Activity, color: 'text-emerald-600' },
    { label: 'Team Members', value: stats.total_members, icon: Users, color: 'text-violet-600' },
    { label: 'Total Intents', value: stats.total_intents, icon: MousePointerClick, color: 'text-rose-600' },
  ] : [];

  return (
    <div className="p-6 space-y-6" data-testid="regional-dashboard">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#002FA7]">{stats?.region || user?.region || 'Region'}</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Regional Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Territory overview for your assigned region</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Agent Leaderboard */}
      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg font-medium tracking-tight">Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <p className="text-sm text-zinc-500">No agents in your region</p>
          ) : (
            <div className="space-y-3">
              {agents.sort((a, b) => (b.client_count || 0) - (a.client_count || 0)).map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-4 p-3 bg-zinc-50 border border-zinc-100 rounded-sm" data-testid={`regional-agent-${agent.id}`}>
                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-100 text-zinc-500'}`}>
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-sm bg-amber-100 flex items-center justify-center">
                    <UserCog className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#09090B]">{agent.name}</p>
                    <p className="text-xs text-zinc-400">{agent.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-[#09090B]">{agent.client_count || 0}</p>
                    <p className="text-xs text-zinc-400">clients</p>
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
