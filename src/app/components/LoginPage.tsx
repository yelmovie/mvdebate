import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { apiCall, publicApiCall } from '../../lib/api';
import { AppUser } from '../App';
import { Eye, EyeOff, Sparkles, Users, BookOpen, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AppUser) => void;
}

type Role = 'teacher' | 'student';

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // ?? ?? / ??? ?? ?? ??????????????????????????????
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F5] via-[#FFE8E0] to-[#E8F5F3] p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full mb-4 shadow-soft">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-text-secondary">AI? ????!</span>
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">텍스트</h1>
            <p className="text-text-secondary">텍스트</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole('teacher')}
              className="group flex flex-col items-center p-8 bg-white rounded-3xl shadow-medium hover:shadow-glow transition-all hover:scale-105 border-2 border-transparent hover:border-primary"
            >
              <div className="text-5xl mb-4">텍스트</div>
              <h2 className="text-xl font-bold text-text-primary mb-1">텍스트</h2>
              <p className="text-sm text-text-secondary text-center">텍스트</p>
            </button>
            <button
              onClick={() => setSelectedRole('student')}
              className="group flex flex-col items-center p-8 bg-white rounded-3xl shadow-medium hover:shadow-glow transition-all hover:scale-105 border-2 border-transparent hover:border-secondary"
            >
              <div className="text-5xl mb-4">텍스트</div>
              <h2 className="text-xl font-bold text-text-primary mb-1">텍스트</h2>
              <p className="text-sm text-text-secondary text-center">AI? 1:1 ?? ??</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ?? ???? ??? ?? ??????????????????????????????????
  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F5] via-[#FFE8E0] to-[#E8F5F3] p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-strong p-8 border-2 border-border">
            <button onClick={() => setShowReset(false)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-medium">
              <ArrowLeft className="w-4 h-4" />
              버튼
            </button>
            <h2 className="text-2xl font-bold text-text-primary mb-2">텍스트</h2>
            <p className="text-text-secondary text-sm mb-6">텍스트</p>

            {resetSuccess ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">텍스트</div>
                <p className="font-semibold text-text-primary">텍스트</p>
                <p className="text-text-secondary text-sm mt-1">텍스트</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail);
                  if (resetError) throw resetError;
                  setResetSuccess(true);
                } catch (err: any) {
                  setError(err.message || '??? ??? ??????.');
                }
              }} className="space-y-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="??? ??"
                  className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background text-text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
                <button type="submit" className="w-full py-4 bg-gradient-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all">
                  버튼
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ?? ??? / ???? ? ??????????????????????????????????
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (selectedRole === 'student') {
        if (!name || !classCode) throw new Error('??? ???? ?? ??????');

        const response = await publicApiCall('/signin', {
          method: 'POST',
          body: JSON.stringify({ name, classCode, password: classCode, isStudent: true }),
        });

        if (response.session) {
          await supabase.auth.setSession({
            access_token: response.session.access_token,
            refresh_token: response.session.refresh_token,
          });
        }
        onLogin(response.user);
      } else {
        if (mode === 'login') {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          const userData = await apiCall('/me');
          onLogin(userData.user);
        } else {
          await publicApiCall('/signup-teacher', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
          });
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          const userData = await apiCall('/me');
          onLogin(userData.user);
        }
      }
    } catch (err: any) {
      setError(err.message || '???? ??????. ?? ??????.');
    } finally {
      setLoading(false);
    }
  }

  const isTeacher = selectedRole === 'teacher';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F5] via-[#FFE8E0] to-[#E8F5F3] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-strong p-8 border-2 border-border">
          {/* ?? */}
          <button onClick={() => setSelectedRole(null)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            버튼
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft ${isTeacher ? 'bg-gradient-primary' : 'bg-gradient-secondary'}`}>
              {isTeacher ? <BookOpen className="w-6 h-6 text-white" /> : <Users className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {isTeacher ? '???' : '??'} {mode === 'login' ? '???' : '????'}
              </h1>
              {isTeacher && (
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  {mode === 'login' ? '??? ?????? ????' : '?? ??? ?????? ???'}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ?? (?? + ??? ????) */}
            {(!isTeacher || mode === 'signup') && (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">텍스트</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="???"
                  className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background text-text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-text-secondary/50 transition-all"
                  required
                />
              </div>
            )}

            {/* ??: ??? */}
            {!isTeacher && (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">텍스트</label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="???? ?? ?? (?: ABC12)"
                  className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary outline-none placeholder:text-text-secondary/50 transition-all tracking-widest font-mono"
                  maxLength={5}
                  required
                />
              </div>
            )}

            {/* ???: ??? */}
            {isTeacher && (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">텍스트</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background text-text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-text-secondary/50 transition-all"
                  required
                />
              </div>
            )}

            {/* ???: ???? */}
            {isTeacher && (
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
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="mt-1 text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    버튼
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm font-medium bg-red-50 rounded-2xl px-4 py-3 break-keep">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all hover:shadow-glow disabled:opacity-50 ${
                isTeacher ? 'bg-gradient-primary' : 'bg-gradient-secondary'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ?? ?...
                </div>
              ) : mode === 'login' ? '???' : '????'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
