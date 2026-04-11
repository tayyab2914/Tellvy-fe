import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Wand2, Users } from 'lucide-react';

export default function RepDashboard() {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/rep/clients').then(r => setClients(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6" data-testid="rep-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">My Clients</h1>
          <p className="text-sm text-zinc-500 mt-1">Clients you've onboarded via white-glove setup</p>
        </div>
        <Button
          onClick={() => navigate('/rep/wizard')}
          className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white"
          data-testid="start-wizard-button"
        >
          <Wand2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Start Setup Wizard
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
            <Button onClick={() => navigate('/rep/wizard')} className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="empty-start-wizard">
              <Wand2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Start Setup Wizard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => (
            <Card key={c.id} className="rounded-sm border-zinc-200 shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200" data-testid={`rep-client-card-${c.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
                  </div>
                  <code className="text-xs bg-zinc-100 px-2 py-1 rounded-sm font-mono text-zinc-600">{c.standee_id}</code>
                </div>
                <h3 className="font-heading text-lg font-medium text-[#09090B] mb-1">{c.business_name}</h3>
                <p className="text-sm text-zinc-500">{c.category} &middot; {c.city || 'No city'}</p>
                <p className="text-xs text-zinc-400 mt-2">{c.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
