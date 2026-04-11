import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ['Medical', 'Dental', 'Legal', 'Restaurant', 'Salon', 'General'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', business_name: '', category: 'General', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/register`, form, { withCredentials: true });
      localStorage.setItem('token', data.token);
      navigate('/client');
      window.location.reload();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(e => e.msg).join(' ') : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/d2ed1487-14a4-4fc1-8e2b-3d8f6aaf654d/images/bbdba75c6cd66b6d02b63643c28ea613be66baeb5d81796bdc87dea2b1cc97da.png"
          alt="Tellvy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#002FA7]/80 flex flex-col items-start justify-end p-12">
          <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter font-medium text-white mb-3">
            Tellvy
          </h1>
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            Turn every customer interaction into a 5-star review. Get started in minutes.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAFA]">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://static.prod-images.emergentagent.com/jobs/d2ed1487-14a4-4fc1-8e2b-3d8f6aaf654d/images/a3e0b2130b485bc9bbe242cae0bab2b7c522b549d1955c31a2b1627d78900940.png"
                alt="Tellvy Logo"
                className="w-10 h-10"
              />
              <span className="font-heading text-2xl font-medium tracking-tight text-[#09090B]">Tellvy</span>
            </div>
            <p className="text-sm text-zinc-500">Create your business account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700" data-testid="register-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Your Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                required
                className="rounded-sm border-zinc-200"
                data-testid="register-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business" className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Business Name</Label>
              <Input
                id="business"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                placeholder="Smith Dental Clinic"
                required
                className="rounded-sm border-zinc-200"
                data-testid="register-business-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="rounded-sm border-zinc-200" data-testid="register-category-select"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Dubai"
                  className="rounded-sm border-zinc-200"
                  data-testid="register-city-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@business.com"
                required
                className="rounded-sm border-zinc-200"
                data-testid="register-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="rounded-sm border-zinc-200"
                data-testid="register-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white h-11"
              data-testid="register-submit-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                  Create Account
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#002FA7] font-medium hover:underline" data-testid="go-to-login-link">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
