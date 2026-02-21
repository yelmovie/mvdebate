import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';
import { 
  ArrowLeft, Send, CheckCircle2, MessageSquare, TrendingUp,
  Sparkles, Target, Shield, Zap, AlertCircle
} from 'lucide-react';
import tailQuestionBoraAvatar from '../../assets/35e86e2eb84d01ead86eb1d16e66cf9e3992e0fb.png';
import praiseKingJuhoAvatar from '../../assets/80ee08a35862e871df6180d357efe4b9d58d314a.png';
import argumentMasterCheolsuAvatar from '../../assets/23d3f1087a3b105d457f7e8aa2bf4a95dd184e72.png';
import rebuttalExpertMinhoAvatar from '../../assets/64001235b26be6eedde43a65d5595e600ef518e6.png';
import ironLogicJihoAvatar from '../../assets/93e83e5d738ea14e776b197ad423da662e09f456.png';
import firmPumpkinDahyeAvatar from '../../assets/05ecfb10ee36955a35457baef561f42e1c5d21ed.png';
import bestFriendSoyoungAvatar from '../../assets/72a33d43ec544b8f8530efda53c1f94fc2406ecf.png';
import calmSujeongAvatar from '../../assets/c3b94bc5fad1208a7165f11b32730145fd05ce54.png';
import factCollectorWoojinAvatar from '../../assets/fe00634207f10e23fa30f779b0b8e3f28684799e.png';
import kindYoungheeAvatar from '../../assets/a43a056f1cc854ceaf042d30d2a39facf5cfc1cf.png';

// Character definitions
const CHARACTERS = {
  tail_question_bora: { 
    name: '꼬리질문보라', 
    emoji: '🤔', 
    avatar: tailQuestionBoraAvatar,
    personality: '호기심 많은',
    description: '끊임없이 질문하며 생각을 깊게 만드는 친구'
  },
  argument_master_cheolsu: { 
    name: '말싸움잘하는철수', 
    emoji: '🔥', 
    avatar: argumentMasterCheolsuAvatar,
    personality: '열정적인',
    description: '강력한 논리로 설득하는 토론 전문가'
  },
  rebuttal_expert_minho: { 
    name: '반박장인민호', 
    emoji: '⚡', 
    avatar: rebuttalExpertMinhoAvatar,
    personality: '날카로운',
    description: '빈틈없는 반박으로 논리를 다지는 친구'
  },
  iron_logic_jiho: { 
    name: '철벽논리지호', 
    emoji: '🛡️', 
    avatar: ironLogicJihoAvatar,
    personality: '철저한',
    description: '논리적 오류를 찾아내는 분석가'
  },
  praise_king_juho: { 
    name: '칭찬왕주호', 
    emoji: '👏', 
    avatar: praiseKingJuhoAvatar,
    personality: '긍정적인',
    description: '좋은 점을 찾아 격려하는 응원단장'
  },
  firm_dahye: { 
    name: '단호박다혜', 
    emoji: '💪', 
    avatar: firmPumpkinDahyeAvatar,
    personality: '단호한',
    description: '명확한 입장으로 토론하는 친구'
  },
  best_friend_soyoung: { 
    name: '베스트프랜드소영', 
    emoji: '🌟', 
    avatar: bestFriendSoyoungAvatar,
    personality: '친근한',
    description: '편안하게 대화를 이끄는 베프'
  },
  calm_sujeong: { 
    name: '침착한수정', 
    emoji: '😌', 
    avatar: calmSujeongAvatar,
    personality: '차분한',
    description: '냉정하게 분석하는 토론 파트너'
  },
  fact_collector_woojin: { 
    name: '팩트수집가우진', 
    emoji: '📊', 
    avatar: factCollectorWoojinAvatar,
    personality: '분석적인',
    description: '데이터와 사실로 말하는 전문가'
  },
  kind_younghee: { 
    name: '친절한영희', 
    emoji: '😊', 
    avatar: kindYoungheeAvatar,
    personality: '상냥한',
    description: '부드럽게 대화를 이끄는 친구'
  },
};

