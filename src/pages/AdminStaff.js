import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCog, Trash2, Crown, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [regions, setRegions] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales_agent', region: '' });
  const [creating, setCreating] = useState(false);

  const fetchStaff = () => api.get('/admin/staff').then(r => setStaff(r.data)).catch(() => {});
  const fetchRegions = () => api.get('/admin/regions').then(r => setRegions(r.data)).catch(() => {});

  useEffect(() => { fetchStaff(); fetchRegions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.region) { toast.error('Please select a region'); return; }
    setCreating(true);
    try {
      await api.post('/admin/staff', form);
      const label = form.role === 'sales_agent' ? 'Sales Agent' : 'Regional Manager';
      toast.success(`${label} created`);
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'sales_agent', region: '' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      toast.success('Staff member deleted');
      fetchStaff();
    } catch { toast.error('Failed to delete'); }
  };

  const agents = staff.filter(s => s.role === 'sales_agent');
  const managers = staff.filter(s => s.role === 'regional_manager');

  return (
    <div className="p-6 space-y-6" data-testid="admin-staff-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Staff Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage Sales Agents and Regional Managers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="create-staff-button">
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-sm max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-medium tracking-tight">Add Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Role</Label>
                <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                  <SelectTrigger className="rounded-sm" data-testid="staff-role-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_agent">Sales Agent</SelectItem>
                    <SelectItem value="regional_manager">Regional Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="rounded-sm" data-testid="staff-name-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="rounded-sm" data-testid="staff-email-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="rounded-sm" data-testid="staff-password-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</Label>
                <Select value={form.region} onValueChange={v => setForm({...form, region: v})}>
                  <SelectTrigger className="rounded-sm" data-testid="staff-region-select"><SelectValue placeholder="Select region" /></SelectTrigger>
                  <SelectContent>
                    {regions.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={creating} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="submit-create-staff">
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Regional Managers */}
      <div>
        <h2 className="font-heading text-lg font-medium text-[#09090B] mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-violet-600" strokeWidth={1.5} /> Regional Managers ({managers.length})
        </h2>
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200">
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-sm text-zinc-500">No regional managers</TableCell></TableRow>
                ) : managers.map(s => (
                  <TableRow key={s.id} className="border-zinc-100" data-testid={`rm-row-${s.id}`}>
                    <TableCell className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-violet-100 flex items-center justify-center"><Crown className="w-4 h-4 text-violet-600" strokeWidth={1.5} /></div>
                      <span className="text-sm font-medium text-[#09090B]">{s.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">{s.email}</TableCell>
                    <TableCell><Badge className="rounded-sm bg-[#002FA7]/10 text-[#002FA7] text-xs hover:bg-[#002FA7]/10">{s.region || 'Unassigned'}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="rounded-sm text-zinc-400 hover:text-red-600" data-testid={`delete-rm-${s.id}`}>
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

      {/* Sales Agents */}
      <div>
        <h2 className="font-heading text-lg font-medium text-[#09090B] mb-3 flex items-center gap-2">
          <UserCog className="w-4 h-4 text-amber-600" strokeWidth={1.5} /> Sales Agents ({agents.length})
        </h2>
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200">
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Clients</TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-sm text-zinc-500">No sales agents</TableCell></TableRow>
                ) : agents.map(s => (
                  <TableRow key={s.id} className="border-zinc-100" data-testid={`agent-row-${s.id}`}>
                    <TableCell className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-amber-100 flex items-center justify-center"><UserCog className="w-4 h-4 text-amber-600" strokeWidth={1.5} /></div>
                      <span className="text-sm font-medium text-[#09090B]">{s.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">{s.email}</TableCell>
                    <TableCell><Badge className="rounded-sm bg-[#002FA7]/10 text-[#002FA7] text-xs hover:bg-[#002FA7]/10">{s.region || 'Unassigned'}</Badge></TableCell>
                    <TableCell className="text-sm text-zinc-600">{s.client_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="rounded-sm text-zinc-400 hover:text-red-600" data-testid={`delete-agent-${s.id}`}>
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
    </div>
  );
}
