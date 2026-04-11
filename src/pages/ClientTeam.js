import React, { useState, useEffect, useRef } from 'react';
import { api, fileUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientTeam() {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role_title: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const fetchMembers = () => api.get('/client/team').then(r => setMembers(r.data)).catch(() => {});
  useEffect(() => { fetchMembers(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Select a photo'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.upload(`/client/team?name=${encodeURIComponent(form.name)}&role_title=${encodeURIComponent(form.role_title)}`, formData);
      toast.success('Team member added');
      setOpen(false);
      setForm({ name: '', role_title: '' });
      setFile(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="client-team-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Team Members</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your team for NFC selection portal</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="add-team-member-button">
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-sm max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-medium tracking-tight">Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="rounded-sm" data-testid="team-member-name-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Role / Title</Label>
                <Input value={form.role_title} onChange={e => setForm({...form, role_title: e.target.value})} placeholder="e.g., Doctor, Manager" className="rounded-sm" data-testid="team-member-role-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Photo</Label>
                <Input ref={fileRef} type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required className="rounded-sm" data-testid="team-member-photo-input" />
              </div>
              <Button type="submit" disabled={uploading} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="submit-add-member">
                {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" strokeWidth={1.5} /> Upload & Add</>}
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
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Photo</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Role</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-zinc-500">No team members yet</TableCell></TableRow>
              ) : members.map(m => (
                <TableRow key={m.id} className="border-zinc-100" data-testid={`team-member-row-${m.id}`}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 overflow-hidden">
                      {m.photo_path ? (
                        <img src={fileUrl(m.photo_path)} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-medium text-[#002FA7]">
                          {m.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#09090B]">{m.name}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{m.role_title || '-'}</TableCell>
                  <TableCell className="text-sm text-zinc-500">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
