import React, { useState } from 'react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';
import { ThumbsUp, ThumbsDown, ArrowLeft, Sparkles, Target, MessageSquare, Zap } from 'lucide-react';
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

interface Topic {
  id?: string;
  title: string;
  description: string;
  isRandom?: boolean;
}

interface User {
  id: string;
  name: string;
}

interface DebateSetupProps {
  user: User;
  topic: Topic;
  onDebateCreated: (debateId: string) => void;
  onCancel: () => void;
  demoMode?: boolean;
}

const characters = [
  { id: 'tail_question_bora', name: '꼬리질문보라', emoji: '🤔', description: '계속 질문을 던지는 스타일', difficulty: 'medium', personality: '하나의 답변에 계속 꼬리를 무는 질문', avatar: tailQuestionBoraAvatar },
  { id: 'argument_master_cheolsu', name: '말싸움잘하는철수', emoji: '🔥', description: '논쟁을 즐기는 토론가', difficulty: 'hard', personality: '강하게 반박하며 논쟁적인 분위기', avatar: argumentMasterCheolsuAvatar },
  { id: 'rebuttal_expert_minho', name: '반박장인민호', emoji: '⚡', description: '모든 주장을 반박하는 전문가', difficulty: 'hard', personality: '논리적 허점을 찾아내는 날카로운 반박', avatar: rebuttalExpertMinhoAvatar },
  { id: 'iron_logic_jiho', name: '철벽논리지호', emoji: '🛡️', description: '완벽한 논리로 무장', difficulty: 'hard', personality: '논리적 오류를 절대 용납하지 않음', avatar: ironLogicJihoAvatar },
  { id: 'praise_king_juho', name: '칭찬왕주호', emoji: '👏', description: '격려와 칭찬을 아끼지 않음', difficulty: 'easy', personality: '긍정적 피드백으로 자신감 상승', avatar: praiseKingJuhoAvatar },
  { id: 'firm_dahye', name: '단호박다혜', emoji: '💪', description: '명확하고 단호한 입장', difficulty: 'medium', personality: '확고한 주장과 강한 신념', avatar: firmPumpkinDahyeAvatar },
  { id: 'best_friend_soyoung', name: '베스트프랜드소영', emoji: '🌟', description: '친구처럼 편안한 대화', difficulty: 'easy', personality: '부담없이 이야기 나누는 친근함', avatar: bestFriendSoyoungAvatar },
  { id: 'calm_sujeong', name: '침착한수정', emoji: '😌', description: '차분하고 이성적인 토론', difficulty: 'medium', personality: '감정 없이 냉정하게 분석', avatar: calmSujeongAvatar },
  { id: 'fact_collector_woojin', name: '팩트수집가우진', emoji: '📊', description: '사실과 데이터로 무장', difficulty: 'medium', personality: '통계와 자료로 근거를 제시', avatar: factCollectorWoojinAvatar },
  { id: 'kind_younghee', name: '친절한영희', emoji: '😊', description: '따뜻하고 친절한 대화', difficulty: 'easy', personality: '부드럽게 의견을 나누는 스타일', avatar: kindYoungheeAvatar },
];

