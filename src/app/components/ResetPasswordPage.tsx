import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Sparkles, Eye, EyeOff, Check } from 'lucide-react';

interface ResetPasswordPageProps {
  onComplete: () => void;
}

export default function ResetPasswordPage({ onComplete }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    setValidSession(!!session);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('????? ???? ????.');
      return;
    }
    if (password.length < 6) {
      setError('????? ?? 6? ????? ???.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(onComplete, 2000);
    } catch (err: any) {
      setError(err.message || '???? ??? ??????.');
    } finally {
      setLoading(false);
    }
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">텍스트</div>
          <p className="text-text-secondary">텍스트</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F5] via-[#FFE8E0] to-[#E8F5F3] p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-strong p-8 border-2 border-border">
          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">텍스트</h2>
              <p className="text-text-secondary">텍스트</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-medium">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">텍스트</h1>
                <p className="text-text-secondary text-sm">텍스트</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">텍스트</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="????????"
                      className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background text-text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-text-secondary/50 transition-all pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">텍스트</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="????????"
                      className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background text-text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-text-secondary/50 transition-all pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-medium bg-red-50 rounded-2xl px-4 py-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-primary text-white rounded-2xl font-bold text-lg transition-all hover:shadow-glow disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ?? ?...
                    </div>
                  ) : '???? ????'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
