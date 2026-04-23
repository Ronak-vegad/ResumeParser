import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [year, setYear] = useState<string>('1');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const em = await signup(name, parseInt(year, 10), email, password);
      navigate(`/verify-otp?email=${encodeURIComponent(em)}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
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
        <h1 className="font-body text-2xl font-bold tracking-[-0.02em] text-white">Create account</h1>
        <p className="mt-1 text-sm text-white/50">We will email you a 4-digit code to verify your address.</p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <Label htmlFor="name" className="field-label">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field border border-white/10 bg-[#0e0e0e]"
            />
          </div>
          <div>
            <Label className="field-label">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="input-field w-full h-12 border border-white/10 bg-[#0e0e0e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border border-white/10 bg-[#1a1a1a] text-white">
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="semail" className="field-label">
              Email
            </Label>
            <Input
              id="semail"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field border border-white/10 bg-[#0e0e0e]"
            />
          </div>
          <div>
            <Label htmlFor="spassword" className="field-label">
              Password
            </Label>
            <Input
              id="spassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field border border-white/10 bg-[#0e0e0e]"
            />
            <p className="mt-1 text-xs text-white/40">At least 8 characters.</p>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-coral w-full">
            {submitting ? 'Sending code…' : 'Continue'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/45">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7fb3ff] hover:text-[#a7c8ff]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
