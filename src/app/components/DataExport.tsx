import React, { useState } from 'react';
import { 
  ArrowLeft, Download, FileText, CheckCircle, Calendar,
  Users, TrendingUp, MessageSquare, Trophy, Clock
} from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';

interface DataExportProps {
  onBack: () => void;
  demoMode?: boolean;
}

type ExportType = 'students' | 'debates' | 'scores' | 'activity' | 'full';

export default function DataExport({ onBack, demoMode = false }: DataExportProps) {
  const { showAlert } = useAlert();
  const [selectedType, setSelectedType] = useState<ExportType>('students');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    { id: '1', type: '학생 명단', date: '2026-02-15 14:30', size: '820 KB' },
    { id: '2', type: '토론 기록', date: '2026-02-14 09:15', size: '1.2 MB' },
    { id: '3', type: '전체 데이터', date: '2026-02-10 16:45', size: '2.3 MB' }
  ]);

  const typeNames: Record<ExportType, string> = {
    students: '학생 명단',
    debates: '토론 기록',
    scores: '점수 데이터',
    activity: '활동 내역',
    full: '전체 데이터'
  };

  async function handleExport() {
    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newExport = {
          id: Date.now().toString(),
          type: typeNames[selectedType],
          date: new Date().toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          }),
          size: `${Math.floor(Math.random() * 1500) + 300} KB`
        };
        setExportHistory([newExport, ...exportHistory]);
        showAlert(`${typeNames[selectedType]} PDF가 성공적으로 내보내기 되었습니다.`, 'success');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        format: 'pdf',
        type: selectedType,
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      });

      const response = await apiCall(`/teacher/export?${params.toString()}`);
      const blob = new Blob([response.data], { type: response.contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showAlert('PDF가 성공적으로 내보내기 되었습니다.', 'success');
    } catch (error: any) {
      console.error('Export error:', error);
      showAlert(error.message || 'PDF 내보내기에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const exportOptions = [
    {
      type: 'students' as ExportType,
      title: '학생 명단',
      description: '학생 이름, 이메일, 가입일 등 기본 정보',
      icon: Users,
      color: 'from-blue-400 to-blue-500'
    },
    {
      type: 'debates' as ExportType,
      title: '토론 기록',
      description: '모든 토론 세션의 상세 내역',
      icon: MessageSquare,
      color: 'from-green-400 to-green-500'
    },
    {
      type: 'scores' as ExportType,
      title: '점수 데이터',
      description: '학생별 점수 및 평가 결과',
      icon: Trophy,
      color: 'from-yellow-400 to-yellow-500'
    },
    {
      type: 'activity' as ExportType,
      title: '활동 내역',
      description: '학생들의 참여 기록 및 통계',
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-500'
    },
    {
      type: 'full' as ExportType,
      title: '전체 데이터',
      description: '모든 데이터를 포함한 완전한 백업',
      icon: FileText,
      color: 'from-pink-400 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-secondary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-primary"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-text-secondary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">데이터 내보내기</h1>
                  <p className="text-sm text-text-secondary">학급 데이터를 PDF로 저장하세요</p>
                </div>
              </div>
              {/* PDF 뱃지 */}
              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">PDF 형식</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Data Type Selection */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border animate-fade-in-up">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  내보낼 데이터 선택
                </h3>
                <div className="grid gap-3">
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => setSelectedType(option.type)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedType === option.type
                            ? 'border-secondary bg-secondary/5 shadow-medium'
                            : 'border-border hover:border-secondary/50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-text-primary">{option.title}</h4>
                              {selectedType === option.type && (
                                <CheckCircle className="w-5 h-5 text-secondary" />
                              )}
                            </div>
                            <p className="text-sm text-text-secondary">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  기간 설정 <span className="text-sm font-normal text-text-secondary">(선택사항)</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">시작일</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">종료일</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                {dateRange.start && dateRange.end && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-2xl">
                    <p className="text-sm text-accent font-semibold">
                      📅 {dateRange.start} ~ {dateRange.end} 기간의 데이터가 내보내기됩니다
                    </p>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-bold text-lg shadow-medium disabled:opacity-50 animate-fade-in-up"
                style={{ animationDelay: '200ms' }}
              >
                <Download className="w-6 h-6" />
                {loading ? 'PDF 생성 중...' : 'PDF로 내보내기'}
              </button>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* PDF 안내 카드 */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-6 border-2 border-primary/20 shadow-soft animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-text-primary">PDF 내보내기</h3>
                </div>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">✓</span>
                    <span>인쇄 및 공유에 최적화된 문서 형식</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">✓</span>
                    <span>보고서 형태로 보관 및 제출 가능</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">✓</span>
                    <span>어떤 기기에서도 동일하게 표시</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">✓</span>
                    <span>학부모 상담 자료로 활용 가능</span>
                  </li>
                </ul>
              </div>

              {/* Export History */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  내보내기 기록
                </h3>
                <div className="space-y-3">
                  {exportHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-primary text-sm">{item.type}</h4>
                          <p className="text-xs text-text-secondary">{item.date}</p>
                        </div>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          PDF
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary">{item.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
