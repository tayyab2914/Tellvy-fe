import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Globe, Trash2, UserCog, Crown, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRegions() {
  const [regions, setRegions] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchRegions = () => api.get('/admin/regions').then(r => setRegions(r.data)).catch(() => {});
  useEffect(() => { fetchRegions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post('/admin/regions', { name: name.trim() });
      toast.success(`Region '${name.trim()}' created`);
      setOpen(false);
      setName('');
      fetchRegions();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create region');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (regionName) => {
    if (!window.confirm(`Delete region '${regionName}'?`)) return;
    try {
      await api.delete(`/admin/regions/${regionName}`);
      toast.success('Region deleted');
      fetchRegions();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-6 space-y-6" data-testid="admin-regions-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Regions</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage global territories</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="create-region-button">
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} /> New Region
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-sm max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-medium tracking-tight">Create Region</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Poland, UAE, Germany" required className="rounded-sm" data-testid="region-name-input" />
              </div>
              <Button type="submit" disabled={creating} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="submit-create-region">
                {creating ? 'Creating...' : 'Create Region'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200">
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Regional Managers</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Sales Agents</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Clients</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-zinc-500">No regions yet</TableCell></TableRow>
              ) : regions.map(r => (
                <TableRow key={r.id} className="border-zinc-100" data-testid={`region-row-${r.name}`}>
                  <TableCell className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-[#002FA7]/10 flex items-center justify-center"><Globe className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} /></div>
                    <span className="text-sm font-medium text-[#09090B]">{r.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-violet-500" strokeWidth={1.5} />
                      <span className="text-sm text-zinc-600">{r.rm_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <UserCog className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                      <span className="text-sm text-zinc-600">{r.agent_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                      <span className="text-sm text-zinc-600">{r.client_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.name)} className="rounded-sm text-zinc-400 hover:text-red-600" data-testid={`delete-region-${r.name}`}>
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
