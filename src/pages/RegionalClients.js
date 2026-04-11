import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, UserCog, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fileUrl } from '@/lib/api';

export default function RegionalClients() {
  const [clients, setClients] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    api.get('/regional/clients').then(r => setClients(r.data)).catch(() => {});
  }, []);

  const viewLeaderboard = async (client) => {
    setSelectedClient(client);
    try {
      const { data } = await api.get(`/regional/leaderboard/${client.id}`);
      setLeaderboard(data);
    } catch {
      setLeaderboard([]);
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="regional-clients-page">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Clients</h1>
        <p className="text-sm text-zinc-500 mt-1">All clients onboarded by agents in your region</p>
      </div>

      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200">
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Business</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">City</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Agent</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Standee</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400 text-right">Leaderboard</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-sm text-zinc-500">No clients in your region</TableCell></TableRow>
              ) : clients.map(c => (
                <TableRow key={c.id} className="border-zinc-100" data-testid={`regional-client-row-${c.id}`}>
                  <TableCell>
                    <p className="text-sm font-medium text-[#09090B]">{c.business_name}</p>
                    <p className="text-xs text-zinc-400">{c.email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">{c.category}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{c.city || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <UserCog className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                      <span className="text-sm text-zinc-600">{c.agent_name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs bg-zinc-100 px-2 py-1 rounded-sm font-mono">{c.standee_id}</code></TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'default' : 'destructive'} className={`rounded-sm text-xs ${c.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                      {c.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => viewLeaderboard(c)} className="rounded-sm text-[#002FA7] hover:bg-[#002FA7]/5" data-testid={`view-leaderboard-${c.id}`}>
                      <Trophy className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leaderboard Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="rounded-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-medium tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
              {selectedClient?.business_name} Leaderboard
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4">No team members</p>
            ) : leaderboard.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-sm">
                <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'}`}>{i + 1}</div>
                <div className="w-8 h-8 rounded-sm bg-[#002FA7]/10 overflow-hidden flex items-center justify-center text-sm font-medium text-[#002FA7]">
                  {m.photo_path ? <img src={fileUrl(m.photo_path)} alt={m.name} className="w-full h-full object-cover" /> : m.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#09090B]">{m.name}</p>
                  <p className="text-xs text-zinc-400">{m.role_title}</p>
                </div>
                <span className="text-sm font-medium text-[#09090B]">{m.intent_count} <span className="text-xs text-zinc-400">sel.</span></span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
