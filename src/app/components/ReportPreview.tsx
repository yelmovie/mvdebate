import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../lib/api';
import {
  ArrowLeft, Download, Users, MessageSquare, Clock,
  TrendingUp, Award, Medal, Trophy, Check, Sparkles, RotateCcw
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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

  // AI ?? ??
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

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
          { name: '??', value: 59, color: '#10b981' },
          { name: '??', value: 41, color: '#f43f5e' },
        ],
        topTopics: [
          { rank: 1, title: '???? ???? ?? ??', count: 32 },
          { rank: 2, title: '?? ???', count: 28 },
          { rank: 3, title: '??? ??? ??', count: 24 },
        ],
        averageScores: { logic: 4.2, evidence: 3.8, engagement: 4.5 },
        summary: {
          filterCondition: '?? ?? (2024??? 2??)',
          mainAchievements:
            '???? AI?? 1:1 ??? ?? ??? ???? ??? ?? ??? ?? ???????.',
          participation:
            '?? ??? 92%? ?? 2? ?? ??? ?????, ?? ?? ??? 12.5??????.',
        },
      });
      return;
    }

    try {
      const data = await apiCall('/teacher/report');
      setReportData({
        ...data,
        positionRatio: data.positionRatio || [
          { name: '??', value: 50, color: '#22c55e' },
          { name: '??', value: 50, color: '#ec4899' },
        ],
        topTopics: data.topTopics || [],
        averageScores: data.averageScores || { logic: 4.0, evidence: 4.0, engagement: 4.0 },
        summary: data.summary || {
          filterCondition: '?? ??',
          mainAchievements: '???? ????.',
          participation: '???? ????.',
        },
      });
    } catch (error) {
      console.error('Error loading report:', error);
      setReportData({
        positionRatio: [
          { name: '??', value: 50, color: '#22c55e' },
          { name: '??', value: 50, color: '#ec4899' },
        ],
        topTopics: [],
        averageScores: { logic: 4.0, evidence: 4.0, engagement: 4.0 },
        summary: {
          filterCondition: '?? ??',
          mainAchievements: '???? ??? ? ????.',
          participation: '???? ??? ? ????.',
        },
      });
    }
  }

  // ?? AI ?? ????????????????????????????????????????????
  async function handleAiSummary() {
    if (!reportData) return;
    setAiLoading(true);
    setAiError('');
    setAiSummary('');
    try {
      const res = await apiCall('/ai-summary', {
        method: 'POST',
        body: JSON.stringify({ reportData }),
      });
      setAiSummary(res.summary ?? '??? ?? ?????.');
    } catch (err: any) {
      const msg: string = err?.message ?? 'AI ?? ?? ? ??? ??????.';
      if (msg.includes('??? ??')) {
        setAiError('??? ??? ?????. OpenAI API Key? ??? ???? ?????.');
      } else {
        setAiError(msg);
      }
    } finally {
      setAiLoading(false);
    }
  }

  // ?? PDF ???? ????????????????????????????????????????
  async function handleDownloadPDF() {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const element = reportRef.current;

      const styleEl = document.createElement('style');
      styleEl.textContent = `
        [data-pdf-export] { background: #ffffff !important; }
        [data-pdf-export] .text-white { color: #ffffff !important; }
        [data-pdf-export] .bg-white { background-color: #ffffff !important; }
        [data-pdf-export] .bg-gray-200 { background-color: #e5e7eb !important; }
      `;
      document.head.appendChild(styleEl);
      element.setAttribute('data-pdf-export', 'true');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      element.removeAttribute('data-pdf-export');
      document.head.removeChild(styleEl);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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

      pdf.save(`AI?????_????_${new Date().toLocaleDateString()}.pdf`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('PDF ?? ? ??? ??????. ?? ??????.');
    } finally {
      setDownloading(false);
    }
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-medium">텍스트</p>
        </div>
      </div>
    );
  }

  const medalIcons = [
    <Trophy className="w-6 h-6 text-yellow-500" key="gold" />,
    <Medal className="w-6 h-6 text-gray-400" key="silver" />,
    <Award className="w-6 h-6 text-orange-600" key="bronze" />,
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary" />
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-accent" />

      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-gradient-secondary text-white px-8 py-4 rounded-full shadow-strong flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-bold text-lg">PDF ???? ??! ??</span>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* ?? ????? */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border print:bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium print:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
              버튼
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-3 px-6 py-3 border-2 border-primary text-primary rounded-full hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all font-semibold disabled:opacity-50 print:hidden"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'PDF ?? ?...' : 'PDF? ????'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div ref={reportRef} className="bg-white rounded-3xl shadow-strong p-8 sm:p-12 print:shadow-none print:rounded-none">

            {/* ?? */}
            <div className="text-center mb-12 print:mb-8">
              <div className="inline-block px-6 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold mb-4">
                텍스트
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-3">AI? ????! ??</h1>
              <p className="text-text-secondary text-lg">
                ???: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* ?? ?? 4? */}
            <div className="grid grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 print:break-inside-avoid">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-soft mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-blue-700 mb-2">텍스트</p>
                <p className="text-4xl font-bold text-blue-700">{reportData.totalParticipants}회</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200 print:break-inside-avoid">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-purple-700 mb-2">텍스트</p>
                <p className="text-4xl font-bold text-purple-700">{reportData.totalSessions}회</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200 print:break-inside-avoid">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-soft mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-green-700 mb-2">텍스트</p>
                <p className="text-4xl font-bold text-green-700">{reportData.averageDebateTime}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-6 border-2 border-pink-200 print:break-inside-avoid">
                <p className="text-sm font-semibold text-pink-700 mb-4">텍스트</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={80}>
                      <RechartsPieChart>
                        <Pie data={reportData.positionRatio} cx="50%" cy="50%" innerRadius={20} outerRadius={35} paddingAngle={3} dataKey="value">
                          {reportData.positionRatio.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">{reportData.positionRatio[0].value}%</div>
                    <div className="text-xs text-green-600 mb-2">텍스트</div>
                    <div className="text-2xl font-bold text-pink-600 mb-1">{reportData.positionRatio[1].value}%</div>
                    <div className="text-xs text-pink-600">텍스트</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ?? ?? ?? */}
            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                텍스트
              </h2>
              <div className="bg-white border-2 border-border rounded-3xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-green-600">?? {reportData.positionRatio[0].value}%</span>
                  <span className="text-sm font-semibold text-pink-600">?? {reportData.positionRatio[1].value}%</span>
                </div>
                <div className="flex w-full h-8 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white text-sm font-bold"
                    style={{ width: `${reportData.positionRatio[0].value}%` }}
                  >
                    {reportData.positionRatio[0].value}%
                  </div>
                  <div
                    className="bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold"
                    style={{ width: `${reportData.positionRatio[1].value}%` }}
                  >
                    {reportData.positionRatio[1].value}%
                  </div>
                </div>
              </div>
            </div>

            {/* ?? ?? TOP 3 */}
            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                ?? ?? TOP 3
              </h2>
              <div className="space-y-4">
                {reportData.topTopics.map((topic: any, index: number) => (
                  <div key={index} className="bg-white border-2 border-border rounded-3xl p-6 hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        'bg-gradient-to-br from-orange-400 to-orange-600'
                      }`}>
                        {medalIcons[index]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-text-primary mb-1 truncate">{topic.title}</h3>
                        <p className="text-sm text-text-secondary">{topic.count}? ??</p>
                      </div>
                      <div className="flex-shrink-0 px-4 py-2 bg-gradient-primary text-white rounded-full font-bold shadow-soft">
                        #{topic.rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ?? ?? ?? */}
            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                텍스트
              </h2>
              <div className="bg-white border-2 border-border rounded-3xl p-6">
                <div className="space-y-4">
                  {[
                    { label: '?? ???', key: 'logic', color: 'bg-gradient-primary', textColor: 'text-primary' },
                    { label: '?? ??', key: 'evidence', color: 'bg-gradient-secondary', textColor: 'text-secondary' },
                    { label: '?? ???', key: 'engagement', color: 'bg-gradient-accent', textColor: 'text-accent' },
                  ].map(({ label, key, color, textColor }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-primary">{label}</span>
                        <span className={`text-lg font-bold ${textColor}`}>{reportData.averageScores[key]} / 5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${color} h-3 rounded-full transition-all`}
                          style={{ width: `${(reportData.averageScores[key] / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ?? ?? */}
            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-text-primary mb-4">텍스트</h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-border">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase">텍스트</h3>
                    <p className="text-base text-text-primary">{reportData.summary.filterCondition}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase">텍스트</h3>
                    <p className="text-base text-text-primary leading-relaxed">{reportData.summary.mainAchievements}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase">텍스트</h3>
                    <p className="text-base text-text-primary leading-relaxed">{reportData.summary.participation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI ?? ?? */}
            <div className="mb-12 print:break-inside-avoid">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI ??
                </h2>
                <button
                  onClick={handleAiSummary}
                  disabled={aiLoading}
                  className="print:hidden flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all disabled:opacity-50 bg-gradient-primary text-white shadow-soft hover:shadow-glow"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ?? ?...
                    </>
                  ) : aiSummary ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      텍스트
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI ?? ??
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-8 border-2 border-orange-100 min-h-[120px]">
                {aiLoading && (
                  <div className="flex items-center gap-3 text-text-secondary">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium">AI? ?? ??? ???? ????...</span>
                  </div>
                )}
                {aiError && !aiLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-red-600 font-semibold mb-1">텍스트</p>
                      <p className="text-red-500 text-sm leading-relaxed break-keep">{aiError}</p>
                      <button
                        onClick={handleAiSummary}
                        className="mt-3 flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        버튼
                      </button>
                    </div>
                  </div>
                )}
                {aiSummary && !aiLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-text-primary leading-relaxed whitespace-pre-wrap break-keep">{aiSummary}</p>
                  </div>
                )}
                {!aiSummary && !aiLoading && !aiError && (
                  <p className="text-text-secondary text-sm break-keep">
                    ?? <span className="font-semibold text-primary">AI ?? ??</span> ??? ????
                    ?? ???? ???? AI? ??? ???? ?????.
                  </p>
                )}
              </div>
            </div>

            {/* ?? */}
            <div className="text-center pt-8 border-t-2 border-border">
              <p className="text-sm font-semibold text-text-secondary mb-2">AI? ????! � ?? ?? ???</p>
              <p className="text-xs text-text-secondary">
                ? ???? {new Date().toLocaleDateString('ko-KR')}? ???????
              </p>
            </div>
          </div>

          {/* ?? PDF ?? */}
          <div className="mt-8 text-center print:hidden">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-medium hover:shadow-glow ${
                downloading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-primary text-white animate-pulse-subtle'
              }`}
            >
              <Download className="w-6 h-6" />
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  PDF ?? ?...
                </>
              ) : 'PDF? ????'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; }
          .print\\:mb-8 { margin-bottom: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
