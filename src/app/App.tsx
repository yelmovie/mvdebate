import React, { useState, useEffect, useReducer } from 'react';
import '../styles/index.css';
import { supabase } from '../lib/supabaseClient';
import { apiCall, publicApiCall } from '../lib/api';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ResetPasswordPage from './components/ResetPasswordPage';
import Header from './components/Header';
import { AlertProvider } from './components/AlertProvider';
import { ToastContainer } from './components/ui';
import { Users, MessageSquare, Sparkles, Trophy, Zap, Heart } from 'lucide-react';
import teacherIllustration from 'figma:asset/7b5d35afc9027a0676c0a18d19a55c27a3464e57.png';
import studentIllustration from 'figma:asset/aee1f0c2d1d04d3610a56a011cff82fdd91233af.png';

// ────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
}

type ThemeMode = 'light' | 'dark';

// ────────────────────────────────────────────────
// 화면 전환 상태를 하나의 객체로 관리
// ────────────────────────────────────────────────
interface AppViewState {
  loading: boolean;
  isResetPassword: boolean;
  showRoleSelector: boolean;
  user: AppUser | null;
  themeMode: ThemeMode;
}

type AppViewAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESET_PASSWORD'; payload: boolean }
  | { type: 'SET_ROLE_SELECTOR'; payload: boolean }
  | { type: 'SET_USER'; payload: AppUser | null }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'LOGOUT' };

const initialState: AppViewState = {
  loading: true,
  isResetPassword: false,
  showRoleSelector: false,
  user: null,
  themeMode: 'light',
};

function appReducer(state: AppViewState, action: AppViewAction): AppViewState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RESET_PASSWORD':
      return { ...state, isResetPassword: action.payload, loading: false };
    case 'SET_ROLE_SELECTOR':
      return { ...state, showRoleSelector: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, showRoleSelector: false };
    case 'SET_THEME':
      return { ...state, themeMode: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, showRoleSelector: false };
    default:
      return state;
  }
}

// ────────────────────────────────────────────────
// App
// ────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { loading, isResetPassword, showRoleSelector, user, themeMode } = state;

  // 다크모드 DOM 반영
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  // 초기화: 비밀번호 재설정 감지 + 세션 복구
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      dispatch({ type: 'SET_RESET_PASSWORD', payload: true });
      return;
    }
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await publicApiCall('/init-test-data', { method: 'POST' });
    } catch {
      // non-critical
    }
    await restoreSession();
  }

  async function restoreSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        dispatch({ type: 'SET_USER', payload: null });
        return;
      }
      const userData = await apiCall('/me');
      dispatch({ type: 'SET_USER', payload: userData.user });
    } catch {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }

  function handleLogin(userData: AppUser) {
    dispatch({ type: 'SET_USER', payload: userData });
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    dispatch({ type: 'LOGOUT' });
  }

  function handleResetPasswordComplete() {
    dispatch({ type: 'SET_RESET_PASSWORD', payload: false });
    window.location.hash = '';
    window.location.reload();
  }

  // ────────────────────────────────────────────────
  // 렌더링 분기 (라우터 없이 조건부 반환)
  // ────────────────────────────────────────────────

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
        <RoleSelectorScreen
          onSelect={() => dispatch({ type: 'SET_ROLE_SELECTOR', payload: false })}
          teacherIllustration={teacherIllustration}
          studentIllustration={studentIllustration}
        />
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
        <Header
          user={user}
          onLogout={handleLogout}
          onSwitchRole={() => dispatch({ type: 'SET_ROLE_SELECTOR', payload: true })}
          themeMode={themeMode}
          onThemeChange={(mode) => dispatch({ type: 'SET_THEME', payload: mode })}
        />
        <div>
          {user.role === 'teacher' ? (
            <TeacherDashboard user={user} onLogout={handleLogout} demoMode={false} themeMode={themeMode} />
          ) : (
            <StudentDashboard user={user} onLogout={handleLogout} demoMode={false} themeMode={themeMode} />
          )}
        </div>
        <ToastContainer />
      </div>
    </AlertProvider>
  );
}

