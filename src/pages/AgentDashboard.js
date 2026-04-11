import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Wand2, Users, Link2, Trophy } from 'lucide-react';

export default function AgentDashboard() {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/agent/clients').then(r => setClients(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6" data-testid="agent-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">My Clients</h1>
          <p className="text-sm text-zinc-500 mt-1">Clients you've onboarded. Click to edit details.</p>
        </div>
        <Button onClick={() => navigate('/agent/wizard')} className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="add-new-client-button">
          <Wand2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Add New Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-sm bg-[#002FA7]/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#002FA7]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#09090B]">No clients yet</p>
              <p className="text-sm text-zinc-500 mt-1">Use the Setup Wizard to onboard your first client</p>
            </div>
            <Button onClick={() => navigate('/agent/wizard')} className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="empty-add-client">
              <Wand2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Add New Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => (
            <Link key={c.id} to={`/agent/clients/${c.id}`} className="block group" data-testid={`agent-client-card-${c.id}`}>
              <Card className="rounded-sm border-zinc-200 shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.is_active ? 'default' : 'destructive'} className={`rounded-sm text-[10px] ${c.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                        {c.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-medium text-[#09090B] group-hover:text-[#002FA7] transition-colors mb-1">{c.business_name}</h3>
                  <p className="text-sm text-zinc-500">{c.category} &middot; {c.city || 'No city'}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Link2 className="w-3 h-3" strokeWidth={1.5} />
                      <code className="font-mono">{c.standee_id}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
