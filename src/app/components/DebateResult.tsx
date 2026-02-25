import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/supabase';
import { ArrowLeft, Download, Loader2, Trophy, TrendingUp, 
  MessageSquare, Award, Sparkles, CheckCircle2, Star, Target
} from 'lucide-react';
import { jsPDF } from 'jspdf';
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
        try {
          await apiCall(`/debates/${debateId}/evaluate`, {
            method: 'POST',
            body: JSON.stringify({
              selfScore: 75,
              selfFeedback: '토론에 참여했습니다.'
            })
          });
          const updatedData = await apiCall(`/debates/${debateId}`);
          setEvaluation(updatedData.evaluation || getDefaultEvaluation());
        } catch {
          setEvaluation(getDefaultEvaluation());
        }
      } else {
        setEvaluation(data.evaluation);
      }
    } catch {
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
    setDownloading(true);
    try {
      // ── Canvas 기반 한글 렌더링 헬퍼 ─────────────────────────
      // jsPDF 기본 폰트는 한글 미지원이므로 canvas에 그려 이미지로 삽입
      const DPI = 3; // 배율 (높을수록 선명)
      const PAGE_W_MM = 210;
      const MARGIN_MM = 18;
      const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
      const MM_TO_PX = (mm: number) => mm * DPI * (96 / 25.4);

      const canvasW = Math.round(MM_TO_PX(PAGE_W_MM));

      // 텍스트를 canvas로 그려 mm 높이를 반환하는 함수
      function measureWrappedLines(
        text: string,
        fontPx: number,
        maxWidthPx: number,
        fontFamily = 'Arial, sans-serif'
      ): string[] {
        const tc = document.createElement('canvas');
        const ctx = tc.getContext('2d')!;
        ctx.font = `${fontPx}px ${fontFamily}`;
        const words = text.split('');
        const lines: string[] = [];
        let cur = '';
        for (const ch of words) {
          const test = cur + ch;
          if (ctx.measureText(test).width > maxWidthPx && cur.length > 0) {
            lines.push(cur);
            cur = ch;
          } else {
            cur = test;
          }
        }
        if (cur) lines.push(cur);
        return lines.length > 0 ? lines : [''];
      }

      // canvas 블록을 PDF에 이미지로 삽입
      function drawCanvasBlock(
        pdf: jsPDF,
        renderFn: (ctx: CanvasRenderingContext2D, cW: number) => number,
        yMM: number
      ): number {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvasW;
        tmpCanvas.height = 4000; // 충분히 크게
        const ctx = tmpCanvas.getContext('2d')!;
        const heightPx = renderFn(ctx, canvasW);
        // 실제 높이로 자르기
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvasW;
        finalCanvas.height = Math.ceil(heightPx);
        const fCtx = finalCanvas.getContext('2d')!;
        fCtx.drawImage(tmpCanvas, 0, 0);
        const imgData = finalCanvas.toDataURL('image/png');
        const heightMM = (heightPx / DPI) * (25.4 / 96);
        pdf.addImage(imgData, 'PNG', 0, yMM, PAGE_W_MM, heightMM);
        return heightMM;
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let yMM = 0;

      const C = {
        primary: '#E8734A', green: '#16a34a', blue: '#1d4ed8',
        gray900: '#111827', gray600: '#4b5563', gray400: '#9ca3af',
        border: '#e5e7eb', bgLight: '#f9fafb', white: '#ffffff',
      };

      function hexToRgb(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      }
      function setFill(ctx: CanvasRenderingContext2D, hex: string, alpha = 1) {
        const { r, g, b } = hexToRgb(hex);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      }
      function setStroke(ctx: CanvasRenderingContext2D, hex: string) {
        const { r, g, b } = hexToRgb(hex);
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
      }

      const MG = Math.round(MM_TO_PX(MARGIN_MM));
      const CW = Math.round(MM_TO_PX(CONTENT_W_MM));
      const dateStr = new Date().toLocaleDateString('ko-KR');
      const scores = [
        { label: '참여도', value: evaluation.participationScore },
        { label: '논리력', value: evaluation.logicScore },
        { label: '근거력', value: evaluation.evidenceScore },
      ];
      const pdfAvgScore = Math.round(scores.reduce((s, c) => s + c.value, 0) / 3);

      // ── 1. 헤더 + 주제 + 점수 블록 ────────────────────────────
      const headerH = drawCanvasBlock(pdf, (ctx, cW) => {
        let cy = 0;

        // 헤더 배경
        const headerPx = Math.round(MM_TO_PX(42));
        setFill(ctx, C.primary);
        ctx.fillRect(0, cy, cW, headerPx);

        ctx.fillStyle = C.white;
        ctx.font = `bold ${Math.round(MM_TO_PX(7))}px Arial, sans-serif`;
        ctx.fillText('AI Debate', MG, cy + Math.round(MM_TO_PX(14)));
        ctx.font = `${Math.round(MM_TO_PX(3.5))}px Arial, sans-serif`;
        ctx.fillText('토론 결과 리포트', MG, cy + Math.round(MM_TO_PX(22)));
        ctx.textAlign = 'right';
        ctx.font = `${Math.round(MM_TO_PX(3))}px Arial, sans-serif`;
        ctx.fillText(dateStr, cW - MG, cy + Math.round(MM_TO_PX(22)));
        ctx.textAlign = 'left';
        cy += headerPx;

        const gap = Math.round(MM_TO_PX(6));
        cy += gap;

        // 주제 박스
        const topicFontPx = Math.round(MM_TO_PX(4));
        const topicLines = measureWrappedLines(debate?.topicTitle || '', topicFontPx, CW - MG * 0.5);
        const topicBoxH = Math.round(MM_TO_PX(8)) + topicLines.length * Math.round(topicFontPx * 1.5);
        setFill(ctx, C.bgLight);
        ctx.fillRect(MG, cy, CW, topicBoxH);
        setStroke(ctx, C.border);
        ctx.lineWidth = 1;
        ctx.strokeRect(MG, cy, CW, topicBoxH);
        ctx.fillStyle = C.gray400;
        ctx.font = `${Math.round(MM_TO_PX(3))}px Arial, sans-serif`;
        ctx.fillText('토론 주제', MG + Math.round(MM_TO_PX(3)), cy + Math.round(MM_TO_PX(5)));
        ctx.fillStyle = C.gray900;
        ctx.font = `bold ${topicFontPx}px Arial, sans-serif`;
        topicLines.forEach((line, li) => {
          ctx.fillText(line, MG + Math.round(MM_TO_PX(3)), cy + Math.round(MM_TO_PX(8)) + li * Math.round(topicFontPx * 1.5));
        });
        cy += topicBoxH + gap;

        // 점수 카드
        const cardW = Math.round((CW - gap * 2) / 3);
        const cardH = Math.round(MM_TO_PX(28));
        scores.forEach((sc, i) => {
          const cx2 = MG + i * (cardW + gap);
          setFill(ctx, C.white);
          ctx.fillRect(cx2, cy, cardW, cardH);
          setStroke(ctx, C.border);
          ctx.lineWidth = 1;
          ctx.strokeRect(cx2, cy, cardW, cardH);
          // 레이블
          ctx.fillStyle = C.gray600;
          ctx.font = `${Math.round(MM_TO_PX(3.2))}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(sc.label, cx2 + cardW / 2, cy + Math.round(MM_TO_PX(9)));
          // 점수
          const scoreCol = sc.value >= 85 ? C.green : sc.value >= 70 ? '#ca8a04' : C.primary;
          ctx.fillStyle = scoreCol;
          ctx.font = `bold ${Math.round(MM_TO_PX(9))}px Arial, sans-serif`;
          ctx.fillText(String(sc.value), cx2 + cardW / 2, cy + Math.round(MM_TO_PX(21)));
          ctx.textAlign = 'left';
        });
        // 평균 배지
        const badgeW = Math.round(MM_TO_PX(28));
        const badgeH = Math.round(MM_TO_PX(10));
        const badgeX = MG + CW - badgeW;
        const badgeY = cy - badgeH / 2 - gap / 2;
        setFill(ctx, C.primary);
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
        ctx.fill();
        ctx.fillStyle = C.white;
        ctx.font = `bold ${Math.round(MM_TO_PX(3))}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`평균 ${pdfAvgScore}점`, badgeX + badgeW / 2, badgeY + badgeH * 0.65);
        ctx.textAlign = 'left';
        cy += cardH + gap;

        return cy;
      }, yMM);
      yMM += headerH;

      function checkPage(neededMM: number) {
        if (yMM + neededMM > 285) { pdf.addPage(); yMM = 10; }
      }

      // ── 섹션 블록 그리기 (한글 canvas) ────────────────────────
      function drawKoreanSection(
        title: string,
        lines: string[],
        accentColor: string,
        bullets?: string[]
      ) {
        const fontPx = Math.round(MM_TO_PX(3.7));
        const lineH = Math.round(fontPx * 1.65);
        const titleFontPx = Math.round(MM_TO_PX(3.5));
        const totalLines = lines.length;
        const innerH = Math.round(MM_TO_PX(8)) + totalLines * lineH + Math.round(MM_TO_PX(4));
        const sectionMM = (innerH / DPI) * (25.4 / 96) + 6;
        checkPage(sectionMM);

        const h = drawCanvasBlock(pdf, (ctx) => {
          const accentBarW = Math.round(MM_TO_PX(2));
          setFill(ctx, accentColor);
          ctx.fillRect(MG, 0, accentBarW, innerH);
          setFill(ctx, C.white);
          ctx.fillRect(MG + accentBarW, 0, CW - accentBarW, innerH);
          setStroke(ctx, C.border);
          ctx.lineWidth = 0.8;
          ctx.strokeRect(MG + accentBarW, 0, CW - accentBarW, innerH);
          // 제목
          ctx.fillStyle = accentColor;
          ctx.font = `bold ${titleFontPx}px Arial, sans-serif`;
          ctx.fillText(title, MG + Math.round(MM_TO_PX(4)), Math.round(MM_TO_PX(7)));
          // 내용
          ctx.fillStyle = C.gray600;
          ctx.font = `${fontPx}px Arial, sans-serif`;
          lines.forEach((line, i) => {
            const lx = MG + Math.round(MM_TO_PX(bullets ? 6 : 4));
            const ly = Math.round(MM_TO_PX(11)) + i * lineH;
            if (bullets && bullets[i]) {
              ctx.fillStyle = accentColor;
              ctx.fillText(bullets[i], MG + Math.round(MM_TO_PX(3.5)), ly);
              ctx.fillStyle = C.gray600;
            }
            ctx.fillText(line, lx, ly);
          });
          return innerH;
        }, yMM);
        yMM += h + 4;
      }

      // 총평 섹션
      const feedbackText = evaluation.overallFeedback || '';
      const feedbackFontPx = Math.round(MM_TO_PX(3.7));
      const feedbackLines = measureWrappedLines(feedbackText, feedbackFontPx, CW - Math.round(MM_TO_PX(8)));
      drawKoreanSection('AI 선생님의 총평', feedbackLines, C.primary);

      // 잘한 점
      const strengthItems: string[] = evaluation.strengths || [];
      const strengthLines: string[] = [];
      const strengthBullets: string[] = [];
      strengthItems.forEach((item) => {
        const wrapped = measureWrappedLines(item, feedbackFontPx, CW - Math.round(MM_TO_PX(12)));
        wrapped.forEach((l, li) => {
          strengthLines.push(l);
          strengthBullets.push(li === 0 ? '✓' : '');
        });
      });
      drawKoreanSection('잘한 점 (Strengths)', strengthLines, C.green, strengthBullets);

      // 개선할 점
      const improvItems: string[] = evaluation.improvements || [];
      const improvLines: string[] = [];
      const improvBullets: string[] = [];
      improvItems.forEach((item) => {
        const wrapped = measureWrappedLines(item, feedbackFontPx, CW - Math.round(MM_TO_PX(12)));
        wrapped.forEach((l, li) => {
          improvLines.push(l);
          improvBullets.push(li === 0 ? '→' : '');
        });
      });
      drawKoreanSection('개선할 점 (Improvements)', improvLines, C.blue, improvBullets);

      // ── 푸터 ───────────────────────────────────────────────
      checkPage(14);
      pdf.setDrawColor(C.border);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN_MM, yMM + 4, PAGE_W_MM - MARGIN_MM, yMM + 4);
      pdf.setTextColor(C.gray400);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI Debate', PAGE_W_MM / 2, yMM + 10, { align: 'center' });

      const safeTitle = (debate?.topicTitle || '결과').replace(/[\\/:*?"<>|]/g, '_').slice(0, 30);
      pdf.save(`토론결과_${safeTitle}_${dateStr}.pdf`);
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

  function getResultBanner(avgScore: number) {
    if (avgScore >= 85) return { emoji: '🏆', text: '훌륭한 토론이었어요!', sub: '논리적이고 풍부한 근거로 최고의 토론을 보여줬어요.' };
    if (avgScore >= 70) return { emoji: '👏', text: '잘 해냈어요!', sub: '좋은 토론을 완료했어요. 조금만 더 연습하면 더 나아질 거예요.' };
    if (avgScore >= 50) return { emoji: '💪', text: '토론을 완료했어요!', sub: '참여해줘서 고마워요. 더 많은 근거를 준비하면 훨씬 나아질 거예요.' };
    return { emoji: '📝', text: '토론을 마쳤어요', sub: '다음 토론에서는 더 구체적인 주장과 근거를 준비해보세요.' };
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
  const banner = getResultBanner(avgScore);
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
            {/* Result Banner */}
            <div className="text-center mb-8 animate-fade-in-up">
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 shadow-medium animate-bounce-subtle ${
                avgScore >= 85 ? 'bg-gradient-secondary' :
                avgScore >= 70 ? 'bg-gradient-accent' :
                avgScore >= 50 ? 'bg-gradient-primary' :
                'bg-gray-400'
              }`}>
                <Trophy className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">
                  {avgScore >= 85 ? '최고 토론자!' : avgScore >= 70 ? '토론 완료!' : avgScore >= 50 ? '토론 완료' : '토론 마침'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-3">
                {banner.emoji} {banner.text}
              </h1>
              <p className="text-base text-text-secondary mb-1">{banner.sub}</p>
              <p className="text-lg text-text-secondary font-medium">
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
