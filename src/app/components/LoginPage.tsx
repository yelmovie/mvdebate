import React, { useState } from 'react';
import { supabase, apiCall, publicApiCall } from '../../utils/supabase';
import { Users, MessageSquare, Sparkles, Trophy, Zap, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (selectedRole === 'student') {
        // Student login with name and classCode only (no password needed)
        if (!name || !classCode) {
          throw new Error('이름과 반코드를 모두 입력해주세요');
        }
        
        // Use classCode as password automatically
        const response = await publicApiCall('/signin', {
          method: 'POST',
          body: JSON.stringify({ name, classCode, password: classCode, isStudent: true }),
        });
        
        // Set the session in Supabase client so subsequent API calls work
        if (response.session) {
          await supabase.auth.setSession({
            access_token: response.session.access_token,
            refresh_token: response.session.refresh_token
          });
        }
        
        onLogin(response.user);
      } else {
        // Teacher flow
        if (mode === 'login') {
          // Teacher login with email
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          
          // Get user data from backend
          const userData = await apiCall('/me');
          onLogin(userData.user);
        } else {
          // Teacher signup
          await publicApiCall('/signup-teacher', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
          });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          
          const userData = await apiCall('/me');
          onLogin(userData.user);
        }
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || '비밀번호 재설정 이메일 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 역할 선택 화면
  if (!selectedRole) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-background dark:bg-[#1A202C]">
        {/* Split Background with Organic Shapes */}
        <div className="absolute inset-0">
          {/* Teacher Side - Coral Gradient */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-[#FF8C69] via-[#FFB088] to-[#FFC9A3]"
            style={{
              clipPath: 'polygon(0 0, 52% 0, 48% 100%, 0 100%)',
            }}
          >
            {/* Floating decorative elements */}
            <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-40 left-1/4 w-12 h-12 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 left-1/3 w-20 h-20 rounded-full bg-white/10 animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Student Side - Mint Gradient */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-[#7DD3C0] via-[#A8E6CF] to-[#C3F0E2]"
            style={{
              clipPath: 'polygon(48% 0, 100% 0, 100% 100%, 52% 100%)',
            }}
          >
            {/* Floating decorative elements */}
            <div className="absolute top-32 right-24 w-14 h-14 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-40 right-1/3 w-18 h-18 rounded-full bg-white/10 animate-float" style={{ animationDelay: '2.5s' }}></div>
          </div>

          {/* Center Divider - Wavy Line */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-1 h-full bg-white/30"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <div className="text-center pt-12 pb-8 animate-fade-in-up">
            {/* Logo & Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-full mb-6 shadow-soft">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-text-secondary">AI와 토론해요!</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight text-white drop-shadow-lg">
              토론이 즐거운 모험이 되다
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
              AI 친구와 함께 생각을 키우고, 논리를 다지는 특별한 여행
            </p>
          </div>

          {/* Split Role Selection */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Teacher Section */}
            <div className="group relative flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-700">
              <div className="relative z-10 text-center max-w-lg">
                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    선생님이신가요?
                  </h2>
                  <p className="text-lg text-white/90 drop-shadow-md">
                    학생들의 토론 여정을 함께 만들어가요
                  </p>
                </div>

                {/* Character Illustration */}
                <div className="mb-8 relative">
                  <div className="w-48 h-48 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-strong group-hover:scale-110 transition-transform duration-500">
                    <div className="text-8xl">👨‍🏫</div>
                  </div>
                  {/* Floating mini icons */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0s' }}>
                    📚
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>
                    ✏️
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white font-medium text-left">학급 통합 관리</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white font-medium text-left">AI 주제 자동 생성</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white font-medium text-left">성장 리포트 제공</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSelectedRole('teacher');
                      setMode('login');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold text-base rounded-full shadow-strong hover:shadow-glow hover:scale-110 transition-all duration-300"
                  >
                    <span>로그인</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRole('teacher');
                      setMode('signup');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 text-primary font-bold text-base rounded-full shadow-strong hover:shadow-glow hover:scale-110 transition-all duration-300"
                  >
                    <span>회원가입</span>
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Student Section */}
            <div className="group relative flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-700">
              <div className="relative z-10 text-center max-w-lg">
                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    학생이신가요?
                  </h2>
                  <p className="text-lg text-white/90 drop-shadow-md">
                    AI 친구와 신나는 토론 모험을 떠나요
                  </p>
                </div>

                {/* Character Illustration */}
                <div className="mb-8 relative">
                  <div className="w-48 h-48 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-strong group-hover:scale-110 transition-transform duration-500">
                    <div className="text-8xl">🧑‍🎓</div>
                  </div>
                  {/* Floating mini icons */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0s' }}>
                    💬
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>
                    ⭐
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-white font-medium text-left">10가지 AI 캐릭터</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-white font-medium text-left">실시간 피드백</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-white font-medium text-left">재미있는 보상</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSelectedRole('student');
                      setMode('login');
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-secondary font-bold text-lg rounded-full shadow-strong hover:shadow-glow hover:scale-110 transition-all duration-300"
                  >
                    <span>로그인</span>
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인/회원가입 폼
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F5] via-[#FFE8E0] to-[#E8F5F3] dark:from-[#1A202C] dark:via-[#2D1B1F] dark:to-[#1B2D2A] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-4 flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span>뒤로 가기</span>
        </button>

        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`inline-flex items-center justify-center w-20 h-20 ${
              selectedRole === 'teacher' ? 'bg-gradient-primary' : 'bg-gradient-secondary'
            } rounded-3xl mb-4 shadow-strong`}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {selectedRole === 'teacher' ? '선생님 로그인' : '학생 로그인'}
          </h1>
          <p className="text-text-secondary text-lg">
            {selectedRole === 'student' ? '선생님께 받은 반코드를 입력하세요' : 'AI와 토론해요!'}
          </p>
          
          {/* Sample Account Info */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-muted/50 dark:bg-[#1A202C]/50 rounded-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-secondary/70">💡 테스트 계정</p>
              {selectedRole === 'student' && (
                <button
                  type="button"
                  onClick={() => {
                    setName('김철수');
                    setClassCode('ABC12');
                  }}
                  className="text-xs font-semibold text-secondary hover:text-secondary/80 px-2 py-1 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                >
                  자동 입력
                </button>
              )}
              {selectedRole === 'teacher' && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail('teacher@test.com');
                    setPassword('123456');
                  }}
                  className="text-xs font-semibold text-primary hover:text-primary/80 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  자동 입력
                </button>
              )}
            </div>
            {selectedRole === 'teacher' ? (
              <div className="text-xs text-text-secondary/80 space-y-1">
                <p>이메일: <span className="font-mono text-primary/70">teacher@test.com</span></p>
                <p>비밀번호: <span className="font-mono text-primary/70">123456</span></p>
              </div>
            ) : (
              <div className="text-xs text-text-secondary/80 space-y-1">
                <p>이름: <span className="font-mono text-secondary/70">김철수</span></p>
                <p>반코드: <span className="font-mono text-secondary/70">ABC12</span></p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="bg-card dark:bg-[#2D3748] rounded-3xl shadow-strong p-8 border-2 border-border">
          {selectedRole === 'teacher' && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-gradient-primary text-white shadow-medium'
                    : 'bg-muted text-text-secondary hover:bg-border'
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 ${
                  mode === 'signup'
                    ? 'bg-gradient-primary text-white shadow-medium'
                    : 'bg-muted text-text-secondary hover:bg-border'
                }`}
              >
                회원가입
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedRole === 'teacher' ? "김선생" : "김철수"}
                  className={`w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background dark:bg-[#1A202C] text-foreground focus:ring-2 ${
                    selectedRole === 'teacher' ? 'focus:ring-primary focus:border-primary' : 'focus:ring-secondary focus:border-secondary'
                  } outline-none placeholder:text-text-secondary/50 transition-all`}
                  required
                />
              </div>
            )}

            {selectedRole === 'student' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="김철수"
                  className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background dark:bg-[#1A202C] text-foreground focus:ring-2 focus:ring-secondary focus:border-secondary outline-none placeholder:text-text-secondary/50 transition-all"
                  required
                />
              </div>
            )}

            {selectedRole === 'teacher' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@school.kr"
                    className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background dark:bg-[#1A202C] text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-text-secondary/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background dark:bg-[#1A202C] text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-text-secondary/50 transition-all"
                    required
                    minLength={6}
                  />
                  {mode === 'login' && (
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetPassword(true);
                          setResetEmail(email);
                        }}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        비밀번호를 잊으셨나요?
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedRole === 'student' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  반코드
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="ABC12"
                  className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background dark:bg-[#1A202C] text-foreground font-mono text-lg tracking-wider focus:ring-2 focus:ring-secondary focus:border-secondary outline-none uppercase placeholder:text-text-secondary/50 transition-all"
                  required
                  maxLength={5}
                />
                <p className="mt-2 text-xs text-secondary font-medium">💡 선생님이 명단에 추가한 학생만 로그인할 수 있어요</p>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-destructive/10 border-2 border-destructive rounded-2xl text-destructive text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 ${
                selectedRole === 'teacher' ? 'bg-gradient-primary' : 'bg-gradient-secondary'
              } text-white rounded-2xl font-bold text-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-medium`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  처리중...
                </span>
              ) : mode === 'login' ? (
                '로그인'
              ) : (
                '가입하기'
              )}
            </button>
          </form>
        </div>

        {/* Password Reset Modal */}
        {showResetPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowResetPassword(false);
              setResetSuccess(false);
              setError('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card dark:bg-[#2D3748] rounded-3xl shadow-strong p-8 border-2 border-border max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {!resetSuccess ? (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-medium">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      비밀번호 찾기
                    </h2>
                    <p className="text-text-secondary text-sm">
                      가입하신 이메일 주소를 입력하시면<br/>
                      비밀번호 재설정 링크를 보내드립니다
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="teacher@school.kr"
                        className="w-full px-4 py-3.5 border-2 border-border rounded-2xl bg-input-background dark:bg-[#1A202C] text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-text-secondary/50 transition-all"
                        required
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-destructive/10 border-2 border-destructive rounded-2xl text-destructive text-sm font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetPassword(false);
                          setError('');
                        }}
                        className="flex-1 py-3.5 bg-muted text-text-secondary rounded-2xl font-bold hover:bg-border transition-all"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3.5 bg-gradient-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <span className="animate-spin mr-2">⏳</span>
                            발송중...
                          </span>
                        ) : (
                          '이메일 발송'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-secondary rounded-2xl mb-4 shadow-medium">
                      <span className="text-3xl">✉️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      이메일을 확인하세요!
                    </h2>
                    <p className="text-text-secondary text-sm mb-6">
                      <span className="font-semibold text-primary">{resetEmail}</span> 주소로<br/>
                      비밀번호 재설정 링크를 보내드렸습니다.<br/>
                      이메일을 확인하고 링크를 클릭해주세요.
                    </p>
                    <p className="text-xs text-text-secondary/70 mb-6">
                      💡 메일이 보이지 않으면 스팸함을 확인해주세요
                    </p>
                    <button
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetSuccess(false);
                        setError('');
                      }}
                      className="w-full py-3.5 bg-gradient-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all"
                    >
                      확인
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
