import React, { useState } from 'react';
import { apiCall } from '../../lib/api';
import { useAlert } from './AlertProvider';
import { 
  ArrowLeft, Lightbulb, Plus, Trash2, Sparkles, CheckCircle2, Circle,
  MessageSquare, Target, Shield, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

interface DebatePreparationProps {
  debateId: string;
  debate: any;
  onComplete: () => void;
  onCancel: () => void;
  demoMode?: boolean;
}

interface PreparationItem {
  id: string;
  content: string;
}

export default function DebatePreparation({ 
  debateId, 
  debate, 
  onComplete, 
  onCancel,
  demoMode = false
}: DebatePreparationProps) {
  const { showAlert } = useAlert();
  const [claims, setClaims] = useState<PreparationItem[]>([{ id: '1', content: '' }]);
  const [reasons, setReasons] = useState<PreparationItem[]>([{ id: '1', content: '' }]);
  const [counterarguments, setCounterarguments] = useState<PreparationItem[]>([{ id: '1', content: '' }]);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);

  function addItem(setter: React.Dispatch<React.SetStateAction<PreparationItem[]>>) {
    setter(prev => [...prev, { id: Date.now().toString(), content: '' }]);
  }

  function removeItem(setter: React.Dispatch<React.SetStateAction<PreparationItem[]>>, id: string) {
    setter(prev => prev.filter(item => item.id !== id));
  }

  function updateItem(setter: React.Dispatch<React.SetStateAction<PreparationItem[]>>, id: string, content: string) {
    setter(prev => prev.map(item => item.id === id ? { ...item, content } : item));
  }

  async function handleAIHelpAll() {
    setAiGenerating('all');
    
    // Generate topic-relevant examples based on current topic
    const topicTitle = debate?.topicTitle || '';
    const position = debate?.position || 'for';
    const positionKorean = position === 'for' ? '찬성' : '반�?';

    // Try to use real API first (not in demo mode)
    if (!demoMode) {
      try {
        const prompt = `토론 주제: "${topicTitle}"
입장: ${positionKorean}

위 주제에 대해 ${positionKorean} 입장에서:
1. 핵심 주장 1가지를 작성해주세요
2. 주장을 뒷받침하는 근거 1가지를 작성해주세요
3. 예상되는 반론 1가지를 작성해주세요

다음 JSON 형식으로 답변해주세요:
{
  "claim": "주장 내용",
  "reason": "근거 내용",
  "counterargument": "예상 반론 내용"
}`;

        console.log('Calling AI help API for all sections:', { topic: topicTitle, position });
        
        const response = await apiCall('/ai/generate-help', {
          method: 'POST',
          body: JSON.stringify({
            prompt,
            section: 'all',
            topic: topicTitle,
            position
          })
        });

        console.log('AI help response:', response);

        if (response.suggestion) {
          try {
            // Try to parse as JSON first
            const parsed = typeof response.suggestion === 'string' 
              ? JSON.parse(response.suggestion) 
              : response.suggestion;
            
            if (parsed.claim) {
              setClaims([{ id: Date.now().toString(), content: parsed.claim }]);
            }
            if (parsed.reason) {
              setReasons([{ id: Date.now().toString() + '1', content: parsed.reason }]);
            }
            if (parsed.counterargument) {
              setCounterarguments([{ id: Date.now().toString() + '2', content: parsed.counterargument }]);
            }
            setAiGenerating(null);
            return;
          } catch (parseError) {
            console.warn('Failed to parse JSON response, using as single claim:', parseError);
            // If not valid JSON, use as claim only
            setClaims([{ id: Date.now().toString(), content: response.suggestion }]);
          }
        }
      } catch (apiError) {
        console.warn('API call failed, using fallback examples:', apiError);
        // Continue to fallback logic below
      }
    }

    // Fallback: Generate simple topic-based examples
    setTimeout(() => {
      const topicLower = topicTitle.toLowerCase();
      
      let claimExample = '';
      let reasonExample = '';
      let counterExample = '';
      
      if (position === 'for') {
        claimExample = `찬성: \${topicLower.includes('ai') ? 'AI는 인류에게 도움이 됩니다' : '이 주제에 찬성합니다'}`;
        reasonExample = '왜냐하면 데이터와 연구 결과가 이를 뒷받침하기 때문입니다.';
        counterExample = '반대 측에서는 부작용을 언급하지만, 이는 극복 가능합니다.';
      } else {
        claimExample = `반대: \${topicLower.includes('ai') ? 'AI는 위험성이 있습니다' : '이 주제에 반대합니다'}`;
        reasonExample = '왜냐하면 실제 사례를 보면 부작용이 더 크기 때문입니다.';
        counterExample = '찬성 측의 주장은 이상적이지만 현실을 반영하지 못합니다.';
      }

      setClaims([{ id: Date.now().toString(), content: claimExample }]);
      setReasons([{ id: Date.now().toString() + '1', content: reasonExample }]);
      setCounterarguments([{ id: Date.now().toString() + '2', content: counterExample }]);

      setAiGenerating(null);
    }, 1500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate at least one item in each category
    if (claims.every(c => !c.content.trim())) {
      showAlert('주장을 입력하세요.', 'warning');
      return;
    }
    
    setLoading(true);

    try {
      if (demoMode) {
        setTimeout(() => {
          onComplete();
          setLoading(false);
        }, 500);
        return;
      }
      
      await apiCall(`/debates/${debateId}/preparation`, {
        method: 'POST',
        body: JSON.stringify({
          claims: claims.filter(c => c.content.trim()),
          reasons: reasons.filter(r => r.content.trim()),
          counterarguments: counterarguments.filter(c => c.content.trim()),
        }),
      });

      onComplete();
    } catch (error: any) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Calculate progress
  const sectionsCompleted = [
    claims.some(c => c.content.trim()),
    reasons.some(r => r.content.trim()),
    counterarguments.some(c => c.content.trim())
  ].filter(Boolean).length;
  const totalSections = 3;
  const progressPercent = (sectionsCompleted / totalSections) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 left-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 right-10 w-80 h-80 bg-secondary"></div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                ?�아가�?              </button>

              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-primary">
                  {sectionsCompleted}/{totalSections} ?�료!
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Input Form */}
            <div className="lg:col-span-2">
              {/* Title */}
              <div className="mb-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full mb-4 shadow-soft">
                  <Lightbulb className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white">3?�계</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">주장�?근거 ?�리</h1>
                <p className="text-text-secondary text-lg mb-4">텍스트</p>
                
                {/* AI Help All Button */}
                <button
                  type="button"
                  onClick={handleAIHelpAll}
                  disabled={aiGenerating}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-accent text-text-primary font-bold rounded-full hover:shadow-glow transition-all disabled:opacity-50 shadow-medium"
                >
                  <Sparkles className={`w-5 h-5 ${aiGenerating ? 'animate-spin' : ''}`} />
                  <span>{aiGenerating ? 'AI가 ?�각 �?..' : 'AI ?��?받기 (주장+근거+반론)'}</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                {/* Section 1: Claims */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        claims.some(c => c.content.trim()) 
                          ? 'bg-gradient-primary' 
                          : 'bg-muted'
                      }`}>
                        {claims.some(c => c.content.trim()) ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-secondary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-text-primary">주장 (Claim)</h3>
                          <button
                            type="button"
                            className="text-text-secondary hover:text-text-primary transition-colors"
                            title="도움말"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">텍스트</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {claims.map((claim, index) => (
                      <div key={claim.id} className="flex gap-2">
                        <textarea
                          value={claim.content}
                          onChange={(e) => updateItem(setClaims, claim.id, e.target.value)}
                          placeholder={debate?.position === 'for'
                            ? '찬성 입장에서 주장을 입력하세요.'
                            : '반대 입장에서 주장을 입력하세요.'}
                          rows={3}
                          className="flex-1 px-4 py-3 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none resize-none transition-all bg-white"
                          required={index === 0}
                        />
                        {claims.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(setClaims, claim.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(setClaims)}
                      className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-text-secondary hover:border-primary hover:text-primary transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                          placeholder='내용을 입력하세요.'
                    </button>
                  </div>
                </div>

                {/* Section 2: Reasons */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        reasons.some(r => r.content.trim()) 
                          ? 'bg-gradient-secondary' 
                          : 'bg-muted'
                      }`}>
                        {reasons.some(r => r.content.trim()) ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-secondary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-text-primary">근거 (Reason)</h3>
                          <button
                            type="button"
                            className="text-text-secondary hover:text-text-primary transition-colors"
                            title="도움말"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">텍스트</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reasons.map((reason, index) => (
                      <div key={reason.id} className="flex gap-2">
                        <textarea
                          value={reason.content}
                          onChange={(e) => updateItem(setReasons, reason.id, e.target.value)}
                          placeholder='이유와 근거를 입력하세요.'
                          rows={3}
                          className="flex-1 px-4 py-3 border-2 border-border rounded-2xl focus:border-secondary focus:ring-4 focus:ring-secondary/20 outline-none resize-none transition-all bg-white"
                        />
                        {reasons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(setReasons, reason.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(setReasons)}
                      className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-text-secondary hover:border-secondary hover:text-secondary transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      이유 추가
                    </button>
                  </div>
                </div>

                {/* Section 3: Counter Arguments */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        counterarguments.some(c => c.content.trim()) 
                          ? 'bg-gradient-accent' 
                          : 'bg-muted'
                      }`}>
                        {counterarguments.some(c => c.content.trim()) ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-secondary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-text-primary">반론</h3>
                          <button
                            type="button"
                            className="text-text-secondary hover:text-text-primary transition-colors"
                            title="도움말"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">상대방이 어떤 말을 할지 예상해보세요.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {counterarguments.map((counter, index) => (
                      <div key={counter.id} className="flex gap-2">
                        <textarea
                          value={counter.content}
                          onChange={(e) => updateItem(setCounterarguments, counter.id, e.target.value)}
                          placeholder='상대방의 예상 주장을 입력하세요.'
                          rows={3}
                          className="flex-1 px-4 py-3 border-2 border-border rounded-2xl focus:border-accent focus:ring-4 focus:ring-accent/20 outline-none resize-none transition-all bg-white"
                        />
                        {counterarguments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(setCounterarguments, counter.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(setCounterarguments)}
                      className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-text-secondary hover:border-accent hover:text-accent transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      반론을 입력하세요.
                    </button>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl border-2 border-accent/20 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTips(!showTips)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center shadow-soft">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-text-primary text-lg">토론 준비 팁</span>
                    </div>
                    {showTips ? (
                      <ChevronUp className="w-5 h-5 text-text-secondary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-secondary" />
                    )}
                  </button>
                  
                  {showTips && (
                    <div className="px-6 pb-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-text-secondary">주장은 간단하고 명확하게 한 문장으로 작성하세요.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-text-secondary">근거는 구체적인 사례나 통계를 포함하면 더 설득력이 생겨요.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-text-secondary">상대방의 입장에서 생각해보고 예상 반론도 미리 준비할 수 있어요.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-text-secondary">상단의 AI 도움받기 버튼을 누르면 주장, 근거, 예상 반론을 한번에 자동 생성할 수 있어요.</p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Preview Card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-medium border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-text-primary">텍스트</h3>
                  </div>

                  {/* Topic Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 mb-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        debate?.position === 'for' 
                          ? 'bg-gradient-secondary text-white' 
                          : 'bg-gradient-primary text-white'
                      }`}>
                        {debate?.position === 'for' ? '찬성 ?�장' : '반�? ?�장'}
                      </span>
                    </div>
                    <h4 className="font-bold text-text-primary text-lg mb-1">{debate?.topicTitle}</h4>
                    <p className="text-sm text-text-secondary">{debate?.topicDescription}</p>
                  </div>

                  {/* Preview Content */}
                  <div className="space-y-4">
                    {/* Claims Preview */}
                    {claims.some(c => c.content.trim()) && (
                      <div className="bg-primary/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold text-text-primary">주장</span>
                        </div>
                        <ul className="space-y-2">
                          {claims.filter(c => c.content.trim()).map((claim, idx) => (
                            <li key={idx} className="text-sm text-text-secondary pl-4 border-l-2 border-primary">
                              {claim.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reasons Preview */}
                    {reasons.some(r => r.content.trim()) && (
                      <div className="bg-secondary/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-bold text-text-primary">근거</span>
                        </div>
                        <ul className="space-y-2">
                          {reasons.filter(r => r.content.trim()).map((reason, idx) => (
                            <li key={idx} className="text-sm text-text-secondary pl-4 border-l-2 border-secondary">
                              {reason.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Counter Arguments Preview */}
                    {counterarguments.some(c => c.content.trim()) && (
                      <div className="bg-accent/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-accent" />
                          <span className="text-sm font-bold text-text-primary">텍스트</span>
                        </div>
                        <ul className="space-y-2">
                          {counterarguments.filter(c => c.content.trim()).map((counter, idx) => (
                            <li key={idx} className="text-sm text-text-secondary pl-4 border-l-2 border-accent">
                              {counter.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {sectionsCompleted === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">✏️</div>
                        <p className="text-sm text-text-secondary">입력한 내용이<br />여기에 표시됩니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent p-4 z-20">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading || sectionsCompleted === 0}
            className="w-full py-5 bg-gradient-primary text-white font-bold text-lg rounded-full shadow-strong hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>준�?�?..</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>텍스트</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
