import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'super_admin') navigate('/admin');
      else if (user.role === 'regional_manager') navigate('/regional');
      else if (user.role === 'sales_agent') navigate('/agent');
      else navigate('/client');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(e => e.msg).join(' ') : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
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
            Reputation & Management Engine. Bridge physical touchpoints with digital reviews.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAFA]">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://static.prod-images.emergentagent.com/jobs/d2ed1487-14a4-4fc1-8e2b-3d8f6aaf654d/images/a3e0b2130b485bc9bbe242cae0bab2b7c522b549d1955c31a2b1627d78900940.png"
                alt="Tellvy Logo"
                className="w-10 h-10"
              />
              <span className="font-heading text-2xl font-medium tracking-tight text-[#09090B]">Tellvy</span>
            </div>
            <p className="text-sm text-zinc-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700" data-testid="login-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tellvy.com"
                required
                className="rounded-sm border-zinc-200 focus:border-[#002FA7] focus:ring-[#002FA7]"
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="rounded-sm border-zinc-200 focus:border-[#002FA7] focus:ring-[#002FA7]"
                data-testid="login-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white h-11"
              data-testid="login-submit-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" strokeWidth={1.5} />
                  Sign In
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Business owner?{' '}
              <Link to="/register" className="text-[#002FA7] font-medium hover:underline" data-testid="go-to-register-link">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
