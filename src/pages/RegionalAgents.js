import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCog, Building2 } from 'lucide-react';

export default function RegionalAgents() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.get('/regional/agents').then(r => setAgents(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6" data-testid="regional-agents-page">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Sales Agents</h1>
        <p className="text-sm text-zinc-500 mt-1">All agents in your region and their performance</p>
      </div>

      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200">
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Agent</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Clients Onboarded</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-zinc-500">No agents in your region</TableCell></TableRow>
              ) : agents.map(a => (
                <TableRow key={a.id} className="border-zinc-100" data-testid={`regional-agent-row-${a.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-amber-100 flex items-center justify-center"><UserCog className="w-4 h-4 text-amber-600" strokeWidth={1.5} /></div>
                      <span className="text-sm font-medium text-[#09090B]">{a.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">{a.email}</TableCell>
                  <TableCell><Badge className="rounded-sm bg-[#002FA7]/10 text-[#002FA7] text-xs hover:bg-[#002FA7]/10">{a.region}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-[#09090B]">{a.client_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