export default function DebateSetup({ user, topic, onDebateCreated, onCancel, demoMode = false }: DebateSetupProps) {
  const { showAlert } = useAlert();
  const [position, setPosition] = useState<'for' | 'against' | null>(null);
  const [character, setCharacter] = useState('tail_question_bora');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!position) {
      showAlert('찬성 또는 반대를 선택해주세요', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        // Mock debate creation for demo mode
        const mockDebateId = `debate-${Date.now()}`;
        setTimeout(() => {
          onDebateCreated(mockDebateId);
          setLoading(false);
        }, 500);
        return;
      }
      
      const data = await apiCall('/debates', {
        method: 'POST',
        body: JSON.stringify({
          topicId: topic.id || null,
          topicTitle: topic.title,
          topicDescription: topic.description,
          position,
          character,
          difficulty: characters.find(c => c.id === character)?.difficulty || 'medium',
        }),
      });

      onDebateCreated(data.debate.id);
    } catch (error: any) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const selectedCharacter = characters.find(c => c.id === character);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                돌아가기
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full shadow-soft">
                <Target className="w-5 h-5 text-white" />
                <span className="font-bold text-white">2단계</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-full mb-6 shadow-soft border border-border">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold text-text-secondary">토론 준비하기</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-text-primary">
              입장과 AI 캐릭터 선택
            </h1>
            
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              당신의 입장을 정하고, 함께 토론할 AI 친구를 만나보세요
            </p>
          </div>

          {/* Topic Display */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-6 sm:p-8 mb-8 border-2 border-primary/20 shadow-soft animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start gap-3 mb-4">
              {topic.isRandom && (
                <span className="px-4 py-2 bg-gradient-accent text-white text-sm font-bold rounded-full shadow-soft flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  랜덤 주제
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">{topic.title}</h2>
            <p className="text-text-secondary text-lg leading-relaxed">{topic.description}</p>
          </div>

          {/* Position Selection */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              나의 입장 선택
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setPosition('for')}
                className={`group p-8 rounded-3xl border-2 transition-all hover:-translate-y-1 ${
                  position === 'for'
                    ? 'border-secondary bg-gradient-to-br from-secondary/20 to-secondary/10 shadow-medium'
                    : 'border-border bg-white/80 backdrop-blur-sm hover:border-secondary hover:bg-secondary/5 shadow-soft'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${
                    position === 'for' 
                      ? 'bg-gradient-secondary shadow-medium scale-110' 
                      : 'bg-muted group-hover:bg-gradient-secondary group-hover:scale-110'
                  }`}>
                    <ThumbsUp className={`w-10 h-10 ${position === 'for' ? 'text-white' : 'text-text-secondary group-hover:text-white'}`} />
                  </div>
                  <span className={`text-3xl font-bold mb-3 ${position === 'for' ? 'text-secondary' : 'text-text-primary'}`}>
                    찬성
                  </span>
                  <p className="text-text-secondary leading-relaxed">
                    이 주제에 동의하며 긍정적인 입장으로 토론합니다
                  </p>
                </div>
              </button>

              <button
                onClick={() => setPosition('against')}
                className={`group p-8 rounded-3xl border-2 transition-all hover:-translate-y-1 ${
                  position === 'against'
                    ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-medium'
                    : 'border-border bg-white/80 backdrop-blur-sm hover:border-primary hover:bg-primary/5 shadow-soft'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${
                    position === 'against' 
                      ? 'bg-gradient-primary shadow-medium scale-110' 
                      : 'bg-muted group-hover:bg-gradient-primary group-hover:scale-110'
                  }`}>
                    <ThumbsDown className={`w-10 h-10 ${position === 'against' ? 'text-white' : 'text-text-secondary group-hover:text-white'}`} />
                  </div>
                  <span className={`text-3xl font-bold mb-3 ${position === 'against' ? 'text-primary' : 'text-text-primary'}`}>
                    반대
                  </span>
                  <p className="text-text-secondary leading-relaxed">
                    이 주제에 반대하며 부정적인 입장으로 토론합니다
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Character Selection */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-2xl font-bold text-text-primary mb-3 flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" />
              AI 토론 캐릭터 고르기
            </h3>
            <p className="text-text-secondary mb-6">어떤 AI와 토론할지 골라보세요! (10개 중 택1)</p>
            
            <div className="grid grid-cols-5 gap-4">
              {characters.map((char, index) => (
                <button
                  key={char.id}
                  onClick={() => setCharacter(char.id)}
                  className={`group relative p-5 rounded-3xl border-2 transition-all hover:-translate-y-1 text-center overflow-hidden animate-fade-in-up ${ 
                    character === char.id
                      ? 'border-accent bg-gradient-to-br from-accent/20 to-accent/10 shadow-medium'
                      : 'border-border bg-white/80 backdrop-blur-sm hover:border-accent hover:bg-accent/5 shadow-soft'
                  }`}
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  {/* Avatar Background */}
                  <div className="mb-4 relative">
                    <div className={`w-16 h-16 mx-auto rounded-full overflow-hidden shadow-soft border-2 transition-all ${
                      character === char.id ? 'border-accent scale-110' : 'border-border group-hover:border-accent group-hover:scale-110'
                    }`}>
                      <img 
                        src={char.avatar} 
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Emoji Badge */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-soft border border-border">
                      {char.emoji}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`text-sm font-bold mb-2 ${ 
                      character === char.id ? 'text-accent' : 'text-text-primary'
                    }`}>
                      {char.name}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2 leading-relaxed">{char.description}</p>
                    <div className={`text-xs font-semibold mt-2 px-3 py-1 rounded-full inline-block ${
                      char.difficulty === 'easy' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-300' :
                      char.difficulty === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-300' :
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300'
                    }`}>
                      {char.difficulty === 'easy' ? '🟢 초급' : char.difficulty === 'medium' ? '🟡 중급' : '🔴 고급'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Character Preview */}
          {selectedCharacter && (
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-6 border-2 border-accent/20 mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-medium border-3 border-white">
                  <img src={selectedCharacter.avatar} alt={selectedCharacter.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xl font-bold text-text-primary">{selectedCharacter.name}</h4>
                    <span className="text-2xl">{selectedCharacter.emoji}</span>
                  </div>
                  <p className="text-text-secondary mb-2">{selectedCharacter.personality}</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    selectedCharacter.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    selectedCharacter.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    난이도: {selectedCharacter.difficulty === 'easy' ? '초급' : selectedCharacter.difficulty === 'medium' ? '중급' : '고급'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent p-4 z-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-8 py-4 border-2 border-border bg-white text-text-secondary rounded-full hover:bg-muted transition-all font-semibold shadow-soft"
          >
            취소
          </button>
          <button
            onClick={handleStart}
            disabled={!position || loading}
            className="flex-1 py-4 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-medium flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>준비중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>다음: 사전 준비</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