// ────────────────────────────────────────────────
// 역할 선택 화면 (분리된 컴포넌트)
// ────────────────────────────────────────────────
interface RoleSelectorScreenProps {
  onSelect: () => void;
  teacherIllustration: string;
  studentIllustration: string;
}

function RoleSelectorScreen({ onSelect, teacherIllustration, studentIllustration }: RoleSelectorScreenProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background dark:bg-[#1A202C]">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#FF8C69] via-[#FFB088] to-[#FFC9A3]"
          style={{ clipPath: 'polygon(0 0, 52% 0, 48% 100%, 0 100%)' }}
        >
          <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 left-1/4 w-12 h-12 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-32 left-1/3 w-20 h-20 rounded-full bg-white/10 animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#7DD3C0] via-[#A8E6CF] to-[#C3F0E2]"
          style={{ clipPath: 'polygon(48% 0, 100% 0, 100% 100%, 52% 100%)' }}
        >
          <div className="absolute top-32 right-24 w-14 h-14 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white/15 animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-40 right-1/3 w-18 h-18 rounded-full bg-white/10 animate-float" style={{ animationDelay: '2.5s' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-full bg-white/30" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="text-center pt-12 pb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-full mb-6 shadow-soft">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm font-bold text-text-secondary">AI와 토론해요!</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight text-white drop-shadow-lg">
            토론이 즐거운 모험이 되다
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
            AI 친구와 함께 생각을 키우고, 논리를 다지는 특별한 여행
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* 선생님 섹션 */}
          <button
            onClick={onSelect}
            className="group relative flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-700 hover:scale-105"
          >
            <div className="relative z-10 text-center max-w-lg">
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  선생님이신가요?
                </h2>
                <p className="text-lg text-white/90 drop-shadow-md">학생들의 토론 여정을 함께 만들어가요</p>
              </div>
              <div className="mb-8 relative">
                <div className="w-48 h-48 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-strong group-hover:scale-110 transition-transform duration-500">
                  <img src={teacherIllustration} alt="Teacher" className="w-40 h-40 rounded-full object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0s' }}>📚</div>
                <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>✏️</div>
              </div>
              <div className="space-y-3 mb-8">
                {[
                  { icon: <Users className="w-5 h-5 text-primary" />, label: '학급 통합 관리' },
                  { icon: <Sparkles className="w-5 h-5 text-primary" />, label: 'AI 주제 자동 생성' },
                  { icon: <Trophy className="w-5 h-5 text-primary" />, label: '성장 리포트 제공' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">{icon}</div>
                    <span className="text-white font-medium text-left">{label}</span>
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-bold text-lg rounded-full shadow-strong group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                <span>지금 시작하기</span>
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </button>

          {/* 학생 섹션 */}
          <button
            onClick={onSelect}
            className="group relative flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-700 hover:scale-105"
          >
            <div className="relative z-10 text-center max-w-lg">
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  학생이신가요?
                </h2>
                <p className="text-lg text-white/90 drop-shadow-md">AI 친구와 신나는 토론 모험을 떠나요</p>
              </div>
              <div className="mb-8 relative">
                <div className="w-48 h-48 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-strong group-hover:scale-110 transition-transform duration-500">
                  <img src={studentIllustration} alt="Student" className="w-40 h-40 rounded-full object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0s' }}>💬</div>
                <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>⭐</div>
              </div>
              <div className="space-y-3 mb-8">
                {[
                  { icon: <MessageSquare className="w-5 h-5 text-secondary" />, label: '10가지 AI 캐릭터' },
                  { icon: <Zap className="w-5 h-5 text-secondary" />, label: '실시간 피드백' },
                  { icon: <Heart className="w-5 h-5 text-secondary" />, label: '재미있는 보상' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 group-hover:bg-white/30 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">{icon}</div>
                    <span className="text-white font-medium text-left">{label}</span>
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-secondary font-bold text-lg rounded-full shadow-strong group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                <span>토론 시작하기</span>
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
