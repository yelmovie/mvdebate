'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Settings, Users, Key, BookOpen,
  Save, RefreshCw, Edit, Trash2, Plus, Check, X,
  AlertCircle, Clock, Calendar, Trophy, BarChart3
} from 'lucide-react';
import { apiCall } from '../../lib/api';

interface ClassData {
  id: string;
  name: string;
  classCode: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  debatesCount: number;
  averageScore: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
}

interface ClassSettingsProps {
  onBack: () => void;
  classData: ClassData;
  students: Student[];
  onClassUpdate: (updatedClass: ClassData) => void;
  demoMode?: boolean;
  showAlert: (message: string, type?: string) => void;
}

const demoTopics: Topic[] = [
  {
    id: 't1',
    title: '?? ??? ?? ??? ??? ??',
    description: '??? ??? ??? ?? ??',
    difficulty: '??',
    category: '????',
  },
  {
    id: 't2',
    title: '???? ???? ??? ???? ??',
    description: '?? ????? ??? ?? ??',
    difficulty: '??',
    category: '??',
  },
  {
    id: 't3',
    title: '?? ??? ???? ?? ??? ??? ????',
    description: '?? ??? ?? ??? ??? ??',
    difficulty: '???',
    category: '??',
  },
];

const debateSettings = {
  autoAssignTopics: false,
  requirePreparation: true,
  minDebateTime: 5,
  maxDebateTime: 30,
  enableNotifications: true,
  showRankings: true,
};

type ActiveTab = 'info' | 'students' | 'topics' | 'settings';

