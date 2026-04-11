import React, { useState, useRef } from 'react';
import { api, fileUrl } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, CheckCircle2, ArrowRight, ArrowLeft, Users, Link2, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Medical', 'Dental', 'Legal', 'Restaurant', 'Salon', 'General'];
const STEPS = ['Create Client', 'Upload Staff', 'Test Redirect'];

export default function RepWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [clientData, setClientData] = useState(null);
  const [form, setForm] = useState({ business_name: '', email: '', password: '', contact_name: '', category: 'General', city: '', redirect_url: '' });
  const [members, setMembers] = useState([]);
  const [staffForm, setStaffForm] = useState({ name: '', role_title: '' });
  const [staffFile, setStaffFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const fileRef = useRef();

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/agent/clients', form);
      setClientData(data);
      toast.success('Client created successfully');
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  const handleUploadStaff = async (e) => {
    e.preventDefault();
    if (!staffFile) { toast.error('Please select a photo'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', staffFile);
      formData.append('name', staffForm.name);
      formData.append('role_title', staffForm.role_title);
      const { data } = await api.upload(`/agent/clients/${clientData.id}/team?name=${encodeURIComponent(staffForm.name)}&role_title=${encodeURIComponent(staffForm.role_title)}`, formData);
      setMembers([...members, data]);
      setStaffForm({ name: '', role_title: '' });
      setStaffFile(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success(`${data.name} added to team`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTestRedirect = async () => {
    try {
      const { data } = await api.get(`/agent/clients/${clientData.id}/test-redirect`);
      setTestResult(data);
      toast.success('Redirect test passed');
    } catch {
      toast.error('Redirect test failed');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" data-testid="rep-wizard">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Setup Wizard</h1>
        <p className="text-sm text-zinc-500 mt-1">White-glove onboarding for new clients</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-[#002FA7]' : 'text-zinc-400'}`}>
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-medium ${
                i < step ? 'bg-[#002FA7] text-white' : i === step ? 'bg-[#002FA7]/10 text-[#002FA7] border border-[#002FA7]' : 'bg-zinc-100 text-zinc-400'
              }`} data-testid={`wizard-step-${i}`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-[#002FA7]' : 'bg-zinc-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Create Client */}
      {step === 0 && (
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-medium text-[#09090B]">Step 1: Create Client</h2>
                <p className="text-sm text-zinc-500">Enter the business details</p>
              </div>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Business Name</Label>
                  <Input value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} required className="rounded-sm" data-testid="wizard-business-name" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Contact Name</Label>
                  <Input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} required className="rounded-sm" data-testid="wizard-contact-name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="rounded-sm" data-testid="wizard-email" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="rounded-sm" data-testid="wizard-password" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger className="rounded-sm" data-testid="wizard-category"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">City</Label>
                  <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="rounded-sm" data-testid="wizard-city" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Google Review URL</Label>
                <Input value={form.redirect_url} onChange={e => setForm({...form, redirect_url: e.target.value})} placeholder="https://maps.google.com/..." className="rounded-sm" data-testid="wizard-redirect-url" />
              </div>
              <Button type="submit" disabled={creating} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="wizard-create-client-submit">
                {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <>Create Client <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} /></>}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload Staff */}
      {step === 1 && (
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-medium text-[#09090B]">Step 2: Upload Staff Photos</h2>
                <p className="text-sm text-zinc-500">Add team members for {clientData?.business_name}</p>
              </div>
            </div>

            {/* Uploaded members list */}
            {members.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Uploaded Members ({members.length})</p>
                <div className="grid grid-cols-2 gap-3">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-sm">
                      <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 flex items-center justify-center text-sm font-medium text-[#002FA7]">
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#09090B]">{m.name}</p>
                        <p className="text-xs text-zinc-400">{m.role_title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleUploadStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Staff Name</Label>
                  <Input value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} required className="rounded-sm" data-testid="wizard-staff-name" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Role / Title</Label>
                  <Input value={staffForm.role_title} onChange={e => setStaffForm({...staffForm, role_title: e.target.value})} placeholder="e.g., Dr., Manager" className="rounded-sm" data-testid="wizard-staff-role" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Photo</Label>
                <Input ref={fileRef} type="file" accept="image/*" onChange={e => setStaffFile(e.target.files[0])} required className="rounded-sm" data-testid="wizard-staff-photo" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={uploading} className="flex-1 rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="wizard-upload-staff-submit">
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" strokeWidth={1.5} /> Upload Staff Member</>}
                </Button>
              </div>
            </form>

            <div className="flex justify-between mt-6 pt-4 border-t border-zinc-200">
              <Button variant="outline" onClick={() => setStep(0)} className="rounded-sm" data-testid="wizard-back-to-step1">
                <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={members.length === 0}
                className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white disabled:opacity-50"
                data-testid="wizard-next-to-step3"
              >
                Next: Test Redirect <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Test Redirect */}
      {step === 2 && (
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-medium text-[#09090B]">Step 3: Test Redirect</h2>
                <p className="text-sm text-zinc-500">Verify the NFC links work before you leave</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm">
                <p className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400 mb-2">Client Info</p>
                <p className="text-sm font-medium text-[#09090B]">{clientData?.business_name}</p>
                <p className="text-sm text-zinc-500">Standee ID: <code className="bg-zinc-200 px-1.5 py-0.5 rounded-sm font-mono text-xs">{clientData?.standee_id}</code></p>
                <p className="text-sm text-zinc-500">Team Members: {members.length}</p>
              </div>

              <Button onClick={handleTestRedirect} className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid="wizard-test-redirect-button">
                <Link2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Test NFC Redirect
              </Button>

              {testResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm" data-testid="wizard-test-result">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-emerald-700">Redirect test passed!</p>
                  </div>
                  <p className="text-sm text-emerald-600">Portal URL: /portal/{clientData?.id}</p>
                  <p className="text-sm text-emerald-600">NFC URL: /s/{clientData?.standee_id}</p>
                  <p className="text-sm text-emerald-600">Members loaded: {testResult.members?.length || 0}</p>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-zinc-200">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-sm" data-testid="wizard-back-to-step2">
                  <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> Back
                </Button>
                <Button onClick={() => navigate('/agent')} className="rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="wizard-finish">
                  <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Complete Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
