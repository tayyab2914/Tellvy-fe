import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, fileUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Link2, Users, Trophy, Upload, Pencil, Trash2, Loader2, Save, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', role_title: '' });
  const [staffFile, setStaffFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const fileRef = useRef();

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/agent/clients/${clientId}`);
      setClientData(data.client);
      setMembers(data.members);
      setRedirectUrl(data.client.redirect_url || '');
    } catch { navigate('/agent'); }
    try {
      const { data } = await api.get(`/agent/clients/${clientId}/leaderboard`);
      setLeaderboard(data);
    } catch {}
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [clientId]);

  const handleSaveRedirect = async () => {
    setSaving(true);
    try {
      await api.put(`/agent/clients/${clientId}/redirect`, { redirect_url: redirectUrl });
      toast.success('Redirect URL updated');
      setClientData({ ...clientData, redirect_url: redirectUrl });
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleUploadStaff = async (e) => {
    e.preventDefault();
    if (!staffFile) { toast.error('Select a photo'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', staffFile);
      await api.upload(`/agent/clients/${clientId}/team?name=${encodeURIComponent(staffForm.name)}&role_title=${encodeURIComponent(staffForm.role_title)}`, formData);
      toast.success(`${staffForm.name} added`);
      setAddOpen(false);
      setStaffForm({ name: '', role_title: '' });
      setStaffFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); }
  };

  // Replace an existing staff member's photo (e.g. a wrong image was uploaded).
  const handleChangePhoto = async (memberId, photoFile, e) => {
    if (!photoFile) return;
    setChangingId(memberId);
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      await api.upload(`/agent/clients/${clientId}/team/${memberId}/photo`, formData);
      toast.success('Photo updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update photo');
    } finally {
      setChangingId(null);
      if (e?.target) e.target.value = '';
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName}?`)) return;
    try {
      await api.delete(`/agent/clients/${clientId}/team/${memberId}`);
      toast.success(`${memberName} removed`);
      fetchData();
    } catch { toast.error('Failed to remove'); }
  };

  if (!clientData) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#002FA7]" /></div>;

  return (
    <div className="p-6 space-y-6" data-testid="agent-client-detail">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/agent')} className="rounded-sm" data-testid="back-to-clients">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl tracking-tight font-medium text-[#09090B]">{clientData.business_name}</h1>
          <p className="text-sm text-zinc-500">{clientData.category} &middot; {clientData.city || 'No city'} &middot; Standee: <code className="bg-zinc-100 px-1.5 py-0.5 rounded-sm font-mono text-xs">{clientData.standee_id}</code></p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-sm border-[#002FA7]/20 text-[#002FA7] hover:bg-[#002FA7]/5"
          data-testid="open-client-portal"
        >
          <a href={`/portal/${clientId}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> View Portal
          </a>
        </Button>
      </div>

      {/* Redirect URL Editor */}
      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Google / 2GIS Redirect URL</span>
          </div>
          <div className="flex gap-3">
            <Input value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} placeholder="https://maps.google.com/..." className="rounded-sm flex-1" data-testid="edit-redirect-url" />
            <Button onClick={handleSaveRedirect} disabled={saving} className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="save-redirect-button">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Save</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg font-medium tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} /> Staff Photos ({members.length})
          </CardTitle>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="add-staff-button">
                <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl font-medium tracking-tight">Add Staff Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUploadStaff} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Name</Label>
                    <Input value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} required className="rounded-sm" data-testid="staff-name-input" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Role / Title</Label>
                    <Input value={staffForm.role_title} onChange={e => setStaffForm({...staffForm, role_title: e.target.value})} className="rounded-sm" data-testid="staff-role-input" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Photo</Label>
                  <Input ref={fileRef} type="file" accept="image/*" onChange={e => setStaffFile(e.target.files[0])} required className="rounded-sm" data-testid="staff-photo-input" />
                </div>
                <Button type="submit" disabled={uploading} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="submit-add-staff">
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" strokeWidth={1.5} /> Upload</>}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">No team members yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {members.map(m => (
                <div key={m.id} className="relative group p-3 bg-zinc-50 border border-zinc-100 rounded-sm" data-testid={`staff-card-${m.id}`}>
                  {/* The photo is a clickable file picker — tap it to replace a wrong image. */}
                  <label
                    className="w-16 h-16 rounded-sm bg-[#002FA7]/10 overflow-hidden mx-auto mb-2 block relative cursor-pointer group/photo"
                    title="Click to change photo"
                    data-testid={`change-staff-photo-${m.id}`}
                  >
                    {m.photo_path ? <img src={fileUrl(m.photo_path)} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-medium text-[#002FA7]">{m.name?.charAt(0)?.toUpperCase()}</div>}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-[10px] font-medium opacity-0 group-hover/photo:opacity-100 transition-opacity">
                      {changingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Pencil className="w-3 h-3 mr-1" strokeWidth={1.5} /> Change</>}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={changingId === m.id}
                      onChange={(e) => handleChangePhoto(m.id, e.target.files?.[0], e)}
                    />
                  </label>
                  <p className="text-sm font-medium text-[#09090B] text-center">{m.name}</p>
                  <p className="text-xs text-zinc-400 text-center">{m.role_title}</p>
                  <button
                    onClick={() => handleDeleteMember(m.id, m.name)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white border border-zinc-200 rounded-sm hover:bg-red-50 hover:border-red-200"
                    data-testid={`delete-staff-${m.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg font-medium tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.5} /> Staff Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">No data yet. Leaderboard appears once customers start using the NFC portal.</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((m, i) => (
                <div key={m.id} className="flex items-center gap-4 p-3 bg-zinc-50 border border-zinc-100 rounded-sm">
                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'}`}>{i + 1}</div>
                  <div className="w-8 h-8 rounded-sm bg-[#002FA7]/10 overflow-hidden flex items-center justify-center text-sm font-medium text-[#002FA7]">
                    {m.photo_path ? <img src={fileUrl(m.photo_path)} alt={m.name} className="w-full h-full object-cover" /> : m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#09090B]">{m.name}</p>
                    <p className="text-xs text-zinc-400">{m.role_title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-[#09090B]">{m.intent_count}</p>
                    <p className="text-xs text-zinc-400">selections</p>
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
