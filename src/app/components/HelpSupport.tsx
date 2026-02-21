'use client';

import { useState } from 'react';
import {
  HelpCircle, Book, MessageSquare, Trophy, Zap,
  Search, ChevronDown, ChevronUp, ExternalLink,
  FileText, Video, Sparkles, Mail, Phone, Clock,
  CheckCircle, ArrowRight, Star, Users, BarChart3
} from 'lucide-react';

interface HelpSupportProps {
  userRole?: 'teacher' | 'student';
  onBack?: () => void;
}

const faqCategories = [
  { id: 'all', name: '전체', icon: HelpCircle },
  { id: 'getting-started', name: '시작하기', icon: Book },
  { id: 'debates', name: '토론 진행', icon: MessageSquare },
  { id: 'scoring', name: '평가 & 점수', icon: Trophy },
  { id: 'account', name: '계정 & 설정', icon: Zap },
];

const faqData = [
  {
    id: 1,
    category: 'getting-started',
    question: 'MVDEBATE는 어떻게 시작하나요?',
    answer: '교사로 회원가입 후 반을 만들고, 학생들에게 참여 코드를 공유하면 됩니다. 학생들은 코드로 입장하여 바로 토론에 참여할 수 있습니다.',
  },
  {
    id: 2,
    category: 'getting-started',
    question: '학생은 별도로 가입해야 하나요?',
    answer: '아니요. 학생은 교사가 제공한 6자리 참여 코드만 있으면 이름을 입력하고 바로 토론에 참여할 수 있습니다. 별도 계정이 필요 없습니다.',
  },
  {
    id: 3,
    category: 'debates',
    question: '토론은 어떻게 진행되나요?',
    answer: '교사가 주제를 설정하고 토론을 시작합니다. 학생들은 찬성/반대 입장을 선택하고 발언합니다. AI가 실시간으로 내용을 분석하고 점수를 부여합니다.',
  },
  {
    id: 4,
    category: 'debates',
    question: '토론 시간은 어떻게 설정하나요?',
    answer: '토론 생성 시 준비, 발언, 마무리 시간을 각각 설정할 수 있습니다. 기본값은 준비 5분, 발언 20분, 마무리 5분입니다.',
  },
  {
    id: 5,
    category: 'scoring',
    question: 'AI 점수는 어떻게 계산되나요?',
    answer: 'AI가 발언의 논리성, 근거의 타당성, 언어 표현력, 상대 의견 존중도 등을 종합적으로 평가합니다. 각 항목은 0-100점 척도로 평가됩니다.',
  },
  {
    id: 6,
    category: 'scoring',
    question: '점수를 수동으로 수정할 수 있나요?',
    answer: '네, 교사는 AI 평가 후 직접 점수를 조정할 수 있습니다. 피드백도 수정 가능하며, 변경 사항은 학생 리포트에 반영됩니다.',
  },
  {
    id: 7,
    category: 'account',
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하고 가입 이메일을 입력하세요. 재설정 링크가 이메일로 발송됩니다.',
  },
  {
    id: 8,
    category: 'account',
    question: '여러 반을 동시에 운영할 수 있나요?',
    answer: '네, 하나의 교사 계정으로 여러 반을 만들고 관리할 수 있습니다. 각 반은 독립적으로 운영되며 별도의 참여 코드를 갖습니다.',
  },
];

const guideSteps = [
  { step: 1, title: '교사 회원가입', desc: '이메일로 교사 계정을 만들어 주세요.' },
  { step: 2, title: '반 만들기', desc: '대시보드에서 새 반을 생성하세요.' },
  { step: 3, title: '코드 공유', desc: '학생들에게 6자리 참여 코드를 알려주세요.' },
  { step: 4, title: '토론 시작', desc: '주제를 설정하고 토론을 시작하세요.' },
];

