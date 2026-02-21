import React, { useState, useEffect } from 'react';
import '../styles/index.css';
import { supabase, apiCall, publicApiCall } from '../utils/supabase';
import { projectId } from '../utils/supabase/info';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ResetPasswordPage from './components/ResetPasswordPage';
import Header from './components/Header';
import { AlertProvider } from './components/AlertProvider';
import { ToastContainer } from './components/ui';
import { Users, MessageSquare, Sparkles, Trophy, Zap, Heart } from 'lucide-react';
import teacherIllustration from '../assets/teacher_custom.png';
import studentIllustration from '../assets/student_custom.png';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [demoMode, setDemoMode] = useState(false); // 실제 인증 사용
  const [isResetPassword, setIsResetPassword] = useState(false);
  
  // 테마 모드
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if user is on password reset page
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsResetPassword(true);
      setLoading(false);
      return;
    }
    
    // Initialize test data and check session
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Initialize test data first
      console.log('Initializing test data...');
      await publicApiCall('/init-test-data', {
        method: 'POST'
      });
      console.log('Test data initialized successfully');
    } catch (error) {
      console.log('Test data init error (non-critical):', error);
    }
    
    // Then check session
    await checkSession();
  }

  useEffect(() => {
    // Apply theme mode
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  async function checkSession() {
    try {
      console.log('Checking session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setUser(null);
        setLoading(false);
        return;
      }
      
      console.log('Session status:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        email: session?.user?.email
      });
      
      if (session?.user) {
        try {
          // Get user data from backend
          console.log('Fetching user data from /me...');
          const userData = await apiCall('/me');
          console.log('User data received:', userData);
          setUser(userData.user);
        } catch (apiError: any) {
          console.error('Failed to fetch user data:', apiError);
          // If API call fails, sign out to force re-login
          if (apiError.message?.includes('인증')) {
            console.log('Authentication error, clearing session');
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } else {
        console.log('No session found, user needs to login');
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(userData: User) {
    setUser(userData);
    setShowRoleSelector(false);
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowRoleSelector(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  function handleSwitchRole(role: 'teacher' | 'student') {
    setShowRoleSelector(false);
    // Show login page
  }

  function handleResetPasswordComplete() {
    setIsResetPassword(false);
    window.location.hash = '';
    window.location.reload();
  }

  // Show password reset page
  if (isResetPassword) {
    return (
      <AlertProvider>
        <ResetPasswordPage onComplete={handleResetPasswordComplete} />
      </AlertProvider>
    );
  }

  if (loading) {
    return (
      <AlertProvider>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-[#1A202C]">
          <div className="text-6xl mb-6 animate-float">🤖</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
          <p className="mt-6 text-xl font-semibold text-foreground">잠시만 기다려주세요...</p>
        </div>
      </AlertProvider>
    );
  }

  if (!user && !showRoleSelector) {
    return (
      <AlertProvider>
        <LoginPage onLogin={handleLogin} />
      </AlertProvider>
    );
  }

  if (showRoleSelector) {
    return (
      <AlertProvider>
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
            <button
              onClick={() => setShowRoleSelector(false)}
              className="group relative flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-700 hover:scale-105"
            >
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
                <div className="mb-8 relative flex items-center justify-center">
                  {/* 배경 원 - 이미지와 자연스럽게 블렌딩 */}
                  <div className="w-52 h-52 mx-auto rounded-full bg-white/15 backdrop-blur-sm shadow-strong group-hover:scale-110 transition-transform duration-500 flex items-end justify-center overflow-hidden relative">
                    {/* 원 하단 그라디언트로 경계 부드럽게 */}
                    <div className="absolute inset-0 rounded-full" style={{
                      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(255,140,105,0.15) 70%, rgba(255,140,105,0.35) 100%)'
                    }} />
                    <img
                      src={teacherIllustration}
                      alt="Teacher"
                      className="relative z-10 w-48 h-48 object-contain object-bottom"
                      style={{
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))',
                        maskImage: 'radial-gradient(ellipse 90% 95% at 50% 55%, black 60%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 90% 95% at 50% 55%, black 60%, transparent 100%)',
                      }}
                    />
                  </div>
                  {/* Floating mini icons */}
                  <div className="absolute -top-2 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0s' }}>
                    📚
                  </div>
                  <div className="absolute -bottom-2 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>
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

                {/* CTA Button */}
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-bold text-lg rounded-full shadow-strong group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                  <span>지금 시작하기</span>
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </button>

            {/* Student Section */}
            <button
              onClick={() => setShowRoleSelector(false)}
              className="group relative flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-700 hover:scale-105"
            >
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
                <div className="mb-8 relative flex items-center justify-center">
                  {/* 배경 원 - 이미지와 자연스럽게 블렌딩 */}
                  <div className="w-52 h-52 mx-auto rounded-full bg-white/15 backdrop-blur-sm shadow-strong group-hover:scale-110 transition-transform duration-500 flex items-end justify-center overflow-hidden relative">
                    {/* 원 경계 그라디언트 */}
                    <div className="absolute inset-0 rounded-full" style={{
                      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(125,211,192,0.15) 70%, rgba(125,211,192,0.35) 100%)'
                    }} />
                    <img
                      src={studentIllustration}
                      alt="Student"
                      className="relative z-10 w-48 h-48 object-contain object-bottom"
                      style={{
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))',
                        maskImage: 'radial-gradient(ellipse 90% 95% at 50% 55%, black 60%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 90% 95% at 50% 55%, black 60%, transparent 100%)',
                      }}
                    />
                  </div>
                  {/* Floating mini icons */}
                  <div className="absolute -top-2 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0s' }}>
                    💬
                  </div>
                  <div className="absolute -bottom-2 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>
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

                {/* CTA Button */}
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-secondary font-bold text-lg rounded-full shadow-strong group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                  <span>토론 시작하기</span>
                  <Zap className="w-6 h-6" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      </AlertProvider>
    );
  }

  if (!user) {
    return (
      <AlertProvider>
        <LoginPage onLogin={handleLogin} />
      </AlertProvider>
    );
  }

  return (
    <AlertProvider>
      <div className={`min-h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
        {/* Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
        />

        {/* 메인 콘텐츠 */}
        <div>
          {user.role === 'teacher' ? (
            <TeacherDashboard user={user} onLogout={handleLogout} demoMode={demoMode} themeMode={themeMode} />
          ) : (
            <StudentDashboard user={user} onLogout={handleLogout} demoMode={demoMode} themeMode={themeMode} />
          )}
        </div>

        {/* Toast Container */}
        <ToastContainer />
      </div>
    </AlertProvider>
  );
}
