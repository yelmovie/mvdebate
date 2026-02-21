import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, Book, MessageCircle, 
  Send, ChevronDown, ChevronUp, Mail, Phone,
  Video, FileText, Search, Sparkles, CheckCircle,
  ExternalLink, Users, MessageSquare, Trophy, Gift, Clock
} from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';

// Import guide images
import guideImage1 from '../../assets/fbbf591d2e95255cd3c366946428f2124f23357b.png';
import guideImage2 from '../../assets/7c2184a70d34b269209b60160e62f89f8b1f0464.png';
import guideImage3 from '../../assets/fa505c099939a6c5d547044525a859bda932c97e.png';
import guideImage4 from '../../assets/41a7478657fa8443aacfd763b28c8d54153cf987.png';
import guideImage5 from '../../assets/09e816ac9bd7d4d76b1a249831921a22523dcab9.png';
import guideImage6 from '../../assets/db4c67c55cd3e8140ce382d51b8a0c48fc00e718.png';

interface HelpSupportProps {
  onBack: () => void;
  demoMode?: boolean;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
}

export default function HelpSupport({ onBack, demoMode = false }: HelpSupportProps) {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'contact'>('guide');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);

  const faqCategories = [
    { id: 'all', name: '전체', icon: HelpCircle },
    { id: 'getting-started', name: '시작하기', icon: Book },
    { id: 'students', name: '학생 관리', icon: Users },
    { id: 'debates', name: '토론 진행', icon: MessageSquare },
    { id: 'scoring', name: '평가 & 점수', icon: Trophy },
    { id: 'rewards', name: '보상 & 쿠폰', icon: Gift }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'getting-started',
      question: '학급을 어떻게 만들고 학생을 초대하나요?',
      answer: '대시보드의 "새 학급" 버튼을 클릭하여 학급 이름을 입력하면 자동으로 반코드가 생성됩니다. 학생들에게 이 반코드를 공유하면 학생들이 가입 시 해당 코드를 입력하여 학급에 참여할 수 있습니다. 또는 "학생 추가" 버튼을 통해 직접 학생을 등록할 수도 있습니다.',
      helpful: 45
    },
    {
      id: 'faq-2',
      category: 'getting-started',
      question: '반코드를 분실했어요. 어떻게 확인하나요?',
      answer: '대시보드 상단의 학급 선택 영역에서 원하는 학급을 선택하면 큰 네온 스타일로 반코드가 표시됩니다. 학급 설정 메뉴에서도 확인할 수 있으며, 필요시 반코드를 재생성할 수도 있습니다.',
      helpful: 38
    },
    {
      id: 'faq-3',
      category: 'students',
      question: '학생을 일괄로 추가할 수 있나요?',
      answer: '네, 가능합니다! "학생 추가" 버튼을 클릭한 후 "일괄 추가" 탭을 선택하면 여러 학생의 이름을 한 번에 입력할 수 있습니다. 한 줄에 한 명씩 이름을 입력하면 자동으로 계정이 생성됩니다.',
      helpful: 52
    },
    {
      id: 'faq-4',
      category: 'students',
      question: '학생이 비밀번호를 잊어버렸다고 해요.',
      answer: '학생이 로그인 화면에서 "비밀번호 찾기"를 클릭하거나, 선생님이 학급 설정 > 학생 관리에서 해당 학생의 비밀번호를 재설정할 수 있습니다. 재설정된 임시 비밀번호는 학생에게 전달해주세요.',
      helpful: 41
    },
    {
      id: 'faq-5',
      category: 'debates',
      question: '토론 주제는 어떻게 추가하나요?',
      answer: '"주제 관리" 메뉴에서 새로운 토론 주제를 추가할 수 있습니다. 주제 제목, 설명, 난이도, 카테고리를 입력하면 학생들이 해당 주제로 토론을 진행할 수 있습니다. 시스템에서 제공하는 기본 주제도 활용 가능합니다.',
      helpful: 49
    },
    {
      id: 'faq-6',
      category: 'debates',
      question: 'AI가 어떻게 학생을 평가하나요?',
      answer: 'OpenAI GPT-4o-mini가 토론 중 학생의 논리성, 근거 제시, 반론 대응, 언어 사용 등을 실시간으로 분석합니다. 토론이 끝나면 각 항목별 점수와 함께 구체적인 피드백을 제공하며, 강점과 개선점을 상세히 안내합니다.',
      helpful: 67
    },
    {
      id: 'faq-7',
      category: 'debates',
      question: '학생이 토론 중 부적절한 내용을 말하면 어떻게 되나요?',
      answer: 'AI가 부적절한 언어나 내용을 감지하면 자동으로 경고를 표시하고, 적절한 표현 방법을 안내합니다. 심각한 경우 토론이 중단될 수 있으며, 선생님께 알림이 전송됩니다.',
      helpful: 34
    },
    {
      id: 'faq-8',
      category: 'scoring',
      question: '점수 기준은 무엇인가요?',
      answer: '토론 점수는 논리성(30%), 근거 제시(25%), 반론 대응(20%), 표현력(15%), 참여도(10%)로 구성됩니다. 각 항목은 AI가 객관적으로 평가하며, 선생님이 추가로 코멘트를 남길 수도 있습니다.',
      helpful: 58
    },
    {
      id: 'faq-9',
      category: 'scoring',
      question: '학생의 점수를 수정할 수 있나요?',
      answer: '네, 선생님은 학생 진행 상황 메뉴에서 AI 평가 점수를 검토하고 필요시 조정할 수 있습니다. 다만 AI의 객관적 평가를 존중하되, 특별한 상황이 있을 경우에만 수정하는 것을 권장합니다.',
      helpful: 29
    },
    {
      id: 'faq-10',
      category: 'rewards',
      question: '쿠폰은 어떻게 발행하나요?',
      answer: '"보상/쿠폰 지급" 메뉴에서 쿠폰 이름, 설명, 유효기간을 입력하고 대상 학생을 선택하면 즉시 발행됩니다. 학생들은 자신의 대시보드에서 받은 쿠폰을 확인할 수 있습니다.',
      helpful: 43
    },
    {
      id: 'faq-11',
      category: 'rewards',
      question: '우수 학생을 자동으로 선정할 수 있나요?',
      answer: '네! 쿠폰 발행 시 "자동 선정" 옵션을 선택하면 최근 성적, 참여도, 개선도 등을 기준으로 상위 학생들을 자동으로 선정할 수 있습니다. 기준은 커스터마이징이 가능합니다.',
      helpful: 36
    }
  ];

  const guideImages = [
    {
      id: 'guide-1',
      title: 'AI랑 토론해봐',
      description: '무비샘 AI토론웹앱과 함께하는 모의토론',
      image: guideImage1,
      color: 'from-coral-orange/20 to-coral-orange/10 border-coral-orange/30'
    },
    {
      id: 'guide-2',
      title: '이럴 때 필요해요!',
      description: '토론 수업 사전 연습부터 교사용 수업 준비까지',
      image: guideImage2,
      color: 'from-mint-green/20 to-mint-green/10 border-mint-green/30'
    },
    {
      id: 'guide-3',
      title: 'AI 토론, 캐릭터와 함께',
      description: '친근한 캐릭터가 토론 상황을 더 재미있게 만들어요',
      image: guideImage3,
      color: 'from-sunflower-yellow/20 to-sunflower-yellow/10 border-sunflower-yellow/30'
    },
    {
      id: 'guide-4',
      title: '쉽고 친근한 토론 환경',
      description: 'AI와 함께하는 친근한 인터페이스로 편하게 토론해요',
      image: guideImage4,
      color: 'from-primary/20 to-primary/10 border-primary/30'
    },
    {
      id: 'guide-5',
      title: '토론과정을 쉽게 보여줘요!',
      description: '주제 선택부터 피드백 확인까지 한눈에',
      image: guideImage5,
      color: 'from-secondary/20 to-secondary/10 border-secondary/30'
    },
    {
      id: 'guide-6',
      title: '자유로운 토론 분위기',
      description: '아이들의 생각의 깊이를 더하는 친근한 환경',
      image: guideImage6,
      color: 'from-accent/20 to-accent/10 border-accent/30'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function handleSubmitContact(e: React.FormEvent) {
    e.preventDefault();

    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      showAlert('모든 필드를 입력해주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        showAlert('문의가 성공적으로 전송되었습니다. 24시간 내에 답변 드리겠습니다.', 'success');
        setContactForm({ name: '', email: '', subject: '', message: '', category: 'general' });
        setLoading(false);
        return;
      }

      await apiCall('/support/contact', {
        method: 'POST',
        body: JSON.stringify(contactForm)
      });

      showAlert('문의가 성공적으로 전송되었습니다. 24시간 내에 답변 드리겠습니다.', 'success');
      setContactForm({ name: '', email: '', subject: '', message: '', category: 'general' });
    } catch (error: any) {
      showAlert(error.message || '문의 전송에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-accent"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-primary"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-text-secondary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">도움말 & 지원</h1>
                  <p className="text-sm text-text-secondary">사용 가이드와 문의하기</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'guide'
                    ? 'bg-gradient-primary text-white shadow-medium'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
                }`}
              >
                <Book className="w-4 h-4" />
                사용 가이드
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'faq'
                    ? 'bg-gradient-secondary text-white shadow-medium'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-secondary'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                자주 묻는 질문
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'contact'
                    ? 'bg-gradient-accent text-white shadow-medium'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-accent'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                문의하기
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-in-up">
            {/* Guide Tab */}
            {activeTab === 'guide' && (
              <div className="space-y-6">
                {/* Quick Start */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 shadow-soft">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900">빠른 시작</h3>
                      <p className="text-sm text-blue-700">첫 토론까지 3단계만 거치면 됩니다</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <h4 className="font-bold text-text-primary mb-2">학급 만들기</h4>
                      <p className="text-sm text-text-secondary">학급 이름만 입력하면 자동으로 반코드가 생성됩니다</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4">
                      <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <h4 className="font-bold text-text-primary mb-2">학생 초대</h4>
                      <p className="text-sm text-text-secondary">반코드를 공유하거나 직접 학생을 등록하세요</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4">
                      <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <h4 className="font-bold text-text-primary mb-2">토론 시작</h4>
                      <p className="text-sm text-text-secondary">주제를 선택하면 AI와 토론이 시작됩니다</p>
                    </div>
                  </div>
                </div>

                {/* Guide Images */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <Book className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-text-primary">사용 가이드</h3>
                    <span className="ml-2 text-sm text-text-secondary">AI와 토론해요! 완벽 가이드</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guideImages.map((guide) => (
                      <div 
                        key={guide.id}
                        className={`group bg-gradient-to-br ${guide.color} rounded-3xl overflow-hidden border-2 hover:shadow-large transition-all duration-300 hover:-translate-y-1`}
                      >
                        <div className="p-2">
                          <div className="relative rounded-2xl overflow-hidden">
                            <img 
                              src={guide.image} 
                              alt={guide.title}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-white/60 backdrop-blur-sm">
                          <h4 className="font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">{guide.title}</h4>
                          <p className="text-sm text-text-secondary leading-relaxed">{guide.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="질문을 검색하세요..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors text-lg"
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
                    {filteredFAQs.map((faq) => (
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
                            <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
                          )}
                        </button>
                        
                        {expandedFAQ === faq.id && (
                          <div className="px-4 pb-4 animate-fade-in-up">
                            <div className="pl-8 pt-2 border-t-2 border-border">
                              <p className="text-text-secondary mb-4">{faq.answer}</p>
                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold">
                                  <CheckCircle className="w-4 h-4" />
                                  도움이 되었어요 ({faq.helpful})
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {filteredFAQs.length === 0 && (
                      <div className="text-center py-12">
                        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-text-secondary">검색 결과가 없습니다</p>
                        <p className="text-sm text-text-secondary mt-2">다른 검색어를 시도하거나 문의하기를 이용해주세요</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                    <h3 className="text-lg font-bold text-text-primary mb-6">문의 보내기</h3>
                    
                    <form onSubmit={handleSubmitContact} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">
                          이름 *
                        </label>
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
                          placeholder="이름을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">
                          이메일 *
                        </label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">
                          문의 유형 *
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
                        >
                          <option value="general">일반 문의</option>
                          <option value="technical">기술 지원</option>
                          <option value="account">계정 문제</option>
                          <option value="feature">기능 제안</option>
                          <option value="bug">버그 신고</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">
                          제목 *
                        </label>
                        <input
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
                          placeholder="문의 제목을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">
                          문의 내용 *
                        </label>
                        <textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors resize-none"
                          placeholder="문의 내용을 상세히 입력해주세요"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-semibold disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                        {loading ? '전송 중...' : '문의 보내기'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-6 border-2 border-primary/20 shadow-soft">
                    <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      연락처
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">이메일</p>
                          <p className="text-sm font-semibold text-text-primary">support@aidebate.app</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                          <Phone className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">전화</p>
                          <p className="text-sm font-semibold text-text-primary">02-1234-5678</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">운영 시간</p>
                          <p className="text-sm font-semibold text-text-primary">평일 09:00 - 18:00</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-6 border-2 border-yellow-200 shadow-soft">
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      💡 문의 전 확인사항
                    </h3>
                    <ul className="space-y-2 text-sm text-yellow-800">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>FAQ에서 답변을 먼저 찾아보세요</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>스크린샷을 첨부하면 더 빠른 해결이 가능합니다</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>평균 응답 시간은 24시간 이내입니다</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200 shadow-soft">
                    <h3 className="font-bold text-green-900 mb-3">✨ 빠른 응답을 원하시나요?</h3>
                    <p className="text-sm text-green-800 mb-4">
                      실시간 채팅 상담을 이용하시면 즉시 답변을 받으실 수 있습니다.
                    </p>
                    <button className="w-full px-4 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold">
                      실시간 채팅 시작하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
