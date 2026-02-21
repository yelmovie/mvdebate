import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/supabase';
import { ArrowLeft, Download, Users, MessageSquare, Clock, 
  TrendingUp, Award, Medal, Trophy, Check
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import { useAlert } from './AlertProvider';

interface ReportPreviewProps {
  onBack: () => void;
  demoMode?: boolean;
}

export default function ReportPreview({ onBack, demoMode = false }: ReportPreviewProps) {
  const { showAlert } = useAlert();
  const [reportData, setReportData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    if (demoMode) {
      setReportData({
        totalParticipants: 48,
        totalSessions: 156,
        averageDebateTime: 12.5,
        positionRatio: [
          { name: '찬성', value: 59, color: '#10b981' },
          { name: '반대', value: 41, color: '#f43f5e' }
        ],
        topTopics: [
          { rank: 1, title: '학교에서 스마트폰 사용 허용', count: 32 },
          { rank: 2, title: '교복 자율화', count: 28 },
          { rank: 3, title: '온라인 수업의 효과', count: 24 }
        ],
        averageScores: {
          logic: 4.2,
          evidence: 3.8,
          engagement: 4.5
        },
        summary: {
          filterCondition: '전체 학급 (2024학년도 2학기)',
          mainAchievements: '학생들이 AI와의 1:1 토론을 통해 논리적 사고력과 비판적 사고 능력을 크게 향상시켰습니다. 특히 근거 제시와 반론 대응 능력이 눈에 띄게 개선되었습니다.',
          participation: '전체 학생의 92%가 최소 2회 이상 토론에 참여했으며, 평균 토론 길이는 12.5턴으로 활발한 토론이 이루어졌습니다.'
        }
      });
      return;
    }

    try {
      const data = await apiCall('/teacher/report');
      const safeData = {
        ...data,
        positionRatio: data.positionRatio || [
          { name: '찬성', value: 50, color: '#22c55e' },
          { name: '반대', value: 50, color: '#ec4899' }
        ],
        topTopics: data.topTopics || [],
        topStudents: data.topStudents || [],
        recentDebates: data.recentDebates || [],
        statistics: data.statistics || {
          totalStudents: 0,
          totalDebates: 0,
          averageScore: 0,
          participationRate: 0,
          averageTurns: 0
        },
        averageScores: data.averageScores || {
          logic: 4.0,
          evidence: 4.0,
          engagement: 4.0
        },
        summary: data.summary || {
          filterCondition: '전체 학급',
          mainAchievements: '데이터가 없습니다.',
          participation: '데이터가 없습니다.'
        }
      };
      setReportData(safeData);
    } catch (error) {
      console.error('Error loading report:', error);
      setReportData({
        positionRatio: [
          { name: '찬성', value: 50, color: '#22c55e' },
          { name: '반대', value: 50, color: '#ec4899' }
        ],
        topTopics: [],
        topStudents: [],
        recentDebates: [],
        statistics: {
          totalStudents: 0,
          totalDebates: 0,
          averageScore: 0,
          participationRate: 0,
          averageTurns: 0
        },
        averageScores: {
          logic: 4.0,
          evidence: 4.0,
          engagement: 4.0
        },
        summary: {
          filterCondition: '전체 학급',
          mainAchievements: '데이터를 불러올 수 없습니다.',
          participation: '데이터를 불러올 수 없습니다.'
        }
      });
    }
  }

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      // ── Canvas 기반 한글 렌더링 (jsPDF 기본 폰트는 한글 미지원) ──
      const DPI = 3;
      const PAGE_W_MM = 210;
      const MARGIN_MM = 18;
      const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
      const MM_TO_PX = (mm: number) => mm * DPI * (96 / 25.4);

      const canvasW = Math.round(MM_TO_PX(PAGE_W_MM));

      const C = {
        primary: '#E8734A',
        green: '#16a34a',
        blue: '#1d4ed8',
        purple: '#7c3aed',
        pink: '#db2777',
        gray900: '#111827',
        gray600: '#4b5563',
        gray400: '#9ca3af',
        border: '#e5e7eb',
        bgLight: '#f9fafb',
        white: '#ffffff',
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

      // 텍스트 줄바꿈 측정
      function measureWrappedLines(
        text: string,
        fontPx: number,
        maxWidthPx: number
      ): string[] {
        if (!text) return [''];
        const tc = document.createElement('canvas');
        const ctx = tc.getContext('2d')!;
        ctx.font = `${fontPx}px Arial, sans-serif`;
        const chars = text.split('');
        const lines: string[] = [];
        let cur = '';
        for (const ch of chars) {
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
        tmpCanvas.height = 5000;
        const ctx = tmpCanvas.getContext('2d')!;
        const heightPx = renderFn(ctx, canvasW);
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvasW;
        finalCanvas.height = Math.max(1, Math.ceil(heightPx));
        const fCtx = finalCanvas.getContext('2d')!;
        fCtx.drawImage(tmpCanvas, 0, 0);
        const imgData = finalCanvas.toDataURL('image/png');
        const heightMM = (heightPx / DPI) * (25.4 / 96);
        pdf.addImage(imgData, 'PNG', 0, yMM, PAGE_W_MM, heightMM);
        return heightMM;
      }

      const MG = Math.round(MM_TO_PX(MARGIN_MM));
      const CW = Math.round(MM_TO_PX(CONTENT_W_MM));
      const dateStr = new Date().toLocaleDateString('ko-KR');

      // 데이터 안전하게 추출
      const totalParticipants = reportData.totalParticipants ?? reportData.statistics?.totalStudents ?? 0;
      const totalSessions = reportData.totalSessions ?? reportData.statistics?.totalDebates ?? 0;
      const averageDebateTime = reportData.averageDebateTime ?? reportData.statistics?.averageTurns ?? 0;
      const proVal = reportData.positionRatio?.[0]?.value ?? 50;
      const conVal = reportData.positionRatio?.[1]?.value ?? 50;
      const topTopics: any[] = reportData.topTopics || [];
      const scoreLogic = reportData.averageScores?.logic ?? 0;
      const scoreEvidence = reportData.averageScores?.evidence ?? 0;
      const scoreEngagement = reportData.averageScores?.engagement ?? 0;
      const filterCondition = reportData.summary?.filterCondition || '전체 학급';
      const mainAchievements = reportData.summary?.mainAchievements || '';
      const participation = reportData.summary?.participation || '';

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let yMM = 0;

      function checkPage(neededMM: number) {
        if (yMM + neededMM > 285) { pdf.addPage(); yMM = 10; }
      }

      // ── 1. 헤더 블록 ──────────────────────────────────────
      const headerH = drawCanvasBlock(pdf, (ctx, cW) => {
        const headerPx = Math.round(MM_TO_PX(38));
        setFill(ctx, C.primary);
        ctx.fillRect(0, 0, cW, headerPx);
        ctx.fillStyle = C.white;
        ctx.font = `bold ${Math.round(MM_TO_PX(7))}px Arial, sans-serif`;
        ctx.fillText('AI Debate', MG, Math.round(MM_TO_PX(14)));
        ctx.font = `${Math.round(MM_TO_PX(3.5))}px Arial, sans-serif`;
        ctx.fillText('학급 운영 결과 리포트', MG, Math.round(MM_TO_PX(23)));
        ctx.textAlign = 'right';
        ctx.font = `${Math.round(MM_TO_PX(3))}px Arial, sans-serif`;
        ctx.fillText(dateStr, cW - MG, Math.round(MM_TO_PX(23)));
        ctx.textAlign = 'left';
        return headerPx + Math.round(MM_TO_PX(10));
      }, yMM);
      yMM += headerH;

      // ── 2. 통계 카드 4개 ──────────────────────────────────
      const statsH = drawCanvasBlock(pdf, (ctx, cW) => {
        const stats = [
          { label: '총 참여 학생', value: `${totalParticipants}명`, color: C.blue },
          { label: '총 토론 세션', value: `${totalSessions}회`, color: C.purple },
          { label: '평균 토론 길이', value: `${averageDebateTime}턴`, color: C.green },
          { label: '찬성 / 반대', value: `${proVal}% / ${conVal}%`, color: C.pink },
        ];
        const cardW = Math.round((CW - Math.round(MM_TO_PX(2)) * 3) / 4);
        const cardH = Math.round(MM_TO_PX(24));
        const gap = Math.round(MM_TO_PX(2));
        stats.forEach((st, i) => {
          const cx = MG + i * (cardW + gap);
          setFill(ctx, C.white);
          ctx.fillRect(cx, 0, cardW, cardH);
          setStroke(ctx, C.border);
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, 0, cardW, cardH);
          setFill(ctx, st.color);
          ctx.fillRect(cx, 0, cardW, Math.round(MM_TO_PX(2)));
          // 라벨
          ctx.fillStyle = C.gray400;
          ctx.font = `${Math.round(MM_TO_PX(2.8))}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(st.label, cx + cardW / 2, Math.round(MM_TO_PX(9)));
          // 값
          ctx.fillStyle = st.color;
          ctx.font = `bold ${Math.round(MM_TO_PX(5))}px Arial, sans-serif`;
          ctx.fillText(st.value, cx + cardW / 2, Math.round(MM_TO_PX(19)));
          ctx.textAlign = 'left';
        });
        return cardH + Math.round(MM_TO_PX(4));
      }, yMM);
      yMM += statsH;

      // ── 3. 입장 비율 섹션 ─────────────────────────────────
      checkPage(28);
      const posH = drawCanvasBlock(pdf, (ctx, cW) => {
        let cy = Math.round(MM_TO_PX(4));
        ctx.fillStyle = C.gray900;
        ctx.font = `bold ${Math.round(MM_TO_PX(3.5))}px Arial, sans-serif`;
        ctx.fillText('입장 비율', MG, cy + Math.round(MM_TO_PX(4)));
        cy += Math.round(MM_TO_PX(8));
        const barH = Math.round(MM_TO_PX(6));
        const proW = Math.round(CW * proVal / 100);
        // 찬성 바
        setFill(ctx, C.green);
        ctx.beginPath();
        ctx.roundRect(MG, cy, proW, barH, 4);
        ctx.fill();
        // 반대 바
        setFill(ctx, C.pink);
        ctx.beginPath();
        ctx.roundRect(MG + proW, cy, CW - proW, barH, 4);
        ctx.fill();
        cy += barH + Math.round(MM_TO_PX(4));
        // 라벨
        ctx.fillStyle = C.green;
        ctx.font = `${Math.round(MM_TO_PX(2.8))}px Arial, sans-serif`;
        ctx.fillText(`찬성 ${proVal}%`, MG, cy);
        ctx.fillStyle = C.pink;
        ctx.textAlign = 'right';
        ctx.fillText(`반대 ${conVal}%`, MG + CW, cy);
        ctx.textAlign = 'left';
        cy += Math.round(MM_TO_PX(4));
        return cy;
      }, yMM);
      yMM += posH;

      // ── 한글 섹션 공통 렌더 함수 ──────────────────────────
      function drawKoreanSection(
        title: string,
        lines: string[],
        accentColor: string,
        rows?: Array<{ label: string; value: string; color: string; barRatio?: number }>
      ) {
        const titleFontPx = Math.round(MM_TO_PX(3.5));
        const fontPx = Math.round(MM_TO_PX(3.3));
        const lineH = Math.round(fontPx * 1.7);
        const innerH = Math.round(MM_TO_PX(8))
          + (lines.length > 0 ? lines.length * lineH : 0)
          + (rows ? rows.length * Math.round(MM_TO_PX(9)) : 0)
          + Math.round(MM_TO_PX(4));
        const sectionMM = (innerH / DPI) * (25.4 / 96) + 6;
        checkPage(sectionMM);

        const h = drawCanvasBlock(pdf, (ctx) => {
          const accentW = Math.round(MM_TO_PX(2));
          setFill(ctx, accentColor);
          ctx.fillRect(MG, 0, accentW, innerH);
          setFill(ctx, C.white);
          ctx.fillRect(MG + accentW, 0, CW - accentW, innerH);
          setStroke(ctx, C.border);
          ctx.lineWidth = 0.8;
          ctx.strokeRect(MG + accentW, 0, CW - accentW, innerH);
          // 제목
          ctx.fillStyle = accentColor;
          ctx.font = `bold ${titleFontPx}px Arial, sans-serif`;
          ctx.fillText(title, MG + Math.round(MM_TO_PX(4)), Math.round(MM_TO_PX(7)));
          // 텍스트 줄
          ctx.fillStyle = C.gray600;
          ctx.font = `${fontPx}px Arial, sans-serif`;
          lines.forEach((line, i) => {
            ctx.fillText(line, MG + Math.round(MM_TO_PX(4)), Math.round(MM_TO_PX(12)) + i * lineH);
          });
          // 점수 바 행
          if (rows) {
            rows.forEach((row, i) => {
              const rowY = Math.round(MM_TO_PX(12)) + lines.length * lineH + i * Math.round(MM_TO_PX(9));
              ctx.fillStyle = C.gray600;
              ctx.font = `${Math.round(MM_TO_PX(3.2))}px Arial, sans-serif`;
              ctx.fillText(row.label, MG + Math.round(MM_TO_PX(4)), rowY);
              ctx.fillStyle = row.color;
              ctx.textAlign = 'right';
              ctx.fillText(row.value, MG + CW - Math.round(MM_TO_PX(2)), rowY);
              ctx.textAlign = 'left';
              const bY = rowY + Math.round(MM_TO_PX(2));
              const bW = CW - Math.round(MM_TO_PX(12));
              setFill(ctx, C.border);
              ctx.beginPath(); ctx.roundRect(MG + Math.round(MM_TO_PX(4)), bY, bW, Math.round(MM_TO_PX(2.5)), 2); ctx.fill();
              setFill(ctx, row.color);
              ctx.beginPath(); ctx.roundRect(MG + Math.round(MM_TO_PX(4)), bY, Math.round(bW * (row.barRatio ?? 0)), Math.round(MM_TO_PX(2.5)), 2); ctx.fill();
            });
          }
          return innerH;
        }, yMM);
        yMM += h + 4;
      }

      // ── 4. 인기 주제 TOP 3 ────────────────────────────────
      if (topTopics.length > 0) {
        const topicLines: string[] = [];
        topTopics.slice(0, 3).forEach((topic: any, i: number) => {
          const medal = ['🥇', '🥈', '🥉'][i];
          const titleText = topic.title || '주제 없음';
          const countText = `${topic.count ?? 0}회`;
          const wrapped = measureWrappedLines(`${medal} ${titleText}  (${countText})`, Math.round(MM_TO_PX(3.3)), CW - Math.round(MM_TO_PX(12)));
          wrapped.forEach(l => topicLines.push(l));
        });
        drawKoreanSection('인기 주제 TOP 3', topicLines, C.primary);
      }

      // ── 5. 평균 평가 점수 ─────────────────────────────────
      drawKoreanSection('평균 평가 점수', [], C.blue, [
        { label: '주장 명확성', value: `${scoreLogic} / 5`, color: C.primary, barRatio: scoreLogic / 5 },
        { label: '근거 사용', value: `${scoreEvidence} / 5`, color: C.green, barRatio: scoreEvidence / 5 },
        { label: '주제 충실도', value: `${scoreEngagement} / 5`, color: C.blue, barRatio: scoreEngagement / 5 },
      ]);

      // ── 6. 운영 요약 ──────────────────────────────────────
      if (filterCondition) {
        const lines = measureWrappedLines(filterCondition, Math.round(MM_TO_PX(3.3)), CW - Math.round(MM_TO_PX(12)));
        drawKoreanSection('필터 조건', lines, C.purple);
      }
      if (mainAchievements) {
        const lines = measureWrappedLines(mainAchievements, Math.round(MM_TO_PX(3.3)), CW - Math.round(MM_TO_PX(12)));
        drawKoreanSection('주요 성과', lines, C.green);
      }
      if (participation) {
        const lines = measureWrappedLines(participation, Math.round(MM_TO_PX(3.3)), CW - Math.round(MM_TO_PX(12)));
        drawKoreanSection('참여도 분석', lines, C.blue);
      }

      // ── 7. 푸터 ───────────────────────────────────────────
      checkPage(14);
      drawCanvasBlock(pdf, (ctx, cW) => {
        setStroke(ctx, C.border);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(MG, Math.round(MM_TO_PX(4)));
        ctx.lineTo(cW - MG, Math.round(MM_TO_PX(4)));
        ctx.stroke();
        ctx.fillStyle = C.gray400;
        ctx.font = `${Math.round(MM_TO_PX(2.8))}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('AI Debate — 토론으로 더 나은 생각을', cW / 2, Math.round(MM_TO_PX(10)));
        ctx.textAlign = 'left';
        return Math.round(MM_TO_PX(14));
      }, yMM);

      pdf.save(`AI와토론해요_운영결과_${dateStr}.pdf`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setDownloading(false);
    }
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium">리포트 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const medalIcons = [
    <Trophy className="w-6 h-6 text-yellow-500" />,
    <Medal className="w-6 h-6 text-gray-400" />,
    <Award className="w-6 h-6 text-orange-600" />
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-accent"></div>

      {showSuccess && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-gradient-secondary text-white px-8 py-4 rounded-full shadow-strong flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-bold text-lg">PDF 다운로드 완료! 🎉</span>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="bg-white/80 backdrop-blur-sm border-b border-border print:bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium print:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
              돌아가기
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-3 px-6 py-3 border-2 border-primary text-primary rounded-full hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all font-semibold disabled:opacity-50 print:hidden"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'PDF 생성 중...' : 'PDF로 저장하기'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div ref={reportRef} className="bg-white rounded-3xl shadow-strong p-8 sm:p-12 print:shadow-none print:rounded-none">
            <div className="text-center mb-12 print:mb-8">
              <div className="inline-block px-6 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold mb-4">
                운영 결과 리포트
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-3">
                AI와 토론해요! 📊
              </h1>
              <p className="text-text-secondary text-lg">
                생성일: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 print:break-inside-avoid">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-soft">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-blue-700 mb-2">총 참여 학생 수</p>
                <p className="text-4xl font-bold text-blue-700">{reportData.totalParticipants}명</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200 print:break-inside-avoid">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-purple-700 mb-2">총 토론 세션 수</p>
                <p className="text-4xl font-bold text-purple-700">{reportData.totalSessions}회</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200 print:break-inside-avoid">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-soft">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-700 mb-2">평균 토론 길이</p>
                <p className="text-4xl font-bold text-green-700">{reportData.averageDebateTime}턴</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-6 border-2 border-pink-200 print:break-inside-avoid">
                <p className="text-sm font-semibold text-pink-700 mb-4">찬성 vs 반대 비율</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={80}>
                      <RechartsPieChart>
                        <Pie
                          data={reportData.positionRatio}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={35}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {reportData.positionRatio.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {reportData.positionRatio[0].value}%
                    </div>
                    <div className="text-xs text-green-600 mb-2">찬성</div>
                    <div className="text-2xl font-bold text-pink-600 mb-1">
                      {reportData.positionRatio[1].value}%
                    </div>
                    <div className="text-xs text-pink-600">반대</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                입장 비율 분석
              </h2>
              <div className="bg-white border-2 border-border rounded-3xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-green-600">찬성 {reportData.positionRatio[0].value}%</span>
                  <span className="text-sm font-semibold text-pink-600">반대 {reportData.positionRatio[1].value}%</span>
                </div>
                <div className="flex w-full h-8 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white text-sm font-bold transition-all"
                    style={{ width: `${reportData.positionRatio[0].value}%` }}
                  >
                    {reportData.positionRatio[0].value}%
                  </div>
                  <div
                    className="bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold transition-all"
                    style={{ width: `${reportData.positionRatio[1].value}%` }}
                  >
                    {reportData.positionRatio[1].value}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                인기 주제 TOP 3
              </h2>
              <div className="space-y-4">
                {reportData.topTopics.map((topic: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-border rounded-3xl p-6 hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        'bg-gradient-to-br from-orange-400 to-orange-600'
                      } shadow-soft`}>
                        {medalIcons[index]}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-text-primary mb-1 truncate">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {topic.count}회 토론
                        </p>
                      </div>

                      <div className="flex-shrink-0 px-4 py-2 bg-gradient-primary text-white rounded-full font-bold shadow-soft">
                        #{topic.rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                평균 평가 점수
              </h2>
              <div className="bg-white border-2 border-border rounded-3xl p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-text-primary">주장 명확성</span>
                      <span className="text-lg font-bold text-primary">{reportData.averageScores.logic} / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-primary h-3 rounded-full transition-all"
                        style={{ width: `${(reportData.averageScores.logic / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-text-primary">근거 사용</span>
                      <span className="text-lg font-bold text-secondary">{reportData.averageScores.evidence} / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-secondary h-3 rounded-full transition-all"
                        style={{ width: `${(reportData.averageScores.evidence / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-text-primary">주제 충실도</span>
                      <span className="text-lg font-bold text-accent">{reportData.averageScores.engagement} / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-accent h-3 rounded-full transition-all"
                        style={{ width: `${(reportData.averageScores.engagement / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4">운영 요약</h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-border">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase">필터 조건</h3>
                    <p className="text-base text-text-primary">{reportData.summary.filterCondition}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase">주요 성과</h3>
                    <p className="text-base text-text-primary leading-relaxed">{reportData.summary.mainAchievements}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase">참여도 분석</h3>
                    <p className="text-base text-text-primary leading-relaxed">{reportData.summary.participation}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t-2 border-border">
              <p className="text-sm font-semibold text-text-secondary mb-2">AI와 토론해요! · 운영 결과 리포트</p>
              <p className="text-xs text-text-secondary">
                본 리포트는 {new Date().toLocaleDateString('ko-KR')}에 생성되었습니다
              </p>
            </div>
          </div>

          <div className="mt-8 text-center print:hidden">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-medium hover:shadow-glow ${
                downloading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-primary text-white animate-pulse-subtle'
              }`}
            >
              <Download className="w-6 h-6" />
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  PDF 생성 중...
                </>
              ) : (
                'PDF로 저장하기'
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
          }
          .print\\:mb-8 {
            margin-bottom: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
