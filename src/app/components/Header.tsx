import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, Sun, Moon, 
  User, Users, Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';
import teacherIcon from 'figma:asset/3f8181192f198645523b0ded5b1b684057187d0e.png';

interface HeaderProps {
  user: {
    name: string;
    role: 'teacher' | 'student';
  } | null;
  onLogout: () => void;
  onSwitchRole?: (role: 'teacher' | 'student') => void;
  themeMode: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export default function Header({ 
  user, 
  onLogout, 
  onSwitchRole,
  themeMode, 
  onThemeChange
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#2D3748]/95 backdrop-blur-md border-b-2 border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">AI와 토론해요!</h1>
              <p className="text-xs text-text-secondary">토론이 즐거운 모험이 되다</p>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => onThemeChange(themeMode === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-xl bg-muted hover:bg-border transition-all duration-300 hover:scale-105"
              title={themeMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              {themeMode === 'light' ? (
                <Moon className="w-5 h-5 text-text-secondary" />
              ) : (
                <Sun className="w-5 h-5 text-accent" />
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  {user.role === 'teacher' ? (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      <img src={teacherIcon} alt="Teacher" className="w-5 h-5 object-cover" />
                    </div>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="font-semibold">{user.name}</span>
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#2D3748] rounded-2xl shadow-strong border border-border overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {user.role === 'teacher' ? '교사' : '학생'}
                      </p>
                    </div>

                    {onSwitchRole && (
                      <div className="p-2 border-b border-border">
                        <button
                          onClick={() => {
                            onSwitchRole(user.role === 'teacher' ? 'student' : 'teacher');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left"
                        >
                          {user.role === 'teacher' ? (
                            <User className="w-4 h-4 text-secondary" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              <img src={teacherIcon} alt="Teacher" className="w-4 h-4 object-cover" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {user.role === 'teacher' ? '학생으로 전환' : '교사로 전환'}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="p-2">
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">로그아웃</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSwitchRole?.('teacher')}
                  className="px-4 py-2 rounded-xl bg-gradient-primary text-white font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  교사 로그인
                </button>
                <button
                  onClick={() => onSwitchRole?.('student')}
                  className="px-4 py-2 rounded-xl bg-gradient-secondary text-white font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  학생 입장
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
