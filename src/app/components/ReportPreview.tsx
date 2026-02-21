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
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;
      const MARGIN = 18;
      const CONTENT_W = W - MARGIN * 2;
      let y = 0;

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

      function splitText(text: string, maxW: number, fontSize: number): string[] {
        pdf.setFontSize(fontSize);
        return pdf.splitTextToSize(text, maxW);
      }

      function checkPageBreak(needed: number) {
        if (y + needed > 277) { pdf.addPage(); y = MARGIN; }
      }

      function drawSection(title: string, accentColor: string, drawContent: () => number) {
        const contentH = drawContent();
        const boxH = 10 + contentH + 6;
        checkPageBreak(boxH + 6);
        pdf.setFillColor(accentColor);
        pdf.rect(MARGIN, y, 3, boxH, 'F');
        pdf.setFillColor(C.white);
        pdf.setDrawColor(C.border);
        pdf.setLineWidth(0.3);
        pdf.rect(MARGIN + 3, y, CONTENT_W - 3, boxH, 'FD');
        pdf.setTextColor(accentColor);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, MARGIN + 8, y + 7);
        const innerY = y + 13;
        drawContent(innerY);
        y += boxH + 5;
      }

      // ── 헤더 ──────────────────────────────────────────────
      pdf.setFillColor(C.primary);
      pdf.rect(0, 0, W, 38, 'F');
      pdf.setTextColor(C.white);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Debate', MARGIN, 16);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('학급 운영 결과 리포트', MARGIN, 23);
      const dateStr = new Date().toLocaleDateString('ko-KR');
      pdf.setFontSize(8);
      pdf.text(dateStr, W - MARGIN, 23, { align: 'right' });
      y = 48;

      // ── 통계 카드 4개 ─────────────────────────────────────
      const stats = [
        { label: '총 참여 학생', value: `${reportData.totalParticipants}명`, color: C.blue },
        { label: '총 토론 세션', value: `${reportData.totalSessions}회`, color: C.purple },
        { label: '평균 토론 길이', value: `${reportData.averageDebateTime}턴`, color: C.green },
        { label: '찬성 / 반대', value: `${reportData.positionRatio[0]?.value ?? 0}% / ${reportData.positionRatio[1]?.value ?? 0}%`, color: C.pink },
      ];
      const cardW = (CONTENT_W - 6) / 4;
      stats.forEach((st, i) => {
        const cx = MARGIN + i * (cardW + 2);
        pdf.setFillColor(C.white);
        pdf.setDrawColor(C.border);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(cx, y, cardW, 24, 2, 2, 'FD');
        pdf.setFillColor(st.color);
        pdf.rect(cx, y, cardW, 3, 'F');
        pdf.setTextColor(C.gray400);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(st.label, cx + cardW / 2, y + 9, { align: 'center' });
        pdf.setTextColor(st.color);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text(st.value, cx + cardW / 2, y + 20, { align: 'center' });
      });
      y += 32;

      // ── 입장 비율 바 ───────────────────────────────────────
      checkPageBreak(22);
      pdf.setTextColor(C.gray900);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('입장 비율', MARGIN, y + 5);

      const proVal = reportData.positionRatio[0]?.value ?? 50;
      const conVal = reportData.positionRatio[1]?.value ?? 50;
      const barY = y + 9;
      const barH = 6;
      const proW = (CONTENT_W * proVal) / 100;

      pdf.setFillColor(C.green);
      pdf.roundedRect(MARGIN, barY, proW, barH, 1, 1, 'F');
      pdf.setFillColor(C.pink);
      pdf.roundedRect(MARGIN + proW, barY, CONTENT_W - proW, barH, 1, 1, 'F');

      pdf.setTextColor(C.green);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`찬성 ${proVal}%`, MARGIN, barY + barH + 5);
      pdf.setTextColor(C.pink);
      pdf.text(`반대 ${conVal}%`, W - MARGIN, barY + barH + 5, { align: 'right' });
      y += 30;

      // ── 인기 주제 TOP 3 ────────────────────────────────────
      if (reportData.topTopics?.length > 0) {
        checkPageBreak(10 + reportData.topTopics.length * 12 + 6);
        pdf.setFillColor(C.primary);
        pdf.rect(MARGIN, y, 3, 10 + reportData.topTopics.length * 12 + 6, 'F');
        pdf.setFillColor(C.white);
        pdf.setDrawColor(C.border);
        pdf.setLineWidth(0.3);
        pdf.rect(MARGIN + 3, y, CONTENT_W - 3, 10 + reportData.topTopics.length * 12 + 6, 'FD');
        pdf.setTextColor(C.primary);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('인기 주제 TOP 3', MARGIN + 8, y + 7);
        const medals = ['#f59e0b', '#9ca3af', '#ea580c'];
        reportData.topTopics.slice(0, 3).forEach((topic: any, i: number) => {
          const rowY = y + 13 + i * 12;
          pdf.setFillColor(medals[i]);
          pdf.circle(MARGIN + 13, rowY + 3, 3.5, 'F');
          pdf.setTextColor(C.white);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.text(String(i + 1), MARGIN + 13, rowY + 4.5, { align: 'center' });
          pdf.setTextColor(C.gray900);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          const titleLines = splitText(topic.title, CONTENT_W - 30, 9);
          pdf.text(titleLines[0] || '', MARGIN + 20, rowY + 4);
          pdf.setTextColor(C.gray400);
          pdf.setFontSize(7.5);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${topic.count}회 토론`, W - MARGIN - 4, rowY + 4, { align: 'right' });
        });
        y += 10 + reportData.topTopics.length * 12 + 11;
      }

      // ── 평균 평가 점수 ─────────────────────────────────────
      const scoreItems = [
        { label: '주장 명확성', value: reportData.averageScores?.logic ?? 0, color: C.primary },
        { label: '근거 사용', value: reportData.averageScores?.evidence ?? 0, color: C.green },
        { label: '주제 충실도', value: reportData.averageScores?.engagement ?? 0, color: C.blue },
      ];
      const scoreBoxH = 10 + scoreItems.length * 12 + 6;
      checkPageBreak(scoreBoxH + 6);
      pdf.setFillColor(C.blue);
      pdf.rect(MARGIN, y, 3, scoreBoxH, 'F');
      pdf.setFillColor(C.white);
      pdf.setDrawColor(C.border);
      pdf.setLineWidth(0.3);
      pdf.rect(MARGIN + 3, y, CONTENT_W - 3, scoreBoxH, 'FD');
      pdf.setTextColor(C.blue);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('평균 평가 점수', MARGIN + 8, y + 7);
      scoreItems.forEach((si, i) => {
        const rowY = y + 13 + i * 12;
        pdf.setTextColor(C.gray600);
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(si.label, MARGIN + 8, rowY + 4);
        pdf.setTextColor(si.color);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${si.value} / 5`, W - MARGIN - 4, rowY + 4, { align: 'right' });
        const barW2 = CONTENT_W - 20;
        pdf.setFillColor(C.border);
        pdf.roundedRect(MARGIN + 8, rowY + 6, barW2, 3, 1, 1, 'F');
        pdf.setFillColor(si.color);
        pdf.roundedRect(MARGIN + 8, rowY + 6, barW2 * (si.value / 5), 3, 1, 1, 'F');
      });
      y += scoreBoxH + 5;

      // ── 운영 요약 ──────────────────────────────────────────
      const summaryItems = [
        { label: '필터 조건', text: reportData.summary?.filterCondition || '' },
        { label: '주요 성과', text: reportData.summary?.mainAchievements || '' },
        { label: '참여도 분석', text: reportData.summary?.participation || '' },
      ];
      summaryItems.forEach(({ label, text }) => {
        if (!text) return;
        const lines = splitText(text, CONTENT_W - 10, 9);
        const boxH = 10 + lines.length * 5 + 6;
        checkPageBreak(boxH + 6);
        pdf.setFillColor(C.purple);
        pdf.rect(MARGIN, y, 3, boxH, 'F');
        pdf.setFillColor(C.white);
        pdf.setDrawColor(C.border);
        pdf.setLineWidth(0.3);
        pdf.rect(MARGIN + 3, y, CONTENT_W - 3, boxH, 'FD');
        pdf.setTextColor(C.purple);
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, MARGIN + 8, y + 7);
        pdf.setTextColor(C.gray600);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        lines.forEach((line, li) => pdf.text(line, MARGIN + 8, y + 13 + li * 5));
        y += boxH + 5;
      });

      // ── 푸터 ───────────────────────────────────────────────
      checkPageBreak(14);
      pdf.setDrawColor(C.border);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN, y + 4, W - MARGIN, y + 4);
      pdf.setTextColor(C.gray400);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI Debate — 토론으로 더 나은 생각을', W / 2, y + 10, { align: 'center' });

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
