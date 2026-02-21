import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/supabase';
import { ArrowLeft, Download, Users, MessageSquare, Clock, 
  TrendingUp, Award, Medal, Trophy, Check
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

            el.style.setProperty('background-image', 'none', 'important');
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

      pdf.save(`AI와토론해요_운영결과_${new Date().toLocaleDateString()}.pdf`);
      
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
