import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { login } = useAuth();
  const [search] = useSearchParams();
  const from = search.get('from') || '/';
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from === '/login' ? '/' : from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 parsed-neon">
      <div
        className="card-surface w-full max-w-md p-8 sm:p-10"
        style={{
          background: 'linear-gradient(145deg, rgba(22,22,22,0.98), rgba(10,10,10,0.99))',
        }}
      >
        <h1 className="font-body text-2xl font-bold tracking-[-0.02em] text-white">Log in</h1>
        <p className="mt-1 text-sm text-white/50">Access your account to parse resumes.</p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <Label htmlFor="email" className="field-label">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field border border-white/10 bg-[#0e0e0e]"
            />
          </div>
          <div>
            <Label htmlFor="password" className="field-label">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field border border-white/10 bg-[#0e0e0e]"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-coral w-full"
          >
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/45">
          No account?{' '}
          <Link to="/signup" className="text-[#7fb3ff] hover:text-[#a7c8ff]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