interface DebateChatProps {
  debateId: string;
  debate: any;
  onComplete: () => void;
  onCancel: () => void;
  demoMode?: boolean;
  user?: any;
}

interface Message {
  role: 'student' | 'ai';
  content: string;
  timestamp: string;
}

// Debate stages
const DEBATE_STAGES = [
  { id: 1, label: '주장 제시', icon: Target },
  { id: 2, label: '근거 제시', icon: MessageSquare },
  { id: 3, label: '반론', icon: Shield },
  { id: 4, label: '반박', icon: Zap }
];

export default function DebateChat({ debateId, debate, onComplete, onCancel, demoMode = false, user }: DebateChatProps) {
  const { showAlert } = useAlert();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDebateComplete, setIsDebateComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_TURNS = 10;
  const aiCharacter = CHARACTERS[debate?.character as keyof typeof CHARACTERS] || CHARACTERS.tail_question_bora;
  
  // Calculate current stage based on message count
  const currentStage = Math.min(Math.floor(messageCount / 2) + 1, 4);
  const remainingTurns = MAX_TURNS - messageCount;

  useEffect(() => {
    loadDebateData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadDebateData() {
    try {
      if (demoMode) {
        // Mock greeting for demo mode
        const greetingContent = aiCharacter.name === '베스트프랜드소영'
          ? `안녕! 나는 ${aiCharacter.name}이야. ${debate.position === 'for' ? '반대' : '찬성'} 입장에서 토론할게. 😊\n\n"${debate.topicTitle}"에 대해 이야기해보자! 먼저 너의 생각 들려줄래?`
          : `안녕하세요! 저는 ${aiCharacter.name}입니다. ${debate.position === 'for' ? '반대' : '찬성'} 입장에서 토론하겠습니다. 😊\n\n"${debate.topicTitle}"에 대해 토론해봅시다. 먼저 당신의 주장을 들려주세요!`;
        
        const greeting = {
          role: 'ai' as const,
          content: greetingContent,
          timestamp: new Date().toISOString()
        };
        setMessages([greeting]);
        return;
      }
      
      const data = await apiCall(`/debates/${debateId}`);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        setMessageCount(data.messages.filter((m: Message) => m.role === 'student').length);
      } else {
        // Start with AI greeting
        const greetingContent = aiCharacter.name === '베스트프랜드소영'
          ? `안녕! 나는 ${aiCharacter.name}이야. ${debate.position === 'for' ? '반대' : '찬성'} 입장에서 토론할게. 😊\n\n"${debate.topicTitle}"에 대해 이야기해보자! 먼저 너의 생각 들려줄래?`
          : `안녕하세요! 저는 ${aiCharacter.name}입니다. ${debate.position === 'for' ? '반대' : '찬성'} 입장에서 토론하겠습니다. 😊\n\n"${debate.topicTitle}"에 대해 토론해봅시다. 먼저 당신의 주장을 들려주세요!`;
        
        const greeting = {
          role: 'ai' as const,
          content: greetingContent,
          timestamp: new Date().toISOString()
        };
        setMessages([greeting]);
      }
    } catch (error) {
      console.error('Error loading debate:', error);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMessage.trim() || loading || isDebateComplete || messageCount >= MAX_TURNS) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message immediately
    const newUserMessage: Message = {
      role: 'student',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setMessageCount(prev => prev + 1);

    try {
      if (demoMode) {
        // Mock AI response for demo mode
        setTimeout(() => {
          const aiResponses = [
            `흥미로운 주장이네요! 🤔 하지만 ${userMessage.includes('필요') ? '그렇지 않을 수도 있습니다' : '다른 관점도 고려해야 합니다'}. 구체적인 근거를 제시해주시겠습니까?`,
            `당신의 의견에는 일부 동의하지만, 반대 입장에서 보면 다른 문제들이 있습니다. 예를 들어, 이것이 실제로 효과적일까요? 💭`,
            `좋은 포인트입니다! ✨ 그러나 이것이 모든 상황에 적용될 수 있을까요? 예외적인 경우는 없을까요?`,
            `그 근거는 타당해 보입니다. 하지만 반대로 생각해보면 어떤 부작용이 있을 수 있을까요? 🔍`
          ];
          
          const aiMessage: Message = {
            role: 'ai',
            content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setLoading(false);
        }, 1500);
        return;
      }
      
      const data = await apiCall(`/debates/${debateId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: userMessage }),
      });

      console.log('Chat API response:', data);

      // Get updated messages
      const debateData = await apiCall(`/debates/${debateId}`);
      setMessages(debateData.messages);
      setMessageCount(debateData.messages.filter((m: Message) => m.role === 'student').length);
      
      // Check if debate is complete (10 turns reached)
      if (data.isLastTurn) {
        setIsDebateComplete(true);
        showAlert('토론이 완료되었습니다! 평가 단계로 이동합니다.', 'success');
        
        // Auto-complete after 3 seconds
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      showAlert(error.message || '메시지 전송에 실패했습니다. 다시 시도해주세요.', 'error');
      
      // Remove the failed user message on error
      setMessages(prev => prev.slice(0, -1));
      setMessageCount(prev => prev - 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    if (messageCount < 3) {
      setShowConfirmModal(true);
      return;
    }
    onComplete();
  }

  function handleConfirmFinish() {
    setShowConfirmModal(false);
    onComplete();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with Stage Progress */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4 gap-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">나가기</span>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-accent rounded-full shadow-soft">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-base">4단계: AI와 토론하기</span>
                </div>
                <div className={`px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap ${remainingTurns <= 3 ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'}`}>
                  {messageCount}/{MAX_TURNS}턴
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-semibold text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline">토론 완료</span>
                <span className="sm:hidden">완료</span>
              </button>
            </div>

            {/* Debate Stage Progress */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto">
              {DEBATE_STAGES.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = currentStage === stage.id;
                const isPassed = currentStage > stage.id;
                
                return (
                  <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full transition-all ${
                      isActive 
                        ? 'bg-gradient-primary text-white shadow-medium scale-105' 
                        : isPassed
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-muted text-text-secondary'
                    }`}>
                      <Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                      <span className="text-xs lg:text-sm font-semibold whitespace-nowrap">{stage.label}</span>
                    </div>
                    {index < DEBATE_STAGES.length - 1 && (
                      <div className={`w-4 lg:w-8 h-0.5 transition-colors ${
                        isPassed ? 'bg-secondary' : 'bg-border'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar: AI Character Profile - Desktop only */}
          <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-border hidden xl:flex flex-col flex-shrink-0">
            <div className="p-6 flex-1 flex flex-col items-center">
              {/* AI Avatar */}
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-strong border-4 border-white">
                  <img 
                    src={aiCharacter.avatar} 
                    alt={aiCharacter.name}
                    className={`w-full h-full object-cover ${loading ? 'animate-pulse-subtle' : ''}`}
                  />
                </div>
                {/* Emoji badge */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-medium border-2 border-background">
                  {aiCharacter.emoji}
                </div>
              </div>

              {/* Character Info */}
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">
                {aiCharacter.name}
              </h3>
              <div className="px-3 py-1 bg-gradient-accent rounded-full mb-3 shadow-soft">
                <span className="text-xs font-bold text-white">{aiCharacter.personality}</span>
              </div>
              <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
                {aiCharacter.description}
              </p>

              {/* Current Stance */}
              <div className="w-full mb-6">
                <div className={`px-4 py-3 rounded-2xl text-center ${
                  debate?.position === 'for' 
                    ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200' 
                    : 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
                }`}>
                  <p className="text-xs text-text-secondary mb-1">현재 입장</p>
                  <p className={`text-lg font-bold ${
                    debate?.position === 'for' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {debate?.position === 'for' ? '반대 🙅‍♀️' : '찬성 🙋‍♂️'}
                  </p>
                </div>
              </div>

              {/* Debate Statistics */}
              <div className="w-full space-y-3">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <p className="text-xs font-semibold text-text-secondary">총 메시지</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">{messages.length}</p>
                </div>
                
                <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-2xl p-4 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <p className="text-xs font-semibold text-text-secondary">내 발언</p>
                  </div>
                  <p className="text-3xl font-bold text-secondary">{messageCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Chat Area */}
          <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
            {/* Topic Banner - Mobile & Tablet */}
            <div className="xl:hidden bg-white/80 backdrop-blur-sm border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-medium">
                  <img src={aiCharacter.avatar} alt={aiCharacter.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{aiCharacter.name}</h3>
                  <p className="text-xs text-text-secondary">
                    {debate?.position === 'for' ? '반대 입장' : '찬성 입장'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-5xl mx-auto space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 animate-fade-in-up ${
                      message.role === 'student' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden shadow-soft ${
                      message.role === 'student' 
                        ? 'bg-gradient-primary' 
                        : 'bg-white border-2 border-border'
                    }`}>
                      {message.role === 'student' ? (
                        <span className="text-lg sm:text-xl">👤</span>
                      ) : (
                        <img 
                          src={aiCharacter.avatar} 
                          alt="AI"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Message Bubble with Tail */}
                    <div className={`relative max-w-[75%] sm:max-w-[70%] lg:max-w-[65%] ${
                      message.role === 'student' 
                        ? 'bg-gradient-primary text-white' 
                        : 'bg-white text-text-primary border border-border'
                    } rounded-3xl px-5 py-3.5 sm:px-6 sm:py-4 shadow-soft`}>
                      {/* Tail */}
                      <div className={`absolute top-3 ${
                        message.role === 'student' 
                          ? 'right-[-8px] bg-gradient-primary' 
                          : 'left-[-8px] bg-white border-l border-b border-border'
                      } w-4 h-4 transform rotate-45`}></div>
                      
                      <p className="relative z-10 whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <p className={`relative z-10 text-xs mt-2 ${
                        message.role === 'student' ? 'text-white/70' : 'text-text-secondary'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                  <div className="flex gap-3 animate-fade-in-up">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden bg-white border-2 border-border shadow-soft">
                      <img 
                        src={aiCharacter.avatar} 
                        alt="AI"
                        className="w-full h-full object-cover animate-pulse-subtle"
                      />
                    </div>
                    <div className="bg-white border border-border rounded-3xl px-5 py-3.5 sm:px-6 sm:py-4 shadow-soft">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary font-medium">
                          {aiCharacter.name}가 생각 중
                        </span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-white/80 backdrop-blur-sm p-4 sm:p-6">
              {isDebateComplete && (
                <div className="max-w-5xl mx-auto mb-4 p-4 bg-gradient-primary/10 border-2 border-primary rounded-2xl text-center">
                  <p className="text-primary font-bold">🎉 토론이 완료되었습니다! 평가 단계로 이동합니다...</p>
                </div>
              )}
              
              {!isDebateComplete && remainingTurns <= 3 && remainingTurns > 0 && (
                <div className="max-w-5xl mx-auto mb-4 p-3 bg-accent/10 border border-accent rounded-2xl text-center">
                  <p className="text-accent font-semibold text-sm">⏰ 남은 턴: {remainingTurns}개</p>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isDebateComplete ? "토론이 완료되었습니다" : messageCount >= MAX_TURNS ? "최대 턴에 도달했습니다" : "메시지를 입력하세요..."}
                    disabled={loading || isDebateComplete || messageCount >= MAX_TURNS}
                    className="flex-1 px-5 py-3.5 sm:px-6 sm:py-4 bg-white border-2 border-border rounded-full focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 text-text-primary placeholder:text-text-secondary text-base"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim() || isDebateComplete || messageCount >= MAX_TURNS}
                    className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-primary text-white rounded-full flex items-center justify-center shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                      inputMessage.trim() && !loading ? 'hover:scale-110 hover:shadow-glow' : ''
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-large max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">토론을 종료할까요?</h3>
                <p className="text-sm text-text-secondary mt-1">
                  최소 3회 이상 발언하는 것을 권장합니다
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 bg-muted text-text-primary rounded-xl hover:bg-muted/80 transition-colors font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleConfirmFinish}
                className="flex-1 px-4 py-2.5 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