export default function HelpSupport({ userRole = 'teacher', onBack }: HelpSupportProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'contact' | 'docs'>('guide');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    type: 'general',
    message: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg-base p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              돌아가기
            </button>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">도움말 & 지원</h1>
            <p className="text-text-secondary mt-1">MVDEBATE 사용에 도움이 필요하신가요?</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-soft border-2 border-border">
          {[
            { id: 'guide', label: '이용 가이드', icon: Book },
            { id: 'faq', label: '자주 묻는 질문', icon: HelpCircle },
            { id: 'contact', label: '문의하기', icon: Mail },
            { id: 'docs', label: '문서 & 자료', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                activeTab === id
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">빠른 시작 가이드</h2>
                  <p className="text-sm text-text-secondary">AI 토론이요! 완벽 가이드</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {guideSteps.map(({ step, title, desc }) => (
                  <div key={step} className="text-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">{step}</span>
                    </div>
                    <h3 className="font-bold text-text-primary text-sm mb-1">{title}</h3>
                    <p className="text-xs text-text-secondary">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, color: 'blue', title: 'AI 토론 시스템', desc: '실시간 AI 분석으로 토론의 질을 높여보세요.' },
                { icon: BarChart3, color: 'green', title: '성장 분석', desc: '학생별 토론 이력과 발전 추이를 확인하세요.' },
                { icon: Star, color: 'orange', title: '자동 평가', desc: 'AI가 논리성, 근거, 표현력을 자동으로 평가합니다.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className={`bg-${color}-50 rounded-2xl p-5 border border-${color}-200`}>
                  <Icon className={`w-8 h-8 text-${color}-600 mb-3`} />
                  <h3 className="font-bold text-text-primary mb-2">{title}</h3>
                  <p className="text-sm text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="질문을 검색하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-border rounded-2xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-primary text-white shadow-medium'
                          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQ List */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <div className="space-y-3">
                {filteredFAQs.length === 0 ? (
                  <p className="text-center text-text-secondary py-8">검색 결과가 없습니다</p>
                ) : (
                  filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border-2 border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-bold text-text-primary mb-1">{faq.question}</h4>
                            {expandedFAQ !== faq.id && (
                              <p className="text-sm text-text-secondary line-clamp-1">{faq.answer}</p>
                            )}
                          </div>
                        </div>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-text-secondary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-4 pb-4">
                          <div className="pl-8 pt-2 border-t border-border">
                            <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {submitted ? (
              <div className="bg-white rounded-3xl p-12 shadow-soft border-2 border-border text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">문의가 접수되었습니다!</h2>
                <p className="text-text-secondary">평균 24시간 이내에 답변 드리겠습니다.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-3 bg-gradient-primary text-white rounded-2xl font-semibold"
                >
                  새 문의 작성
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                <h3 className="text-lg font-bold text-text-primary mb-6">문의 보내기</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">이메일</label>
                    <input
                      type="email"
                      required
                      placeholder="답변 받을 이메일"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">문의 유형</label>
                    <select
                      value={contactForm.type}
                      onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
                    >
                      <option value="general">일반 문의</option>
                      <option value="feature">기능 제안</option>
                      <option value="bug">버그 신고</option>
                      <option value="account">계정 문제</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">제목</label>
                    <input
                      type="text"
                      required
                      placeholder="문의 제목을 입력하세요"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">내용</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="문의 내용을 자세히 입력해주세요"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-border rounded-2xl focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-primary text-white rounded-2xl font-semibold disabled:opacity-70"
                  >
                    {loading ? '전송 중...' : '문의 보내기'}
                  </button>
                </form>
              </div>
            )}

            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Mail, label: '이메일', value: 'support@mvdebate.com' },
                { icon: Phone, label: '전화', value: '02-1234-5678' },
                { icon: Clock, label: '운영 시간', value: '평일 09:00-18:00' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-soft border-2 border-border text-center">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-xs text-text-secondary">{label}</p>
                  <p className="font-semibold text-text-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Docs Tab */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
              <h3 className="text-lg font-bold text-text-primary mb-6">문서 & 자료</h3>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: FileText, color: 'text-primary', title: '사용자 매뉴얼', desc: '전체 기능 설명' },
                  { icon: Book, color: 'text-secondary', title: '교사 가이드', desc: '수업 활용법' },
                  { icon: Video, color: 'text-accent', title: '동영상 튜토리얼', desc: '단계별 영상 강의' },
                  { icon: Sparkles, color: 'text-primary', title: '활용 팁 & 사례', desc: '우수 수업 사례' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <a
                    key={title}
                    href="#"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <div>
                        <span className="font-semibold text-text-primary">{title}</span>
                        <p className="text-xs text-text-secondary">{desc}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-6 border border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-text-primary">빠른 도움말 팁</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'FAQ에서 먼저 찾아보세요.',
                  '평균 응답 시간은 24시간 이내입니다.',
                  '이메일 문의 시 교사 계정 이메일을 함께 알려주세요.',
                  '버그 신고 시 스크린샷을 첨부하면 더 빠른 처리가 가능합니다.',
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
