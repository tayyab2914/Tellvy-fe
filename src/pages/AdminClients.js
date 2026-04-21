import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Link2, Power, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const CATEGORIES = ['Medical', 'Dental', 'Legal', 'Restaurant', 'Salon', 'General'];

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [regions, setRegions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({ business_name: '', email: '', password: '', contact_name: '', category: 'General', city: '', region: '', redirect_url: '' });
  const [editForm, setEditForm] = useState({ business_name: '', category: 'General', city: '', region: '', redirect_url: '' });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchClients = () => api.get('/admin/clients').then(r => setClients(r.data)).catch(() => {});
  const fetchRegions = () => api.get('/admin/regions').then(r => setRegions(r.data)).catch(() => {});

  useEffect(() => { 
    fetchClients();
    fetchRegions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/clients', form);
      toast.success('Client created successfully');
      setOpen(false);
      setForm({ business_name: '', email: '', password: '', contact_name: '', category: 'General', city: '', region: '', redirect_url: '' });
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  const deleteClient = async (clientId, businessName) => {
    try {
      await api.delete(`/admin/clients/${clientId}`);
      toast.success(`Client '${businessName}' deleted`);
      fetchClients();
    } catch {
      toast.error('Failed to delete client');
    }
  };

  const toggleKillSwitch = async (clientId) => {
    try {
      const { data } = await api.put(`/admin/clients/${clientId}/kill-switch`);
      toast.success(`Client ${data.is_active ? 'activated' : 'deactivated'}`);
      fetchClients();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const openEditDialog = (client) => {
    setEditingClient(client);
    setEditForm({
      business_name: client.business_name,
      category: client.category,
      city: client.city || '',
      region: client.region || '',
      redirect_url: client.redirect_url || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingClient) return;
    setUpdating(true);
    try {
      await api.put(`/admin/clients/${editingClient.id}`, editForm);
      toast.success('Client updated successfully');
      setEditOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update client');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="admin-clients-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Clients</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage business clients and NFC configurations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="create-client-button">
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} /> New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-sm max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-medium tracking-tight">Create New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Business Name</Label>
                  <Input value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} required className="rounded-sm" data-testid="client-business-name-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Contact Name</Label>
                  <Input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} required className="rounded-sm" data-testid="client-contact-name-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="rounded-sm" data-testid="client-email-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="rounded-sm" data-testid="client-password-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger className="rounded-sm" data-testid="client-category-select"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">City</Label>
                  <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="rounded-sm" data-testid="client-city-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</Label>
                <Select value={form.region} onValueChange={v => setForm({...form, region: v})}>
                  <SelectTrigger className="rounded-sm" data-testid="client-region-select">
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Redirect URL</Label>
                <Input value={form.redirect_url} onChange={e => setForm({...form, redirect_url: e.target.value})} placeholder="https://maps.google.com/..." className="rounded-sm" data-testid="client-redirect-url-input" />
              </div>
              <Button type="submit" disabled={creating} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="submit-create-client">
                {creating ? 'Creating...' : 'Create Client'}
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
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Business</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Standee ID</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">City</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Kill Switch</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-sm text-zinc-500">No clients yet</TableCell></TableRow>
              ) : clients.map(c => (
                <TableRow key={c.id} className="border-zinc-100" data-testid={`client-row-${c.id}`}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-[#09090B]">{c.business_name}</p>
                      <p className="text-xs text-zinc-400">{c.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-zinc-100 px-2 py-1 rounded-sm font-mono">{c.standee_id}</code>
                  </TableCell>
                  <TableCell><span className="text-sm text-zinc-600">{c.category}</span></TableCell>
                  <TableCell><span className="text-sm text-zinc-600">{c.city || '-'}</span></TableCell>
                  <TableCell><span className="text-sm text-zinc-600">{c.region || '-'}</span></TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'default' : 'destructive'} className={`rounded-sm text-xs ${c.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                      {c.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKillSwitch(c.id)}
                      className={`rounded-sm ${c.is_active ? 'text-zinc-500 hover:text-red-600' : 'text-red-600 hover:text-emerald-600'}`}
                      data-testid={`kill-switch-${c.id}`}
                    >
                      <Power className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(c)}
                      className="rounded-sm text-zinc-400 hover:text-blue-600"
                      data-testid={`edit-client-${c.id}`}
                    >
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-sm text-zinc-400 hover:text-red-600" data-testid={`delete-client-${c.id}`}>
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-heading font-medium tracking-tight">Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-medium text-[#09090B]">{c.business_name}</span>? This will permanently remove the client, their account, and all team members. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-sm bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => deleteClient(c.id, c.business_name)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-sm max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-medium tracking-tight">Edit Client</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Business Name</Label>
                <Input value={editForm.business_name} onChange={e => setEditForm({...editForm, business_name: e.target.value})} required className="rounded-sm" data-testid="edit-client-business-name-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Category</Label>
                  <Select value={editForm.category} onValueChange={v => setEditForm({...editForm, category: v})}>
                    <SelectTrigger className="rounded-sm" data-testid="edit-client-category-select"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">City</Label>
                  <Input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="rounded-sm" data-testid="edit-client-city-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Region</Label>
                <Select value={editForm.region} onValueChange={v => setEditForm({...editForm, region: v})}>
                  <SelectTrigger className="rounded-sm" data-testid="edit-client-region-select">
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Redirect URL</Label>
                <Input value={editForm.redirect_url} onChange={e => setEditForm({...editForm, redirect_url: e.target.value})} placeholder="https://maps.google.com/..." className="rounded-sm" data-testid="edit-client-redirect-url-input" />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="rounded-sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="submit-edit-client">
                  {updating ? 'Updating...' : 'Update Client'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
