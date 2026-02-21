import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/supabase';
import { ArrowLeft, Download, Loader2, Trophy, TrendingUp, 
  MessageSquare, Award, Sparkles, CheckCircle2, Star, Target
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAlert } from './AlertProvider';

interface DebateResultProps {
  debateId: string;
  onBack: () => void;
  demoMode?: boolean;
}

export default function DebateResult({ debateId, onBack, demoMode = false }: DebateResultProps) {
  const { showAlert } = useAlert();
  const [debate, setDebate] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDebateData();
  }, []);

  useEffect(() => {
    if (evaluation && !showConfetti) {
      // Show confetti after a short delay
      setTimeout(() => {
        setShowConfetti(true);
        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
      }, 500);
    }
  }, [evaluation]);

  async function loadDebateData() {
    try {
      if (demoMode) {
        setDebate({
          topicTitle: '학교에서 스마트폰 사용 허용',
          topicDescription: '학생들의 학교 내 스마트폰 사용을 허용해야 하는가?',
          position: 'for',
          character: 'tail_question_bora'
        });
        setEvaluation({
          participationScore: 90,
          logicScore: 85,
          evidenceScore: 82,
          overallFeedback: '논리적인 근거를 잘 제시했습니다! 반론에 대한 대응도 적절했어요. 구체적인 예시를 더 많이 사용하면 더욱 설득력 있는 토론이 될 거예요. 🌟',
          strengths: [
            '주장이 명확하고 일관성이 있었어요',
            '상대방 의견을 경청하고 존중하는 태도가 좋았어요',
            '논리적 흐름이 자연스러웠어요'
          ],
          improvements: [
            '구체적인 통계나 사례를 더 활용해보세요',
            '상대방의 반론을 예상하여 미리 준비하면 더 좋아요'
          ]
        });
        setLoading(false);
        return;
      }
      
      const data = await apiCall(`/debates/${debateId}`);
      setDebate(data.debate);
      
      // If evaluation doesn't exist, create it automatically
      if (!data.evaluation) {
        console.log('No evaluation found, generating one automatically...');
        try {
          // Call evaluate endpoint to generate evaluation
          await apiCall(`/debates/${debateId}/evaluate`, {
            method: 'POST',
            body: JSON.stringify({
              selfScore: 75,
              selfFeedback: '토론에 참여했습니다.'
            })
          });
          
          // Reload debate data to get the evaluation
          const updatedData = await apiCall(`/debates/${debateId}`);
          setEvaluation(updatedData.evaluation || getDefaultEvaluation());
        } catch (evalError) {
          console.warn('Failed to generate evaluation, using default:', evalError);
          setEvaluation(getDefaultEvaluation());
        }
      } else {
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      console.error('Error loading debate:', error);
      // Set fallback evaluation on error
      setEvaluation(getDefaultEvaluation());
    } finally {
      setLoading(false);
    }
  }

  function getDefaultEvaluation() {
    return {
      participationScore: 75,
      logicScore: 75,
      evidenceScore: 75,
      overallFeedback: '토론에 참여해주셔서 감사합니다! 계속 연습하면 더욱 발전할 수 있어요. 🌟',
      strengths: [
        '토론에 적극적으로 참여했어요',
        '자신의 의견을 표현하려고 노력했어요'
      ],
      improvements: [
        '더 많은 근거를 제시해보세요',
        '상대방 의견에 대한 반론을 준비해보세요'
      ]
    };
  }

  async function handleDownloadPDF() {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: (el) => el.classList.contains('animate-confetti'),
        onclone: (clonedDoc) => {
          // 스타일시트에서 oklab/oklch 색상 함수 규칙을 모두 제거
          const sheets = Array.from(clonedDoc.styleSheets);
          sheets.forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              rules.forEach((rule: any) => {
                if (rule.style) {
                  const propsToCheck = ['color', 'background-color', 'border-color', 'outline-color', 'fill', 'stroke'];
                  propsToCheck.forEach((prop) => {
                    const val = rule.style.getPropertyValue(prop);
                    if (val && /oklab\(|oklch\(|color-mix\(/i.test(val)) {
                      rule.style.removeProperty(prop);
                    }
                  });
                  // CSS 변수 선언에서도 제거
                  if (rule.style.cssText && /oklab\(|oklch\(|color-mix\(/i.test(rule.style.cssText)) {
                    const varPattern = /--([\w-]+)\s*:\s*(?:oklab|oklch|color-mix)\([^;]+;/gi;
                    rule.style.cssText = rule.style.cssText.replace(varPattern, '');
                  }
                }
              });
            } catch {
              // cross-origin 시트는 무시
            }
          });

          // 모든 엘리먼트에 인라인으로 안전한 색상 강제 적용
          const allEls = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
          const originalEls = Array.from(element.querySelectorAll('*')) as HTMLElement[];

          allEls.forEach((el, i) => {
            const orig = originalEls[i];
            if (!orig) return;

            const cs = window.getComputedStyle(orig);

            const safeBg = cs.backgroundColor;
            if (safeBg && safeBg !== 'rgba(0, 0, 0, 0)') {
              el.style.setProperty('background-color', safeBg, 'important');
            }

            const safeColor = cs.color;
            if (safeColor) {
              el.style.setProperty('color', safeColor, 'important');
            }

            const safeBorder = cs.borderColor;
            if (safeBorder) {
              el.style.setProperty('border-color', safeBorder, 'important');
            }

            // 그라디언트 제거 (oklab 포함 가능)
            el.style.setProperty('background-image', 'none', 'important');

            // 애니메이션 제거
            el.style.animation = 'none';
            el.style.transition = 'none';
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`토론결과_${debate?.topicTitle}_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setDownloading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 85) return { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700', gradient: 'bg-gradient-secondary' };
    if (score >= 70) return { bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', gradient: 'bg-gradient-accent' };
    return { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700', gradient: 'bg-gradient-primary' };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const avgScore = Math.round((evaluation.participationScore + evaluation.logicScore + evaluation.evidenceScore) / 3);
  const scoreColor = getScoreColor(avgScore);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                backgroundColor: ['#FF8C69', '#7DD3C0', '#FFD93D', '#A78BFA'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              돌아가기
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div ref={reportRef} className="space-y-8">
            {/* Celebration Banner */}
            <div className="text-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-accent rounded-full mb-6 shadow-medium animate-bounce-subtle">
                <Trophy className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">토론 완료!</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                🎉 대단해요! 🎉
              </h1>
              <p className="text-xl text-text-secondary">
                {debate?.topicTitle} 토론을 완료했습니다
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-6">
              {/* Participation Score */}
              <div className={`bg-gradient-to-br ${getScoreColor(evaluation.participationScore).bg} rounded-3xl p-8 border-2 ${getScoreColor(evaluation.participationScore).border} shadow-medium animate-fade-in-up hover:-translate-y-2 transition-all`} style={{ animationDelay: '100ms' }}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${getScoreColor(evaluation.participationScore).gradient} rounded-full flex items-center justify-center mb-4 shadow-medium`}>
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">참여도</h3>
                  <div className={`text-5xl font-bold ${getScoreColor(evaluation.participationScore).text} mb-2`}>
                    {evaluation.participationScore}
                  </div>
                  <p className="text-sm text-text-secondary">적극적인 참여!</p>
                </div>
              </div>

              {/* Logic Score */}
              <div className={`bg-gradient-to-br ${getScoreColor(evaluation.logicScore).bg} rounded-3xl p-8 border-2 ${getScoreColor(evaluation.logicScore).border} shadow-medium animate-fade-in-up hover:-translate-y-2 transition-all`} style={{ animationDelay: '200ms' }}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${getScoreColor(evaluation.logicScore).gradient} rounded-full flex items-center justify-center mb-4 shadow-medium`}>
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">논리력</h3>
                  <div className={`text-5xl font-bold ${getScoreColor(evaluation.logicScore).text} mb-2`}>
                    {evaluation.logicScore}
                  </div>
                  <p className="text-sm text-text-secondary">탄탄한 논리!</p>
                </div>
              </div>

              {/* Evidence Score */}
              <div className={`bg-gradient-to-br ${getScoreColor(evaluation.evidenceScore).bg} rounded-3xl p-8 border-2 ${getScoreColor(evaluation.evidenceScore).border} shadow-medium animate-fade-in-up hover:-translate-y-2 transition-all`} style={{ animationDelay: '300ms' }}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${getScoreColor(evaluation.evidenceScore).gradient} rounded-full flex items-center justify-center mb-4 shadow-medium`}>
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">근거력</h3>
                  <div className={`text-5xl font-bold ${getScoreColor(evaluation.evidenceScore).text} mb-2`}>
                    {evaluation.evidenceScore}
                  </div>
                  <p className="text-sm text-text-secondary">충분한 근거!</p>
                </div>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-medium border border-border animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">AI 선생님의 총평</h2>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-wrap">
                {evaluation.overallFeedback}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center shadow-soft">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">잘한 점</h3>
                </div>
                <ul className="space-y-3">
                  {evaluation.strengths?.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-text-secondary">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">개선할 점</h3>
                </div>
                <ul className="space-y-3">
                  {evaluation.improvements?.map((improvement: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">→</span>
                      </div>
                      <span className="text-text-secondary">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Challenge Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-3xl p-8 border-2 border-primary/20 text-center animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">다음 토론도 도전해볼까요?</h3>
              <p className="text-text-secondary mb-6">
                계속 연습하면 토론 실력이 쑥쑥 자랄 거예요!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="px-8 py-4 bg-gradient-primary text-white rounded-full font-bold shadow-medium hover:shadow-glow transition-all"
                >
                  새 토론 시작하기
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="px-8 py-4 bg-white border-2 border-primary text-primary rounded-full font-bold shadow-soft hover:shadow-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>결과 다운로드</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
