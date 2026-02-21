import React, { useState, useEffect } from 'react';
import { apiCall } from '../../lib/api';
import { AppUser } from '../App';
import DebateSetup from './DebateSetup';
import DebateChat from './DebateChat';
import DebateResult from './DebateResult';
import DebateReflection from './DebateReflection';
import DebatePreparation from './DebatePreparation';
import StudentProgress from './StudentProgress';

interface StudentDashboardProps {
  user: AppUser;
  onLogout: () => void;
  demoMode?: boolean;
  themeMode?: 'light' | 'dark';
}

type ViewState =
  | { screen: 'home' }
  | { screen: 'setup' }
  | { screen: 'preparation'; debateConfig: any }
  | { screen: 'chat'; debateConfig: any }
  | { screen: 'result'; debateId: string }
  | { screen: 'reflection'; debateId: string }
  | { screen: 'progress' };

export default function StudentDashboard({ user, onLogout, demoMode = false, themeMode = 'light' }: StudentDashboardProps) {
  const [view, setView] = useState<ViewState>({ screen: 'home' });
  const [classes, setClasses] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [debates, setDebates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      if (demoMode) {
        setClasses([
          { id: 'class-1', name: '3?? 1?', classCode: 'ABC12' },
        ]);
        setTopics([
          { id: 'topic-1', title: '???? ???? ?? ??', description: '???? ???? ????? ???? ????', difficulty: 'easy' },
          { id: 'topic-2', title: '?? ???', description: '???? ??? ????? ????', difficulty: 'medium' },
          { id: 'topic-3', title: '??? ??? ??', description: '??? ??? ???? ???? ???????', difficulty: 'hard' },
        ]);
        setDebates([
          { id: 'debate-1', topicTitle: '??? vs ???? ??', position: '??', status: 'completed', createdAt: '2024-02-01' },
          { id: 'debate-2', topicTitle: '?? ?? ???', position: '??', status: 'completed', createdAt: '2024-02-05' },
        ]);
        setLoading(false);
        return;
      }

      const [classesData, topicsData, debatesData] = await Promise.allSettled([
        apiCall('/student/classes'),
        apiCall('/student/topics'),
        apiCall('/student/debates'),
      ]);

      if (classesData.status === 'fulfilled') setClasses(classesData.value.classes || []);
      if (topicsData.status === 'fulfilled') setTopics(topicsData.value.topics || []);
      if (debatesData.status === 'fulfilled') setDebates(debatesData.value.debates || []);
    } catch (error) {
      console.error('loadDashboardData error:', error);
    } finally {
      setLoading(false);
    }
  }

  // ?? ?? ?? ??????????????????????????????????????????
  if (view.screen === 'setup') {
    return (
      <DebateSetup
        user={user}
        demoMode={demoMode}
        topics={topics}
        onBack={() => setView({ screen: 'home' })}
        onStartPreparation={(config: any) => setView({ screen: 'preparation', debateConfig: config })}
        onStartDebate={(config: any) => setView({ screen: 'chat', debateConfig: config })}
      />
    );
  }

  if (view.screen === 'preparation') {
    return (
      <DebatePreparation
        debateConfig={view.debateConfig}
        demoMode={demoMode}
        onBack={() => setView({ screen: 'setup' })}
        onStartDebate={(config: any) => setView({ screen: 'chat', debateConfig: config })}
      />
    );
  }

  if (view.screen === 'chat') {
    return (
      <DebateChat
        user={user}
        debateConfig={view.debateConfig}
        demoMode={demoMode}
        onBack={() => setView({ screen: 'setup' })}
        onDebateEnd={(debateId: string) => setView({ screen: 'result', debateId })}
      />
    );
  }

  if (view.screen === 'result') {
    return (
      <DebateResult
        debateId={view.debateId}
        demoMode={demoMode}
        onBack={() => setView({ screen: 'home' })}
        onReflection={() => setView({ screen: 'reflection', debateId: view.debateId })}
      />
    );
  }

  if (view.screen === 'reflection') {
    return (
      <DebateReflection
        debateId={view.debateId}
        demoMode={demoMode}
        onBack={() => setView({ screen: 'home' })}
      />
    );
  }

  if (view.screen === 'progress') {
    return (
      <StudentProgress
        user={user}
        demoMode={demoMode}
        onBack={() => setView({ screen: 'home' })}
      />
    );
  }

  // ?? ? ?? ????????????????????????????????????????????
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-medium">텍스트</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ?? */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-1">
            ?????, {user.name}?! ??
          </h1>
          <p className="text-text-secondary">텍스트</p>
        </div>

        {/* ?? ?? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setView({ screen: 'setup' })}
            className="group flex flex-col items-start p-8 bg-gradient-primary text-white rounded-3xl shadow-medium hover:shadow-glow transition-all hover:scale-105"
          >
            <div className="text-4xl mb-4">텍스트</div>
            <h2 className="text-2xl font-bold mb-2">텍스트</h2>
            <p className="text-white/80">AI ??? 1:1 ??? ????</p>
          </button>

          <button
            onClick={() => setView({ screen: 'progress' })}
            className="group flex flex-col items-start p-8 bg-gradient-secondary text-white rounded-3xl shadow-medium hover:shadow-glow transition-all hover:scale-105"
          >
            <div className="text-4xl mb-4">텍스트</div>
            <h2 className="text-2xl font-bold mb-2">텍스트</h2>
            <p className="text-white/80">텍스트</p>
          </button>
        </div>

        {/* ?? ?? */}
        <div className="bg-white rounded-3xl shadow-soft p-6 mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">텍스트</h2>
          {debates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">텍스트</p>
              <p className="text-text-secondary">텍스트</p>
              <button
                onClick={() => setView({ screen: 'setup' })}
                className="mt-4 px-6 py-3 bg-gradient-primary text-white rounded-full font-semibold hover:shadow-glow transition-all"
              >
                버튼
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {debates.slice(0, 5).map((debate: any) => (
                <div key={debate.id} className="flex items-center justify-between p-4 bg-background rounded-2xl">
                  <div>
                    <p className="font-semibold text-text-primary">{debate.topicTitle}</p>
                    <p className="text-sm text-text-secondary">
                      {debate.position} � {new Date(debate.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    debate.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {debate.status === 'completed' ? '??' : '???'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ?? ?? ?? */}
        {topics.length > 0 && (
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">텍스트</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topics.slice(0, 3).map((topic: any) => (
                <button
                  key={topic.id}
                  onClick={() => setView({ screen: 'setup' })}
                  className="text-left p-4 border-2 border-border rounded-2xl hover:border-primary transition-all"
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${
                    topic.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {topic.difficulty === 'easy' ? '??' : topic.difficulty === 'medium' ? '??' : '???'}
                  </span>
                  <p className="font-semibold text-text-primary text-sm">{topic.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
