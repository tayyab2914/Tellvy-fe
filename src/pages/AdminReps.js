import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, UserCog, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReps() {
  const [reps, setReps] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  const fetchReps = () => api.get('/admin/reps').then(r => setReps(r.data)).catch(() => {});
  useEffect(() => { fetchReps(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/reps', form);
      toast.success('Account Rep created');
      setOpen(false);
      setForm({ name: '', email: '', password: '' });
      fetchReps();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create rep');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (repId) => {
    if (!window.confirm('Delete this account rep?')) return;
    try {
      await api.delete(`/admin/reps/${repId}`);
      toast.success('Account Rep deleted');
      fetchReps();
    } catch {
      toast.error('Failed to delete rep');
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="admin-reps-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Account Reps</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage white-glove onboarding representatives</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="create-rep-button">
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} /> New Rep
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-sm max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-medium tracking-tight">Create Account Rep</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="rounded-sm" data-testid="rep-name-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="rounded-sm" data-testid="rep-email-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="rounded-sm" data-testid="rep-password-input" />
              </div>
              <Button type="submit" disabled={creating} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="submit-create-rep">
                {creating ? 'Creating...' : 'Create Rep'}
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
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Created</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reps.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-zinc-500">No account reps yet</TableCell></TableRow>
              ) : reps.map(r => (
                <TableRow key={r.id} className="border-zinc-100" data-testid={`rep-row-${r.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#002FA7]/10 flex items-center justify-center">
                        <UserCog className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-[#09090B]">{r.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">{r.email}</TableCell>
                  <TableCell className="text-sm text-zinc-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="rounded-sm text-zinc-400 hover:text-red-600" data-testid={`delete-rep-${r.id}`}>
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