export default function ClassSettings({
  onBack,
  classData,
  students: initialStudents,
  onClassUpdate,
  demoMode = false,
  showAlert,
}: ClassSettingsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [className, setClassName] = useState(classData.name);
  const [isEditing, setIsEditing] = useState(false);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [topics, setTopics] = useState<Topic[]>(demoMode ? demoTopics : []);
  const [settings, setSettings] = useState(debateSettings);
  const [loading, setLoading] = useState(false);
  const [showResetCodeConfirm, setShowResetCodeConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [classCode, setClassCode] = useState(classData.classCode);

  async function handleSaveName() {
    if (!className.trim()) {
      showAlert('? ??? ??????.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (!demoMode) {
        await apiCall(`/classes/${classData.id}`, { method: 'PATCH', body: { name: className } });
      }
      onClassUpdate({ ...classData, name: className });
      showAlert('? ??? ???????.', 'success');
      setIsEditing(false);
    } catch (err: any) {
      showAlert(err.message || '??? ??????.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetCode() {
    setLoading(true);
    try {
      if (!demoMode) {
        const data = await apiCall(`/classes/${classData.id}/reset-code`, { method: 'POST' });
        setClassCode(data.classCode);
      } else {
        setClassCode(Math.random().toString(36).substring(2, 8).toUpperCase());
      }
      showAlert('???? ????????.', 'success');
      setShowResetCodeConfirm(false);
    } catch (err: any) {
      showAlert(err.message || '??? ???? ??????.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStudent(student: Student) {
    setLoading(true);
    try {
      if (!demoMode) {
        await apiCall(`/classes/${classData.id}/students/${student.id}`, { method: 'DELETE' });
      }
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      showAlert('??? ???????.', 'success');
      setStudentToDelete(null);
    } catch (err: any) {
      showAlert(err.message || '?? ??? ??????.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    setLoading(true);
    try {
      if (!demoMode) {
        await apiCall(`/classes/${classData.id}/settings`, { method: 'PATCH', body: settings });
      }
      showAlert('??? ???????.', 'success');
    } catch (err: any) {
      showAlert(err.message || '?? ??? ??????.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const avgScore =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
      : 0;

  const tabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'info', label: '?? ??', icon: Settings },
    { id: 'students', label: `?? ?? (${students.length})`, icon: Users },
    { id: 'topics', label: `?? ?? (${topics.length})`, icon: BookOpen },
    { id: 'settings', label: '?? ??', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-base p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            ????
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">{classData.name} ??</h1>
            <p className="text-text-secondary mt-1">? ??? ??? ?????.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-soft border-2 border-border overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm whitespace-nowrap ${
                activeTab === id
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Class Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-primary">?? ??</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                  >
                    <Edit className="w-4 h-4" />
                    ??
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">? ??</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={loading}
                        className="px-4 py-3 bg-gradient-primary text-white rounded-2xl font-semibold flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        ??
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setClassName(classData.name); }}
                        className="px-4 py-3 border-2 border-border rounded-2xl text-text-secondary hover:border-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-text-primary font-semibold text-lg">{className}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">???</label>
                  <p className="text-text-primary font-semibold">
                    {new Date(classData.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Code Card */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  ? ??
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 text-center border-2 border-primary/20">
                  <p className="text-4xl font-extrabold text-primary tracking-widest">{classCode}</p>
                  <p className="text-sm text-text-secondary mt-2">???? ??? ? ???? ??</p>
                </div>
                <button
                  onClick={() => setShowResetCodeConfirm(true)}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-border rounded-2xl text-text-secondary hover:border-red-300 hover:text-red-500 transition-colors font-semibold text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  ???
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, color: 'blue', label: '?? ?', value: `${students.length}?` },
                { icon: BookOpen, color: 'green', label: '?? ?', value: `${topics.length}?` },
                { icon: Trophy, color: 'orange', label: '?? ??', value: `${avgScore}?` },
                { icon: BarChart3, color: 'purple', label: '? ??', value: `${students.reduce((a, s) => a + s.debatesCount, 0)}?` },
              ].map(({ icon: Icon, color, label, value }) => (
                <div key={label} className={`bg-${color}-50 rounded-2xl p-4 border border-${color}-200`}>
                  <Icon className={`w-5 h-5 text-${color}-600 mb-2`} />
                  <p className={`text-sm font-semibold text-${color}-600`}>{label}</p>
                  <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <h2 className="text-lg font-bold text-text-primary mb-4">?? ??</h2>
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-30" />
                  <p className="text-text-secondary">??? ??? ????.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-text-primary">{student.name}</p>
                        <p className="text-xs text-text-secondary">{student.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{student.averageScore}?</p>
                        <p className="text-xs text-text-secondary">{student.debatesCount}? ??</p>
                      </div>
                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="p-2 text-text-secondary hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <h2 className="text-lg font-bold text-text-primary mb-4">?? ?? ??</h2>
              {topics.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-30" />
                  <p className="text-text-secondary">??? ?? ??? ????.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 bg-gray-50 rounded-2xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-text-primary">{topic.title}</p>
                          <p className="text-sm text-text-secondary mt-1">{topic.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              topic.difficulty === '??'
                                ? 'bg-green-100 text-green-700'
                                : topic.difficulty === '???'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {topic.difficulty}
                            </span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                              {topic.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <h2 className="text-lg font-bold text-text-primary mb-6">?? ??</h2>
              <div className="space-y-6">
                {/* Toggle Settings */}
                {[
                  { key: 'autoAssignTopics', label: '?? ?? ??', desc: '????? ???? ?? ??? ?????.' },
                  { key: 'requirePreparation', label: '?? ?? ??', desc: '?? ?? ? ?? ??? ??? ???.' },
                  { key: 'enableNotifications', label: '?? ???', desc: '????? ?? ??? ?????.' },
                  { key: 'showRankings', label: '?? ??', desc: '????? ?? ??? ?????.' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{label}</p>
                      <p className="text-sm text-text-secondary">{desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings[key as keyof typeof settings] ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        settings[key as keyof typeof settings] ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}

                {/* Time Settings */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="font-semibold text-text-primary mb-1">?? ?? ??</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSettings((p) => ({ ...p, minDebateTime: Math.max(1, p.minDebateTime - 1) }))}
                        className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-primary">{settings.minDebateTime}?</span>
                      <button
                        onClick={() => setSettings((p) => ({ ...p, minDebateTime: Math.min(p.maxDebateTime - 1, p.minDebateTime + 1) }))}
                        className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">?? ?? ??</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSettings((p) => ({ ...p, maxDebateTime: Math.max(p.minDebateTime + 1, p.maxDebateTime - 1) }))}
                        className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-secondary">{settings.maxDebateTime}?</span>
                      <button
                        onClick={() => setSettings((p) => ({ ...p, maxDebateTime: Math.min(120, p.maxDebateTime + 1) }))}
                        className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 mt-4"
                >
                  <Save className="w-4 h-4" />
                  ?? ??
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Code Confirm Modal */}
      {showResetCodeConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <h3 className="text-xl font-bold text-text-primary">??? ???</h3>
            </div>
            <p className="text-text-secondary mb-6">
              ???? ????? ?? ???? ??? ? ?? ???. ??? ???? ??? ? ????. ?????????
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetCodeConfirm(false)}
                className="flex-1 py-3 border-2 border-border rounded-2xl text-text-secondary font-semibold"
              >
                ??
              </button>
              <button
                onClick={handleResetCode}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-2xl font-semibold"
              >
                ???
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirm Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-text-primary">?? ??</h3>
            </div>
            <p className="text-text-secondary mb-6">
              ??? <span className="font-bold text-text-primary">{studentToDelete.name}</span> ??? ????????? ??? ?? ?? ??? ?????. ? ??? ??? ? ????.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-3 border-2 border-border rounded-2xl text-text-secondary font-semibold"
              >
                ??
              </button>
              <button
                onClick={() => handleDeleteStudent(studentToDelete)}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-2xl font-semibold"
              >
                ??
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
