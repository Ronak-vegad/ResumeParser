import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

export default function VerifyOtpPage() {
  const { verifyOtp, resendOtp, isAuthenticated } = useAuth();
  const [search] = useSearchParams();
  const emailParam = search.get('email') || '';
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const submitLock = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!emailParam) {
      setError('Missing email. Start from sign up.');
    }
  }, [emailParam]);

  async function submitWithValue(otp: string) {
    if (otp.length !== 4) return;
    if (!emailParam) return;
    if (submitLock.current) return;
    submitLock.current = true;
    setError('');
    setResendMsg('');
    setSubmitting(true);
    try {
      await verifyOtp(emailParam, otp);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setSubmitting(false);
      submitLock.current = false;
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
        <h1 className="font-body text-2xl font-bold tracking-[-0.02em] text-white">Verify email</h1>
        <p className="mt-1 text-sm text-white/50">
          Enter the 4-digit code we sent to{' '}
          <span className="text-white/80">{emailParam || 'your email'}</span>.
        </p>
        <div className="mt-8">
          <Label className="field-label">Verification code</Label>
          <div className="mt-2 flex justify-center sm:justify-start">
            <InputOTP
              maxLength={4}
              value={code}
              onChange={(v) => {
                setCode(v);
                if (v.length === 4) {
                  void submitWithValue(v);
                }
              }}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="h-12 w-12 rounded-md border border-white/20 bg-[#0e0e0e] text-lg" />
                <InputOTPSlot index={1} className="h-12 w-12 rounded-md border border-white/20 bg-[#0e0e0e] text-lg" />
                <InputOTPSlot index={2} className="h-12 w-12 rounded-md border border-white/20 bg-[#0e0e0e] text-lg" />
                <InputOTPSlot index={3} className="h-12 w-12 rounded-md border border-white/20 bg-[#0e0e0e] text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {resendMsg && <p className="mt-4 text-sm text-[#7fb3ff]">{resendMsg}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={submitting || !emailParam}
            onClick={() => void submitWithValue(code)}
            className="btn-coral w-full sm:w-auto sm:px-8"
          >
            {submitting ? 'Verifying…' : 'Verify'}
          </button>
          <button
            type="button"
            className="text-sm text-[#7fb3ff] hover:text-[#a7c8ff] disabled:opacity-40"
            disabled={!emailParam || submitting}
            onClick={async () => {
              setResendMsg('');
              setError('');
              try {
                await resendOtp(emailParam);
                setResendMsg('A new code was sent.');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not resend');
              }
            }}
          >
            Resend code
          </button>
        </div>
        <p className="mt-8 text-center text-sm text-white/45">
          <Link to="/signup" className="text-[#7fb3ff] hover:text-[#a7c8ff]">
            Use a different email
          </Link>
        </p>
      </div>
    </div>
  );
}
