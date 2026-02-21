import React, { useState } from 'react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';
import { ArrowLeft, BookOpen, CheckCircle2, Lightbulb, Star, Sparkles } from 'lucide-react';

interface DebateReflectionProps {
  debateId: string;
  onComplete: () => void;
  onSkip: () => void;
  demoMode?: boolean;
}

export default function DebateReflection({ 
  debateId, 
  onComplete, 
  onSkip,
  demoMode = false 
}: DebateReflectionProps) {
  const { showAlert } = useAlert();
  const [mainClaim, setMainClaim] = useState('');
  const [aiCounterpoint, setAiCounterpoint] = useState('');
  const [improvement, setImprovement] = useState('');
  const [selfRating, setSelfRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (selfRating === 0) {
      showAlert('자기 평가 별점을 선택해주세요!', 'warning');
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
      
      try {
        await apiCall(`/debates/${debateId}/reflection`, {
          method: 'POST',
          body: JSON.stringify({
            mainClaim,
            aiCounterpoint,
            improvement,
            selfRating
          }),
        });
        console.log('Reflection saved successfully');
      } catch (apiError) {
        // Log error but don't block user from proceeding
        console.warn('Failed to save reflection, but allowing user to continue:', apiError);
      }

      // Always proceed to next step regardless of save status
      onComplete();
    } catch (error: any) {
      console.error('Reflection error:', error);
      // Still allow user to proceed
      onComplete();
    } finally {
      setLoading(false);
    }
  }

  const ratingLabels = [
    { stars: 1, label: '조금 부족해요', color: 'text-red-500' },
    { stars: 2, label: '더 노력할게요', color: 'text-orange-500' },
    { stars: 3, label: '괜찮았어요', color: 'text-yellow-500' },
    { stars: 4, label: '잘했어요!', color: 'text-green-500' },
    { stars: 5, label: '완벽해요! 🎉', color: 'text-primary' }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-secondary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-accent"></div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={onSkip}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              건너뛰기
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-secondary rounded-full mb-4 shadow-soft">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">5단계</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">스스로 정리하기</h1>
            <p className="text-text-secondary text-lg">오늘 토론을 마치며 배운 점을 기록해보세요 📝</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reflection Card 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">오늘 내가 말한 핵심 주장은?</h3>
                  <p className="text-sm text-text-secondary">토론에서 가장 중요하게 말했던 내용을 한 문장으로 적어주세요</p>
                </div>
              </div>
              <textarea
                value={mainClaim}
                onChange={(e) => setMainClaim(e.target.value)}
                placeholder="예: 학교에서 스마트폰을 허용하면 학습 효율이 높아진다."
                rows={3}
                className="w-full px-5 py-4 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none resize-none transition-all bg-white text-text-primary placeholder:text-text-secondary"
                required
              />
            </div>

            {/* Reflection Card 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">AI가 반박한 내용 중 기억나는 것은?</h3>
                  <p className="text-sm text-text-secondary">상대방의 의견에서 인상 깊었던 점을 적어주세요</p>
                </div>
              </div>
              <textarea
                value={aiCounterpoint}
                onChange={(e) => setAiCounterpoint(e.target.value)}
                placeholder="예: 스마트폰으로 게임을 하면 수업에 집중하지 못할 수 있다."
                rows={3}
                className="w-full px-5 py-4 border-2 border-border rounded-2xl focus:border-secondary focus:ring-4 focus:ring-secondary/20 outline-none resize-none transition-all bg-white text-text-primary placeholder:text-text-secondary"
                required
              />
            </div>

            {/* Reflection Card 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">다음에 더 잘하고 싶은 점은?</h3>
                  <p className="text-sm text-text-secondary">앞으로 개선하고 싶은 부분을 생각해보세요</p>
                </div>
              </div>
              <textarea
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                placeholder="예: 구체적인 통계 자료를 더 많이 준비해야겠다."
                rows={3}
                className="w-full px-5 py-4 border-2 border-border rounded-2xl focus:border-accent focus:ring-4 focus:ring-accent/20 outline-none resize-none transition-all bg-white text-text-primary placeholder:text-text-secondary"
                required
              />
            </div>

            {/* Self Rating Card */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm rounded-3xl p-8 shadow-medium border-2 border-primary/20 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-4 shadow-soft">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-text-primary">자기 평가</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">오늘 토론은 몇 점이었나요?</h3>
                <p className="text-text-secondary">별을 클릭해서 점수를 매겨보세요</p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating || selfRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelfRating(star)}
                      className={`transition-all duration-200 ease-out ${
                        isActive 
                          ? 'scale-110' 
                          : 'scale-100 hover:scale-105'
                      }`}
                    >
                      <Star 
                        className={`w-12 h-12 transition-all duration-200 ${
                          isActive 
                            ? 'fill-accent text-accent drop-shadow-glow' 
                            : 'text-border hover:text-accent/50'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Rating Label */}
              {(hoverRating || selfRating) > 0 && (
                <div className="text-center animate-fade-in-up">
                  <p className={`text-xl font-bold ${ratingLabels[(hoverRating || selfRating) - 1].color}`}>
                    {ratingLabels[(hoverRating || selfRating) - 1].label}
                  </p>
                </div>
              )}
            </div>

            {/* Tips Box */}
            <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-3xl p-6 border border-secondary/20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-text-primary mb-2">💡 정리 팁</p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    간단한 한 문장으로 핵심만 적어주세요. 이 내용은 나중에 복습할 때 도움이 됩니다.
                    솔직하게 평가할수록 더 빨리 성장할 수 있어요!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={onSkip}
                className="px-6 py-4 bg-white border-2 border-border text-text-secondary rounded-full hover:bg-muted transition-all font-semibold shadow-soft"
              >
                나중에 하기
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    저장하고 결과 보기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
