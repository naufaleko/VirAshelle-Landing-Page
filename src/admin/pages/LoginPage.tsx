import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '../../lib/useAdmin';
import { Logo } from '../../components/Logo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithId, user } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  // AuthGuard passes the page the visitor was trying to reach; only honour
  // same-origin paths so the state can never redirect off-site.
  const from = (location.state as { from?: string } | null)?.from;
  const redirectTo = from && from.startsWith('/') && !from.startsWith('//') ? from : '/admin';

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Assuming loginWithId exists and handles standard email/password
      await loginWithId(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Email/ID atau password tidak cocok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-brand selection:text-black">
      {/* One soft brand-colored radial behind the only element on the page: the card is the focal point. */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[450px] rounded-full blur-[150px] opacity-20" 
          style={{ background: 'radial-gradient(circle, rgba(75,210,0,0.4) 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4BD200]/50 to-transparent" />
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">Masuk ke Admin</h1>
            <p className="text-zinc-400 font-ui text-sm">Kelola proyek, keuangan, dan konten website VirAshelle.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-ui text-xs sm:text-sm p-3 rounded-xl mb-6 text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-id" className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Email / ID</label>
              <input 
                id="login-id"
                type="text" 
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 transition-all placeholder:text-dim"
                placeholder="ID login atau email"
              />
            </div>
            
            <div>
              <label htmlFor="login-password" className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Password</label>
              <input 
                id="login-password"
                type="password" 
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 transition-all placeholder:text-dim"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Memeriksa akun...</> : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
